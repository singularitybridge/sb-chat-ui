# Backend Guide: Action Message Types

This guide explains how to implement action/function execution message types for the chat UI frontend.

## Overview

The frontend chat UI can display real-time action execution status through two main mechanisms:
1. **Streaming Action Updates** - Real-time updates during user input processing
2. **Discrete Action Messages** - Standalone system messages for action status

## Message Structure Standards

### Base Message Format

All action messages must follow this structure:

```json
{
  "id": "unique_message_id",
  "role": "system",
  "content": [
    {
      "type": "text",
      "text": {
        "value": "System: action_execution"
      }
    }
  ],
  "created_at": 1748088443,
  "assistant_id": "assistant_id",
  "thread_id": "thread_id", 
  "message_type": "action_execution",
  "data": {
    // Action-specific metadata (see below)
  }
}
```

### Required Fields

- `role`: Must be `"system"` for action messages
- `message_type`: Determines UI routing (e.g., `"action_execution"`)
- `content[0].text.value`: Should follow pattern `"System: {message_type}"`
- `data`: Contains all action-specific information

## Action Execution Message Type

### Message Type: `action_execution`

**Purpose**: Track the lifecycle of action/function executions

**Data Structure**:
```json
{
  "message_type": "action_execution",
  "data": {
    "messageId": "action_msg_123",
    "actionId": "unique_action_id", 
    "serviceName": "service_name",
    "actionTitle": "Human Readable Title",
    "actionDescription": "Detailed description of what this action does",
    "icon": "icon_name",
    "originalActionId": "original_action_reference",
    "status": "started|completed|failed",
    "input": {
      // Optional: Action input parameters
      "parameter1": "value1",
      "parameter2": "value2"
    },
    "output": {
      // Optional: Action results (only for completed status)
      "result": "success",
      "data": {...}
    }
  }
}
```

### Status Values

- `"started"`: Action execution has begun
- `"completed"`: Action finished successfully  
- `"failed"`: Action encountered an error

### Example Implementation

```javascript
// Start action execution
const actionMessage = {
  id: generateMessageId(),
  role: "system",
  content: [{
    type: "text", 
    text: { value: "System: action_execution" }
  }],
  created_at: Math.floor(Date.now() / 1000),
  assistant_id: assistantId,
  thread_id: threadId,
  message_type: "action_execution",
  data: {
    messageId: "action_msg_123",
    actionId: "email_send_001",
    serviceName: "email_service", 
    actionTitle: "Send Email",
    actionDescription: "Sending notification email to user",
    icon: "mail",
    originalActionId: "email_action_def_456",
    status: "started",
    input: {
      recipient: "user@example.com",
      subject: "Your request is being processed"
    }
  }
};

// Send to client via WebSocket/Pusher
pusher.trigger(`session_${threadId}`, 'chat_message', actionMessage);

// Later, update with completion
const completionMessage = {
  ...actionMessage,
  id: generateMessageId(),
  created_at: Math.floor(Date.now() / 1000),
  data: {
    ...actionMessage.data,
    status: "completed",
    output: {
      messageId: "email_123",
      deliveryStatus: "sent",
      timestamp: "2025-01-24T10:30:00Z"
    }
  }
};

pusher.trigger(`session_${threadId}`, 'chat_message', completionMessage);
```

## Streaming Action Updates

### During User Input Processing

When processing user input that triggers actions, send action updates through the SSE stream:

```javascript
// In user-input endpoint
app.post('/assistant/user-input', async (req, res) => {
  // Setup SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send initial response
  res.write('data: {"type": "token", "value": "I\'ll help you with that. "}\n\n');
  
  // Start action
  const actionId = await startEmailAction(userInput);
  
  // Send action start notification
  res.write(`data: ${JSON.stringify({
    type: 'action',
    actionDetails: {
      actionId: actionId,
      actionTitle: 'Send Email',
      actionDescription: 'Sending notification email',
      status: 'started',
      serviceName: 'email_service',
      icon: 'mail',
      originalActionId: 'email_action_def_456'
    }
  })}\n\n`);
  
  // Continue with text response
  res.write('data: {"type": "token", "value": "Sending email now..."}\n\n');
  
  // Execute action
  try {
    const result = await executeEmailAction(actionId);
    
    // Send completion update
    res.write(`data: ${JSON.stringify({
      type: 'action',
      actionDetails: {
        actionId: actionId,
        status: 'completed',
        output: result
      }
    })}\n\n`);
    
    res.write('data: {"type": "token", "value": " Done! Email sent successfully."}\n\n');
    
  } catch (error) {
    // Send failure update
    res.write(`data: ${JSON.stringify({
      type: 'action', 
      actionDetails: {
        actionId: actionId,
        status: 'failed',
        error: error.message
      }
    })}\n\n`);
    
    res.write('data: {"type": "token", "value": " Sorry, email sending failed."}\n\n');
  }
  
  res.write('data: {"type": "done"}\n\n');
  res.end();
});
```

