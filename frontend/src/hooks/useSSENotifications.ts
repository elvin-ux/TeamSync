import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";

/**
 * Opens a Server-Sent Events connection to the backend /notifications/stream
 * endpoint and invalidates React Query caches whenever a new notification
 * arrives – giving the user instant badge/panel updates without polling.
 *
 * The JWT is forwarded via the `Authorization` header. Since the browser's
 * native `EventSource` doesn't support custom headers we use `fetch` with
 * `ReadableStream` so we can attach the Authorization header normally.
 *
 * Reconnect strategy: exponential back-off (1 s → 2 s → 4 s … capped at 30 s).
 */
export function useSSENotifications() {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const retryDelay = useRef(1000);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    async function connect() {
      const token = window.localStorage.getItem("teamsync.accessToken");
      if (!token) return; // not logged in

      abortRef.current = new AbortController();

      try {
        const response = await fetch(`${API_BASE}/notifications/stream`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE connect failed: ${response.status}`);
        }

        // Reset back-off on successful connection
        retryDelay.current = 1000;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (isMounted.current) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE messages are separated by double newlines
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const eventLine = part.split("\n").find((l) => l.startsWith("event:"));
            const dataLine = part.split("\n").find((l) => l.startsWith("data:"));

            const eventName = eventLine?.replace("event:", "").trim();
            if (eventName === "notification" && dataLine) {
              // Invalidate both the badge count and the full notification list
              queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
              queryClient.invalidateQueries({ queryKey: ["notifications"] });
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return; // intentional disconnect

        // Reconnect with exponential back-off
        if (isMounted.current) {
          const delay = retryDelay.current;
          retryDelay.current = Math.min(delay * 2, 30_000);
          setTimeout(() => {
            if (isMounted.current) connect();
          }, delay);
        }
      }
    }

    connect();

    return () => {
      isMounted.current = false;
      abortRef.current?.abort();
    };
  }, [queryClient]);
}
