package com.practice.chat.config;

import com.practice.chat.Entity.ChatMessage;
import com.practice.chat.Entity.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

  private final SimpMessageSendingOperations mSendingOperations;

  @EventListener
  public void
  handleWebSocketDisconnectListener(SessionDisconnectEvent disconnectEvent) {
    StompHeaderAccessor headerAccessor =
        StompHeaderAccessor.wrap(disconnectEvent.getMessage());
    String username =
        headerAccessor.getSessionAttributes().get("username").toString();
    if (username != null) {
      log.info("User disconnected :{}", username);
      ChatMessage chatMessage = ChatMessage.builder().sender(username).build();
      mSendingOperations.convertAndSend("/topic/public", chatMessage);
    }
  }
}
