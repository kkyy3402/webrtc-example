package com.example.webrtc.webrtcexample.configs;

import com.example.webrtc.webrtcexample.models.SignalData;
import com.example.webrtc.webrtcexample.models.SignalType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SignalingHandler extends TextWebSocketHandler {


    final ObjectMapper map1 = new ObjectMapper();
    List<WebSocketSession> sessions = new LinkedList<WebSocketSession>();
    ConcurrentHashMap<String, WebSocketSession> sessionMap = new ConcurrentHashMap<String, WebSocketSession>();
    Logger log1 = LoggerFactory.getLogger(SignalingHandler.class);

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        final String msg1 = message.getPayload();
        SignalData sigData = map1.readValue(msg1, SignalData.class);
        log1.debug("Receive message from client:", msg1);

        SignalData sigResp;

        if (sigData.getType().equalsIgnoreCase(SignalType.Login.toString())) {
            //로그인시 임의의  UUID를 부여한다.
            String userId = UUID.randomUUID().toString();
            SignalData sigResp2 = SignalData.builder()
                    .userId("signaling")
                    .type(SignalType.UserId.toString())
                    .data(userId)
                    .build();

            sessionMap.put(userId, session);
            session.sendMessage(new TextMessage(map1.writeValueAsString(sigResp2)));
            return;
        }

        //새 멤버
        if (sigData.getType().equalsIgnoreCase(SignalType.NewMember.toString())) {

            sessionMap.values().forEach(a -> {
                SignalData sigResp2 = SignalData
                        .builder()
                        .userId(sigData.getUserId())
                        .type(SignalType.NewMember.toString())
                        .build();

                try {
                    //Check if websocket is open
                    if (a.isOpen()) {
                        log1.debug("Sending New Member from", sigData.getUserId());
                        a.sendMessage(new TextMessage(map1.writeValueAsString(sigResp2)));
                    }
                } catch (Exception e) {
                    log1.error("Error Sending message:", e);
                }
            });
            return;
        }

        //제공?
        if (sigData.getType().equalsIgnoreCase(SignalType.Offer.toString())) {
            sigResp = SignalData.builder()
                    .userId(sigData.getUserId())
                    .type(SignalType.Offer.toString())
                    .data(sigData.getData())
                    .toUid(sigData.getToUid())
                    .build();

            sessionMap.get(sigData.getToUid()).sendMessage(new TextMessage(map1.writeValueAsString(sigResp)));
            return;
        }

        //답변
        if (sigData.getType().equalsIgnoreCase(SignalType.Answer.toString())) {
            sigResp = SignalData.builder()
                    .userId(sigData.getUserId())
                    .type(SignalType.Answer.toString())
                    .data(sigData.getData())
                    .toUid(sigData.getToUid())
                    .build();

            sessionMap.get(sigData.getToUid()).sendMessage(new TextMessage(map1.writeValueAsString(sigResp)));
            return;
        }

        if (sigData.getType().equalsIgnoreCase(SignalType.Ice.toString())) {
            sigResp = SignalData.builder()
                    .userId(sigData.getUserId())
                    .type(SignalType.Ice.toString())
                    .data(sigData.getData())
                    .toUid(sigData.getToUid())
                    .build();

            sessionMap.get(sigData.getToUid()).sendMessage(new TextMessage(map1.writeValueAsString(sigResp)));
        }

    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {

        sessions.add(session);
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {

        sessions.remove(session);
        super.afterConnectionClosed(session, status);
    }
}
