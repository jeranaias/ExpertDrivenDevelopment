// Module 7 — AI Chat Integration with tool use.
//
// When the user asks "how many high-priority items do I have?", we do NOT
// hand the question to OpenAI for a guess. Instead:
//
//   1. POST the message + tool definition to OpenAI's Chat Completions API.
//   2. OpenAI returns a tool_call: lookup_items(priority="high").
//   3. We run that against the DataStore — real data, no hallucination.
//   4. We send the tool result back to OpenAI.
//   5. OpenAI writes the final sentence using the real numbers.
//   6. We return that sentence to the frontend.
//
// Implemented with net/http directly so the dependency surface stays at zero.
package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"heywood-inventory/internal/data"
	"heywood-inventory/internal/middleware"
)

const (
	openAIURL   = "https://api.openai.com/v1/chat/completions"
	openAIModel = "gpt-4o"
)

// ChatService keeps a reference to the DataStore so the lookup_items tool can
// query the same source of truth as the REST handlers.
type ChatService struct {
	apiKey string
	store  data.Store
	client *http.Client
}

func NewChatService(apiKey string, store data.Store) *ChatService {
	return &ChatService{
		apiKey: apiKey,
		store:  store,
		client: &http.Client{Timeout: 60 * time.Second},
	}
}

// Reply runs the full tool-use round trip and returns markdown-ready text.
// `role` is the caller's effective role (admin/staff/user) so tool lookups
// honour the same RBAC the items endpoints do.
func (c *ChatService) Reply(ctx context.Context, userMessage, role string) (string, error) {
	if c.apiKey == "" {
		return "", errors.New("OPENAI_API_KEY not set on the server")
	}

	messages := []chatMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}

	for hop := 0; hop < 4; hop++ {
		resp, err := c.call(ctx, messages)
		if err != nil {
			return "", err
		}
		if len(resp.Choices) == 0 {
			return "", errors.New("openai: no choices returned")
		}
		choice := resp.Choices[0]
		// Append the assistant turn (with any tool_calls) before resolving them.
		messages = append(messages, choice.Message)

		if len(choice.Message.ToolCalls) == 0 {
			return strings.TrimSpace(choice.Message.Content), nil
		}
		for _, call := range choice.Message.ToolCalls {
			result, err := c.runTool(call, role)
			if err != nil {
				result = fmt.Sprintf(`{"error": %q}`, err.Error())
			}
			messages = append(messages, chatMessage{
				Role:       "tool",
				Content:    result,
				ToolCallID: call.ID,
			})
		}
	}
	return "", errors.New("chat: exceeded tool-call hops without a final answer")
}

func (c *ChatService) call(ctx context.Context, messages []chatMessage) (*chatResponse, error) {
	body := chatRequest{
		Model:    openAIModel,
		Messages: messages,
		Tools:    tools,
	}
	buf, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, openAIURL, bytes.NewReader(buf))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("openai: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("openai: HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	var out chatResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("openai: decode: %w", err)
	}
	return &out, nil
}

// runTool dispatches the single tool we expose. Add tools by extending tools[]
// at the bottom of this file and adding a case here.
func (c *ChatService) runTool(call toolCall, role string) (string, error) {
	if call.Function.Name != "lookup_items" {
		return "", fmt.Errorf("unknown tool: %s", call.Function.Name)
	}
	var args struct {
		Status   string `json:"status"`
		Priority string `json:"priority"`
		Query    string `json:"query"`
	}
	if call.Function.Arguments != "" {
		if err := json.Unmarshal([]byte(call.Function.Arguments), &args); err != nil {
			return "", fmt.Errorf("tool args: %w", err)
		}
	}
	filter := data.ListFilter{
		Status:   args.Status,
		Priority: args.Priority,
		Query:    args.Query,
	}
	if role == middleware.RoleUser {
		filter.AssigneeID = role
	}
	items, err := c.store.List(filter)
	if err != nil {
		return "", err
	}
	// Trim verbose fields so the tool response stays small.
	type row struct {
		ID       int    `json:"id"`
		Title    string `json:"title"`
		Status   string `json:"status"`
		Priority string `json:"priority"`
		Assignee string `json:"assignee"`
	}
	out := make([]row, 0, len(items))
	for _, it := range items {
		out = append(out, row{ID: it.ID, Title: it.Title, Status: it.Status, Priority: it.Priority, Assignee: it.AssigneeID})
	}
	payload, _ := json.Marshal(map[string]any{
		"count": len(out),
		"items": out,
	})
	return string(payload), nil
}

const systemPrompt = "You are the Heywood Inventory assistant. " +
	"You help the user understand inventory items in this system. " +
	"When the user asks about counts, statuses, priorities, or specific items, " +
	"call the lookup_items tool to query the live database. " +
	"Never invent items, IDs, or counts. " +
	"Format responses with short markdown — bullet lists and bold labels work well. " +
	"If a tool call returns zero results, say so plainly."

// ---- Wire types ----

type chatRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
	Tools    []toolDef     `json:"tools,omitempty"`
}

type chatResponse struct {
	Choices []struct {
		Message chatMessage `json:"message"`
	} `json:"choices"`
}

type chatMessage struct {
	Role       string     `json:"role"`
	Content    string     `json:"content,omitempty"`
	ToolCalls  []toolCall `json:"tool_calls,omitempty"`
	ToolCallID string     `json:"tool_call_id,omitempty"`
}

type toolCall struct {
	ID       string `json:"id"`
	Type     string `json:"type"`
	Function struct {
		Name      string `json:"name"`
		Arguments string `json:"arguments"`
	} `json:"function"`
}

type toolDef struct {
	Type     string         `json:"type"`
	Function toolDefDetails `json:"function"`
}

type toolDefDetails struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Parameters  map[string]any `json:"parameters"`
}

// tools is the public surface the AI can invoke. Keep this list short and
// each tool sharply scoped — a focused tool catalog produces fewer hallucinated
// arguments than a broad one.
var tools = []toolDef{
	{
		Type: "function",
		Function: toolDefDetails{
			Name: "lookup_items",
			Description: "Query the inventory items database. " +
				"Use this any time the user asks about counts, statuses, priorities, " +
				"or specific items. Returns matching items and the total count.",
			Parameters: map[string]any{
				"type": "object",
				"properties": map[string]any{
					"status": map[string]any{
						"type":        "string",
						"description": "Filter by status",
						"enum":        []string{"open", "in_progress", "blocked", "done"},
					},
					"priority": map[string]any{
						"type":        "string",
						"description": "Filter by priority",
						"enum":        []string{"low", "medium", "high", "critical"},
					},
					"query": map[string]any{
						"type":        "string",
						"description": "Case-insensitive substring to match against item title or notes",
					},
				},
			},
		},
	},
}
