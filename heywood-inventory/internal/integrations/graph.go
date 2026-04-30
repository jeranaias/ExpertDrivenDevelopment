// Module 9 — Path B: Microsoft Graph integration.
// Azure AD client-credentials flow with token caching. Endpoints are split
// into Commercial vs GCC High because both audiences appear in DoW units.
//
// Set these env vars before -graph=true:
//
//	GRAPH_TENANT_ID
//	GRAPH_CLIENT_ID
//	GRAPH_CLIENT_SECRET
//	GRAPH_USER          (UPN whose mail/calendar to fetch)
//	GRAPH_CLOUD         (commercial | gcchigh, default commercial)
//
// This file is reference-quality but secondary to the rest of the demo. The
// instructor enables it only when the room is doing Path B.
package integrations

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

type GraphClient struct {
	tenantID     string
	clientID     string
	clientSecret string
	user         string
	cloud        string
	client       *http.Client

	mu          sync.Mutex
	cachedToken string
	cachedUntil time.Time
}

// New returns a configured client when env vars are present, or nil + nil if
// the integration is intentionally disabled (so main.go can keep the route
// registration clean).
func New() (*GraphClient, error) {
	tid := os.Getenv("GRAPH_TENANT_ID")
	cid := os.Getenv("GRAPH_CLIENT_ID")
	sec := os.Getenv("GRAPH_CLIENT_SECRET")
	usr := os.Getenv("GRAPH_USER")
	if tid == "" || cid == "" || sec == "" || usr == "" {
		return nil, nil
	}
	cloud := strings.ToLower(strings.TrimSpace(os.Getenv("GRAPH_CLOUD")))
	if cloud == "" {
		cloud = "commercial"
	}
	return &GraphClient{
		tenantID:     tid,
		clientID:     cid,
		clientSecret: sec,
		user:         usr,
		cloud:        cloud,
		client:       &http.Client{Timeout: 30 * time.Second},
	}, nil
}

func (g *GraphClient) tokenURL() string {
	if g.cloud == "gcchigh" {
		return fmt.Sprintf("https://login.microsoftonline.us/%s/oauth2/v2.0/token", g.tenantID)
	}
	return fmt.Sprintf("https://login.microsoftonline.com/%s/oauth2/v2.0/token", g.tenantID)
}

func (g *GraphClient) graphBase() string {
	if g.cloud == "gcchigh" {
		return "https://graph.microsoft.us/v1.0"
	}
	return "https://graph.microsoft.com/v1.0"
}

func (g *GraphClient) scope() string {
	if g.cloud == "gcchigh" {
		return "https://graph.microsoft.us/.default"
	}
	return "https://graph.microsoft.com/.default"
}

func (g *GraphClient) token(ctx context.Context) (string, error) {
	g.mu.Lock()
	defer g.mu.Unlock()
	if g.cachedToken != "" && time.Now().Before(g.cachedUntil.Add(-1*time.Minute)) {
		return g.cachedToken, nil
	}
	form := url.Values{}
	form.Set("client_id", g.clientID)
	form.Set("client_secret", g.clientSecret)
	form.Set("scope", g.scope())
	form.Set("grant_type", "client_credentials")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, g.tokenURL(), strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := g.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("graph token: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("graph token HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}
	var tr struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tr); err != nil {
		return "", err
	}
	if tr.AccessToken == "" {
		return "", errors.New("graph token: empty access_token")
	}
	g.cachedToken = tr.AccessToken
	g.cachedUntil = time.Now().Add(time.Duration(tr.ExpiresIn) * time.Second)
	return g.cachedToken, nil
}

func (g *GraphClient) get(ctx context.Context, path string, out any) error {
	tok, err := g.token(ctx)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.graphBase()+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+tok)
	req.Header.Set("Accept", "application/json")
	resp, err := g.client.Do(req)
	if err != nil {
		return fmt.Errorf("graph get: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("graph get %s HTTP %d: %s", path, resp.StatusCode, strings.TrimSpace(string(b)))
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

type CalendarEvent struct {
	Subject string    `json:"subject"`
	Start   time.Time `json:"start"`
	End     time.Time `json:"end"`
	Web     string    `json:"webLink"`
}

func (g *GraphClient) CalendarToday(ctx context.Context) ([]CalendarEvent, error) {
	now := time.Now().UTC()
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	dayEnd := dayStart.Add(24 * time.Hour)
	path := fmt.Sprintf("/users/%s/calendarView?startDateTime=%s&endDateTime=%s&$select=subject,start,end,webLink&$orderby=start/dateTime",
		url.PathEscape(g.user),
		dayStart.Format(time.RFC3339),
		dayEnd.Format(time.RFC3339),
	)
	var raw struct {
		Value []struct {
			Subject string `json:"subject"`
			WebLink string `json:"webLink"`
			Start   struct {
				DateTime string `json:"dateTime"`
			} `json:"start"`
			End struct {
				DateTime string `json:"dateTime"`
			} `json:"end"`
		} `json:"value"`
	}
	if err := g.get(ctx, path, &raw); err != nil {
		return nil, err
	}
	out := make([]CalendarEvent, 0, len(raw.Value))
	for _, v := range raw.Value {
		s, _ := time.Parse("2006-01-02T15:04:05.0000000", v.Start.DateTime)
		e, _ := time.Parse("2006-01-02T15:04:05.0000000", v.End.DateTime)
		out = append(out, CalendarEvent{Subject: v.Subject, Start: s, End: e, Web: v.WebLink})
	}
	return out, nil
}

type MailSummary struct {
	UnreadCount int      `json:"unreadCount"`
	Senders     []string `json:"recentSenders"`
}

func (g *GraphClient) MailSummary(ctx context.Context) (MailSummary, error) {
	path := fmt.Sprintf("/users/%s/mailFolders/Inbox/messages?$filter=isRead eq false&$top=10&$select=from", url.PathEscape(g.user))
	var raw struct {
		Value []struct {
			From struct {
				EmailAddress struct {
					Name string `json:"name"`
				} `json:"emailAddress"`
			} `json:"from"`
		} `json:"value"`
	}
	if err := g.get(ctx, path, &raw); err != nil {
		return MailSummary{}, err
	}
	seen := map[string]bool{}
	out := MailSummary{}
	for _, v := range raw.Value {
		out.UnreadCount++
		name := v.From.EmailAddress.Name
		if name != "" && !seen[name] {
			seen[name] = true
			out.Senders = append(out.Senders, name)
		}
	}
	return out, nil
}