## Additional Message Types

### Integration Action Update: `integration_action_update`

For third-party integration status updates:

```json
{
  "message_type": "integration_action_update",
  "data": {
    "integrationName": "slack",
    "actionType": "channel_post",
    "status": "completed",
    "channelId": "C123456",
    "messageId": "1234567890.123456"
  }
}
```

### Function Run Update: `function_run_update`

For long-running function execution:

```json
{
  "message_type": "function_run_update", 
  "data": {
    "functionName": "data_processing",
    "runId": "run_123",
    "status": "running",
    "progress": 45,
    "duration": 1200,
    "logs": ["Processing batch 1/10", "Validation complete"]
  }
}
```

## Best Practices

### 1. Message IDs
- Always use unique message IDs
- Consider using format: `action_{timestamp}_{random}`

### 2. Icon Naming
- Use kebab-case: `file-text`, `mail-send`, `database-update`
- Frontend maps these to Lucide React icons
- Fallback icon is `help-circle`

### 3. Status Updates
- Always send `started` status first
- Send `completed` or `failed` status last
- Include relevant `input`/`output` data
- Keep descriptions user-friendly

### 4. Error Handling
```json
{
  "status": "failed",
  "error": {
    "code": "EMAIL_SEND_FAILED",
    "message": "SMTP server unavailable",
    "details": {
      "smtpError": "Connection timeout",
      "retryAfter": 300
    }
  }
}
```

### 5. Real-time vs Discrete Messages
- **Use streaming** for actions triggered during user input
- **Use discrete messages** for background actions or external triggers
- **Always provide both** start and end status updates

## Frontend Integration

The frontend automatically:
- Routes messages based on `message_type`
- Displays action progress with icons and status
- Allows expanding to view full action details
- Caches message data for performance

## User Input Response Format

### ⚠️ Critical: User Input Endpoint Must Return Standard Message Format

The user-input endpoint **must** return responses in the standard message format, not custom JSON structures.

**❌ WRONG - Custom JSON Response:**
```json
{
  "intro": "Here are the assistants available:",
  "assistants": [
    { "id": 1, "name": "אנה", "description": "מנהלת מוצר" },
    { "id": 2, "name": "תומר", "description": "מנהל פעילות" }
  ],
  "note": "If you want me to switch to any of these assistants, just let me know!"
}
```

**✅ CORRECT - Standard Message Format:**
```json
{
  "id": "msg_123",
  "role": "assistant", 
  "content": [
    {
      "type": "text",
      "text": {
        "value": "Here are the assistants available:\n\n1. אנה - מנהלת מוצר\n2. תומר - מנהל פעילות\n...\n\nIf you want me to switch to any of these assistants, just let me know!"
      }
    }
  ],
  "created_at": 1748090829,
  "assistant_id": "67f7b232036cb19ba3024c01",
  "thread_id": "6831bfb1b167df6988ba0160",
  "message_type": "text",
  "data": {
    "assistants": [
      { "id": 1, "name": "אנה", "description": "מנהלת מוצר" },
      { "id": 2, "name": "תומר", "description": "מנהל פעילות" }
    ]
  }
}
```

### Non-Streaming User Input Response

For non-streaming user input responses, **DO NOT** include action updates in the main response. Instead, send them as separate Pusher messages:

