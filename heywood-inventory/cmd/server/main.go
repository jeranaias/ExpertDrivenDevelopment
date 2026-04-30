// Module 3 — Backend from Scratch (entry point)
// Module 4 — wires the DataStore from internal/data into the router.
// Module 8 — wraps the router in the middleware chain.
// Module 10 — serves the built React SPA in -dev=false mode.
package main

import (
        "context"
        "errors"
        "flag"
        "log"
        "net/http"
        "os"
        "os/signal"
        "syscall"
        "time"

        "heywood-inventory/internal/ai"
        "heywood-inventory/internal/api"
        "heywood-inventory/internal/data"
        "heywood-inventory/internal/integrations"
        "heywood-inventory/internal/middleware"
)

func main() {
        port := flag.String("port", "8080", "HTTP port to listen on")
        dev := flag.Bool("dev", false, "Run in development mode (verbose logs, permissive CORS)")
        dbKind := flag.String("db", "json", "Data store backend: json | sqlite")
        dataPath := flag.String("data", "data/items.json", "Path to JSON data file (json store) or sqlite db file (sqlite store)")
        webDir := flag.String("web", "web/dist", "Path to built React SPA (production mode only)")
        flag.Parse()

        store, err := openStore(*dbKind, *dataPath)
        if err != nil {
                log.Fatalf("data store: %v", err)
        }
        defer store.Close()

        chatSvc := ai.NewChatService(os.Getenv("OPENAI_API_KEY"), store)

        graph, err := integrations.New()
        if err != nil {
                log.Fatalf("graph: %v", err)
        }
        if graph != nil {
                log.Println("microsoft graph integration enabled")
        }

        deps := api.Deps{
                Store:   store,
                Chat:    chatSvc,
                Graph:   graph,
                Dev:     *dev,
                WebDir:  *webDir,
                Version: "1.0.0-reference",
        }

        mux := api.SetupRouter(deps)
        handler := middleware.Chain(mux,
                middleware.RequestLogger(*dev),
                middleware.SecurityHeaders(),
                middleware.CORS(*dev),
                middleware.Auth(),
        )

        srv := &http.Server{
                Addr:              ":" + *port,
                Handler:           handler,
                ReadHeaderTimeout: 10 * time.Second,
                ReadTimeout:       30 * time.Second,
                WriteTimeout:      60 * time.Second,
                IdleTimeout:       120 * time.Second,
        }

        go func() {
                log.Printf("heywood-inventory listening on :%s (dev=%v, db=%s)", *port, *dev, *dbKind)
                if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
                        log.Fatalf("server: %v", err)
                }
        }()

        stop := make(chan os.Signal, 1)
        signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
        <-stop

        log.Println("shutting down")
        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()
        if err := srv.Shutdown(ctx); err != nil {
                log.Printf("shutdown: %v", err)
        }
}

func openStore(kind, path string) (data.Store, error) {
        switch kind {
        case "json":
                return data.NewJSONStore(path)
        case "sqlite":
                return data.NewSQLiteStore(path)
        default:
                return nil, errors.New("unknown -db kind (use json or sqlite)")
        }
}
