# Backend Task: Fix Session ID Mismatch for Action Execution Messages

## Problem Description

When executing tools/actions during a chat session, the action execution messages are being published to the wrong Pusher channel due to a session ID mismatch.

### Current Behavior (INCORRECT):
- User sends message in session: `6832175f02f20ca41868d663`
- Stream response uses correct session: `6832175f02f20ca41868d663`
- But action messages use OLD session: `683210f64a7b15c9e5db214a`
- This causes action updates to be sent to wrong Pusher channel

### Expected Behavior:
- All operations should use the CURRENT session ID from the request context
- Action messages should publish to the same session that initiated the request

## Root Cause

The tools/actions are being cached with their execution context, including the session ID from when they were first created. When the same tool is executed in a different session, it still uses the old cached session ID.

### Evidence from logs:
```
Returning stream object for session 6832175f02f20ca41868d663 for client consumption.
Saving action message for session 683210f64a7b15c9e5db214a, action debug.getSessionInfo, status started
```

## Required Fix

### Location: `/src/services/assistant/message-handling.service.ts`

The fix has already been attempted but needs to be verified:

```typescript
// In the tool execution function
let executeFunc = async (args: any) => {
  // CRITICAL: Use the current session's ID, not the cached one
  const currentSession = await Session.findById(sessionId);
  if (!currentSession) {
    throw new Error('Session not found during tool execution');
  }
  
  const functionCallPayload: FunctionCall = { 
    function: { 
      name: currentFuncName, 
      arguments: JSON.stringify(args) 
    } 
  };
  
  const { result, error } = await executeFunctionCall(
    functionCallPayload, 
    currentSession._id.toString(), // Use current session ID
    currentSession.companyId.toString(), // Use current company ID
    assistant.allowedActions
  );
  // ... rest of function
};
```

### Additional Areas to Check:

1. **Tool Factory Context**: Ensure the `actionContext` in tool creation doesn't cache session-specific data
2. **Function Execution Chain**: Trace through `executeFunctionCall` → `sendActionUpdate` → `publishActionMessage` to ensure session ID is passed correctly
3. **Async Context Loss**: Check if any async operations are losing the request context

## Testing Instructions

1. Start a chat session and note the session ID
2. Execute any action (e.g., "show debug info")
3. Check server logs to verify:
   - Stream response uses correct session ID
   - Action messages use SAME session ID
   - Pusher publishes to correct channel: `sb-{sessionId}`

## Success Criteria

- [ ] Action execution messages use the current request's session ID
- [ ] Pusher messages are sent to the correct channel
- [ ] Frontend receives action updates in real-time
- [ ] No session ID mismatches in server logs

## Additional Notes

The frontend is now properly configured to handle action execution messages. It expects:
- `status: 'started'` messages to be added as new chat messages
- `status: 'completed'/'failed'` messages to update existing messages by `messageId`

The issue is purely on the backend - the session ID used for publishing action messages must match the current request's session.
