package com.example.webrtc.webrtcexample.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class SignalingConfiguration implements WebSocketConfigurer {

    @Value( "${allowed.origin:*}" )
    private String allowedOrigin;
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SignalingHandler(), "/webrtc").setAllowedOrigins(allowedOrigin);
    }
}

