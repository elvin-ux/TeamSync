package com.teamsync.service;

import com.teamsync.dto.notification.NotificationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages Server-Sent Event (SSE) emitters for real-time notification push.
 * Each connected browser tab gets its own SseEmitter registered here.
 * When a notification is created, sendNotification() pushes it to all
 * active emitters belonging to the target user.
 */
@Service
@Slf4j
public class SseEmitterService {

    // user email -> list of active emitters (multiple tabs supported)
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /** Register a new SSE connection for the given user. */
    public SseEmitter addEmitter(String email) {
        // 10-minute timeout — client will reconnect automatically via EventSource
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);

        emitters.computeIfAbsent(email, k -> new ArrayList<>()).add(emitter);

        // Clean up when the connection closes or times out
        Runnable cleanup = () -> removeEmitter(email, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(ex -> cleanup.run());

        log.debug("SSE emitter registered for user: {}", email);

        // Send an initial "connected" heartbeat so the browser doesn't wait
        try {
            emitter.send(SseEmitter.event().name("connected").data("SSE connection established"));
        } catch (IOException e) {
            removeEmitter(email, emitter);
        }

        return emitter;
    }

    /** Remove a specific emitter from the registry. */
    public void removeEmitter(String email, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(email);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(email);
            }
        }
    }

    /**
     * Push a notification event to all active browser sessions for the given user.
     * Dead emitters are removed automatically.
     */
    public void sendNotification(String email, NotificationResponse notification) {
        List<SseEmitter> userEmitters = emitters.get(email);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return; // user not connected via SSE right now — they'll poll on next visit
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : new ArrayList<>(userEmitters)) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
                log.debug("SSE notification pushed to user: {}", email);
            } catch (IOException e) {
                deadEmitters.add(emitter);
                log.debug("SSE emitter dead for user {}, removing", email);
            }
        }

        // Cleanup dead emitters
        deadEmitters.forEach(e -> removeEmitter(email, e));
    }
}
