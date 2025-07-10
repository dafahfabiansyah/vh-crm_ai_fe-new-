# WebSocket Testing Guide for CRM System

This guide explains how to test the WebSocket functionality in Postman for the CRM system's real-time updates.

## Overview

The WebSocket implementation handles two main types of updates:
1. **Contact Updates** - For the contact list on the left sidebar
2. **Chatlog Updates** - For the messaging section on the right

## WebSocket Endpoint

```
ws://localhost:8080/v1/ws
```

## Message Types

### 1. Contact Updates (`contact_update`)

Broadcasted to all connected clients when:
- A new message is sent/received (updates last_message)
- Lead status changes (unassigned → assigned → resolved)

**Message Format:**
```json
{
  "type": "contact_update",
  "data": {
    "contact_id": "uuid",
    "last_message": "Latest message content",
    "last_message_at": "2024-01-15T10:30:00Z",
    "lead_status": "unassigned|assigned|resolved"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Chatlog Updates (`chatlog_update`)

Sent only to clients subscribed to a specific contact when:
- New messages are added to the chat
- Message status changes

**Message Format:**
```json
{
  "type": "chatlog_update",
  "data": {
    "id": "uuid",
    "contact_id": "uuid",
    "message": "Message content",
    "type": "text|image|document",
    "media": "media_url_if_applicable",
    "from_me": false,
    "sent_at": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Client Messages (What you send to the server)

### Subscribe to Contact Chatlog Updates
```json
{
  "type": "subscribe_contact",
  "contact_id": "your-contact-uuid-here"
}
```

### Unsubscribe from Contact Updates
```json
{
  "type": "unsubscribe_contact"
}
```

## Testing in Postman

### Step 1: Create WebSocket Connection

1. Open Postman
2. Create a new WebSocket request
3. Set URL to: `ws://localhost:8080/ws`
4. Click "Connect"

### Step 2: Test Contact List Updates

**Scenario:** Test that contact list updates when new messages arrive

1. **Connect to WebSocket** (no subscription needed for contact updates)
2. **Send a message via REST API** to create a new chatlog entry:
   ```bash
   POST /chatlogs
   {
     "contact_id": "existing-contact-uuid",
     "message": "Test message",
     "type": "text",
     "from_me": false
   }
   ```
3. **Observe WebSocket** - You should receive a `contact_update` message
4. **Verify the data** contains updated `last_message` and `last_message_at`

### Step 3: Test Lead Status Updates

**Scenario:** Test contact status changes based on lead status

1. **Create/Update a lead** via REST API to change status:
   ```bash
   PATCH /leads/{lead-id}
   {
     "status": "assigned"  // or "resolved"
   }
   ```
2. **Observe WebSocket** - You should receive a `contact_update` with new `lead_status`

### Step 4: Test Chatlog Updates (Contact-Specific)

**Scenario:** Test that only relevant chatlog updates are received

1. **Subscribe to a specific contact:**
   ```json
   {
     "type": "subscribe_contact",
     "contact_id": "your-contact-uuid"
   }
   ```

2. **Send a message for the subscribed contact:**
   ```bash
   POST /chatlogs
   {
     "contact_id": "your-contact-uuid",
     "message": "Message for subscribed contact",
     "type": "text",
     "from_me": false
   }
   ```

3. **Observe WebSocket** - You should receive a `chatlog_update`

4. **Send a message for a different contact:**
   ```bash
   POST /chatlogs
   {
     "contact_id": "different-contact-uuid",
     "message": "Message for different contact",
     "type": "text",
     "from_me": false
   }
   ```

5. **Observe WebSocket** - You should NOT receive a `chatlog_update` for this message

### Step 5: Test Multiple Client Scenarios

**Scenario:** Test that multiple clients receive appropriate updates

1. **Open 2 WebSocket connections** in different Postman tabs
2. **Subscribe each to different contacts**
3. **Send messages for both contacts**
4. **Verify each client only receives updates for their subscribed contact**

## Expected Behaviors

### Contact Updates (Left Sidebar)
- ✅ All connected clients receive contact updates
- ✅ Updates include latest message and timestamp
- ✅ Lead status reflects aggregated status of all leads for that contact
- ✅ If all leads are resolved, contact shows as "resolved"
- ✅ If any lead is unassigned/assigned, contact shows highest priority status

### Chatlog Updates (Right Messaging Panel)
- ✅ Only clients subscribed to specific contact receive updates
- ✅ Messages from other contacts are filtered out
- ✅ Real-time message delivery without page refresh

## Troubleshooting

### Connection Issues
- Ensure server is running on correct port
- Check CORS settings if connecting from browser
- Verify WebSocket upgrade headers

### Missing Updates
- Check if client is properly subscribed for chatlog updates
- Verify contact_id format (must be valid UUID)
- Check server logs for error messages

### Performance Testing
- Test with multiple concurrent connections
- Send rapid message bursts to test message queuing
- Monitor memory usage with many connected clients

## REST API Endpoints for Testing

Use these endpoints to trigger WebSocket updates:

```bash
# Create new chatlog (triggers both contact and chatlog updates)
POST /chatlogs

# Update contact (triggers contact update)
PUT /contacts/{id}

# Update lead status (triggers contact update)
PUT /leads/{id}

# Get recent contacts (for reference)
GET /ws/contacts
```

## Sample Test Sequence

1. **Connect WebSocket**
2. **Subscribe to contact:** `{"type": "subscribe_contact", "contact_id": "uuid"}`
3. **Send message via REST API**
4. **Verify both updates received:**
   - `contact_update` (for sidebar)
   - `chatlog_update` (for chat panel)
5. **Change lead status via REST API**
6. **Verify contact_update with new lead_status**
7. **Unsubscribe:** `{"type": "unsubscribe_contact"}`
8. **Send another message**
9. **Verify only contact_update received (no chatlog_update)**

This testing approach ensures your WebSocket implementation correctly handles the real-time updates for both the contact list and messaging functionality as described in your requirements.