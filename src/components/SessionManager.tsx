/**
 * SessionManager Component
 *
 * Manages Socket.IO session subscriptions for real-time chat messaging.
 * Replaces PusherManager with Socket.IO-based session management.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocket';
import { useSessionStore } from '../store/useSessionStore';
import { emitter } from '../services/mittEmitter';
import * as EventNames from '../utils/eventNames';
import { logger } from '../services/LoggingService';

interface ChatMessage {
  type?: 'user' | 'assistant';
  content?: string;
  timestamp?: string;
  id?: string;
  role?: string;
  message_type?: string;
  data?: any;
}

interface PusherEvent {
  message?: any;
  _id?: string;
}

function SessionManager(): React.ReactElement | null {
  const activeSession = useSessionStore((state) => state.activeSession);
  const activeSessionId = activeSession?._id;
  const previousSessionIdRef = useRef<string | null>(null);

  // Handle chat_message event
  const handleChatMessage = useCallback((data: ChatMessage) => {
    logger.info('[SessionManager] Received chat_message:', {
      messageType: data.message_type,
      hasData: !!data.data,
    });

    // Special handling for action execution messages
    if (data.message_type === 'action_execution' && data.data) {
      const messageData = data.data;

      logger.info('[SessionManager] Detected action execution in chat_message:', {
        messageId: data.id,
        messageType: data.message_type,
        status: messageData?.status,
      });

      // Only emit action execution update if status is NOT 'started'
      // 'started' messages should create new chat messages
      if (messageData?.status && messageData.status !== 'started') {
        const actionExecutionData = {
          messageId: messageData?.messageId || data.id,
          actionId: messageData?.actionId,
          serviceName: messageData?.serviceName,
          actionTitle: messageData?.actionTitle,
          actionDescription: messageData?.actionDescription,
          icon: messageData?.icon,
          originalActionId: messageData?.originalActionId,
          status: messageData?.status,
          input: messageData?.input,
          output: messageData?.output,
          error: messageData?.error,
        };

        logger.info('[SessionManager] Emitting action execution UPDATE:', actionExecutionData);
        emitter.emit(EventNames.EVENT_ACTION_EXECUTION, actionExecutionData);
      } else {
        logger.info('[SessionManager] Action execution with status "started" - will be added as new chat message');
      }
    }

    // Emit chat message event for ChatContainer and other listeners
    emitter.emit(EventNames.EVENT_CHAT_MESSAGE, data);
  }, []);

  // Handle createNewAssistant event
  const handleCreateNewAssistant = useCallback((data: PusherEvent) => {
    logger.info('[SessionManager] Received createNewAssistant event:', data);
    setTimeout(() => {
      emitter.emit(EventNames.EVENT_SET_ASSISTANT_VALUES, data.message || data);
    }, 100);
  }, []);

  // Handle setAssistant event
  const handleSetAssistant = useCallback((data: PusherEvent) => {
    logger.info('[SessionManager] Received setAssistant event:', data);
    if (data && typeof data === 'object' && '_id' in data) {
      const assistantId = data._id as string;
      logger.info('[SessionManager] Emitting EVENT_SET_ACTIVE_ASSISTANT with _id:', assistantId);
      emitter.emit(EventNames.EVENT_SET_ACTIVE_ASSISTANT, assistantId);
    } else {
      logger.error('[SessionManager] Received data does not contain _id property:', data);
    }
  }, []);

  // Handle assistantUpdated event
  const handleAssistantUpdated = useCallback((data: any) => {
    logger.info('[SessionManager] Received assistantUpdated event:', data);
    // This event can be handled by updating the assistant in the store if needed
    // For now, we emit it so other components can react to it
    emitter.emit('assistantUpdated', data);
  }, []);

  // Handle action_execution_update event (direct event, not wrapped in chat_message)
  const handleActionExecutionUpdate = useCallback((data: PusherEvent) => {
    logger.info('[SessionManager] Received action_execution_update event:', data);

    if (data && typeof data === 'object') {
      const msg = (data.message || data) as any;
      logger.info('[SessionManager] Action execution fields:', {
        messageId: msg.messageId || msg.id,
        actionId: msg.actionId,
        serviceName: msg.serviceName,
        status: msg.status,
      });
    }

    emitter.emit(EventNames.EVENT_ACTION_EXECUTION, data);
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      logger.info('[SessionManager] No active session ID, not subscribing');
      return;
    }

    // Skip if already subscribed to this session
    if (previousSessionIdRef.current === activeSessionId) {
      logger.debug('[SessionManager] Already subscribed to session:', activeSessionId);
      return;
    }

    // Unsubscribe from previous session if any
    if (previousSessionIdRef.current) {
      logger.info('[SessionManager] Unsubscribing from previous session:', previousSessionIdRef.current);
      websocketService.unsubscribeFromSession(previousSessionIdRef.current);
    }

    logger.info('[SessionManager] Subscribing to session:', activeSessionId);

    // Subscribe to new session
    websocketService.subscribeToSession(activeSessionId);
    previousSessionIdRef.current = activeSessionId;

    // Register event handlers
    websocketService.onSessionEvent('chat_message', handleChatMessage);
    websocketService.onSessionEvent('createNewAssistant', handleCreateNewAssistant);
    websocketService.onSessionEvent('setAssistant', handleSetAssistant);
    websocketService.onSessionEvent('assistantUpdated', handleAssistantUpdated);
    websocketService.onSessionEvent('action_execution_update', handleActionExecutionUpdate);

    return () => {
      logger.info('[SessionManager] Cleanup: Unsubscribing from session:', activeSessionId);
      websocketService.unsubscribeFromSession(activeSessionId);
      previousSessionIdRef.current = null;

      // Remove event handlers
      websocketService.offSessionEvent('chat_message', handleChatMessage);
      websocketService.offSessionEvent('createNewAssistant', handleCreateNewAssistant);
      websocketService.offSessionEvent('setAssistant', handleSetAssistant);
      websocketService.offSessionEvent('assistantUpdated', handleAssistantUpdated);
      websocketService.offSessionEvent('action_execution_update', handleActionExecutionUpdate);
    };
  }, [
    activeSessionId,
    handleChatMessage,
    handleCreateNewAssistant,
    handleSetAssistant,
    handleAssistantUpdated,
    handleActionExecutionUpdate,
  ]);

  return null;
}

export default SessionManager;