```javascript
app.post('/assistant/user-input', async (req, res) => {
  const { userInput } = req.body;
  const { assistantId, threadId } = req; // from context
  
  // If actions are triggered, send them as separate messages via Pusher
  if (userInput.includes('list assistants')) {
    // Send action start message
    const actionStartMessage = {
      id: generateMessageId(),
      role: "system",
      content: [{
        type: "text",
        text: { value: "System: action_execution" }
      }],
      created_at: Math.floor(Date.now() / 1000),
      assistant_id: assistantId,
      thread_id: threadId,
      message_type: "action_execution",
      data: {
        messageId: generateMessageId(),
        actionId: "getAssistants_001",
        serviceName: "assistant_service",
        actionTitle: "Get Assistants",
        actionDescription: "Retrieving list of available assistants",
        icon: "users",
        originalActionId: "getAssistants",
        status: "started"
      }
    };
    
    pusher.trigger(`session_${threadId}`, 'chat_message', actionStartMessage);
  }
  
  // Process user input
  const responseText = await processUserInput(userInput);
  const additionalData = await getAdditionalData(userInput);
  
  // Send action completion if needed
  if (userInput.includes('list assistants')) {
    const actionCompleteMessage = {
      id: generateMessageId(),
      role: "system",
      content: [{
        type: "text",
        text: { value: "System: action_execution" }
      }],
      created_at: Math.floor(Date.now() / 1000),
      assistant_id: assistantId,
      thread_id: threadId,
      message_type: "action_execution",
      data: {
        messageId: generateMessageId(),
        actionId: "getAssistants_001",
        serviceName: "assistant_service", 
        actionTitle: "Get Assistants",
        actionDescription: "Retrieved list of available assistants",
        icon: "users",
        originalActionId: "getAssistants",
        status: "completed",
        output: {
          assistantCount: additionalData?.assistants?.length || 0
        }
      }
    };
    
    pusher.trigger(`session_${threadId}`, 'chat_message', actionCompleteMessage);
  }
  
  // Return standard message format (WITHOUT action text)
  const response = {
    id: generateMessageId(),
    role: "assistant",
    content: [
      {
        type: "text",
        text: {
          value: responseText // Clean text without [Action: ...] annotations
        }
      }
    ],
    created_at: Math.floor(Date.now() / 1000),
    assistant_id: assistantId,
    thread_id: threadId,
    message_type: "text",
    data: additionalData // Optional: any structured data
  };
  
  res.json(response);
});
```

### Pusher Message Format

Pusher messages should also follow the standard format:

```javascript
// ❌ WRONG - Custom pusher format
pusher.trigger(`session_${threadId}`, 'chat_message', {
  content: "Hello world",
  type: "assistant",
  timestamp: new Date().toISOString()
});

// ✅ CORRECT - Standard message format
pusher.trigger(`session_${threadId}`, 'chat_message', {
  id: generateMessageId(),
  role: "assistant",
  content: [
    {
      type: "text", 
      text: {
        value: "Hello world"
      }
    }
  ],
  created_at: Math.floor(Date.now() / 1000),
  assistant_id: assistantId,
  thread_id: threadId,
  message_type: "text"
});
```

## Testing

Test your implementation with these scenarios:
1. Quick action (< 1 second)
2. Long-running action (> 5 seconds) 
3. Failed action with error details
4. Multiple concurrent actions
5. Action triggered outside user input flow

## Troubleshooting

**Action messages not appearing:**
- Verify `role: "system"` is set
- Check `message_type` matches frontend cases
- Ensure `data` object contains required fields

**UI not updating properly:**
- Confirm message IDs are unique
- Verify WebSocket/Pusher connection
- Check browser console for errors

**Icons not displaying:**
- Use standard Lucide icon names
- Test icon mapping in frontend
- Provide fallback for custom icons

**User input responses not displaying:**
- ⚠️ **Most Common Issue**: User-input endpoint returning custom JSON instead of message format
- Verify response follows standard message structure with `role`, `content`, `message_type`
- Check that `content` is an array with `text.value` structure
- Ensure `created_at` is Unix timestamp (seconds, not milliseconds)

**Messages work when loaded but not in real-time:**
- Check user-input endpoint response format
- Verify Pusher messages use standard format  
- Confirm both saved and real-time messages have identical structure

**Seeing "[Action: actionName]" text in chat instead of action components:**
- ⚠️ **Critical Issue**: Action text is being included in assistant message content
- Actions should be sent as separate `role: "system"` messages via Pusher
- Remove all "[Action: ...]" text from assistant response content
- Each action needs its own message with `message_type: "action_execution"`
- Example fix:
  ```javascript
  // ❌ WRONG: Including action text in response
  const response = {
    role: "assistant",
    content: [{ type: "text", text: { value: "[Action: getAssistants]Here are the assistants..." } }]
  };
  
  // ✅ CORRECT: Clean response + separate action messages
  const response = {
    role: "assistant", 
    content: [{ type: "text", text: { value: "Here are the assistants..." } }]
  };
  // Send action as separate message via Pusher
  pusher.trigger(`session_${threadId}`, 'chat_message', actionMessage);
  ```
