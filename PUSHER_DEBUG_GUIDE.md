# Pusher Debug Console Guide

This guide will help you test real-time message updates using Pusher's debug console.

## Step 1: Access Pusher Debug Console

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Log in with your Pusher account
3. Select your app (App ID: 2075213)
4. Click on **"Debug Console"** in the left sidebar

## Step 2: Configure Test Event

Based on your current configuration:
- **Channel Name**: `chat-channel`
- **Event Name**: `new-message`

## Step 3: Send Test Message

In the Pusher Debug Console:

1. **Channel**: Enter `chat-channel`
2. **Event**: Enter `new-message`
3. **Data**: Enter the following JSON:

```json
{
  "id": "test-123",
  "type": "text",
  "text": "Hello from Pusher Debug Console!",
  "sender": "other",
  "timestamp": "2:30 pm"
}
```

4. Click **"Trigger Event"**

## Step 4: Verify in App

After sending the event, you should see:

1. **In Console Logs**:
   - `📨 Received event 'new-message' on channel 'chat-channel':`
   - `📬 Processing received message:`
   - `💾 Message saved to SQLite`
   - `✅ Message added to UI`

2. **In App UI**:
   - A new message bubble should appear with the text "Hello from Pusher Debug Console!"
   - The message should be saved to SQLite and persist after app restart

## Test Different Message Types

### Text Message
```json
{
  "id": "text-1",
  "type": "text",
  "text": "This is a test text message",
  "sender": "other",
  "timestamp": "3:45 pm"
}
```

### Image Message
```json
{
  "id": "img-1",
  "type": "image",
  "uri": "https://via.placeholder.com/300",
  "width": 300,
  "height": 200,
  "sender": "other",
  "timestamp": "4:00 pm"
}
```

### File Message
```json
{
  "id": "file-1",
  "type": "file",
  "fileName": "document.pdf",
  "fileSize": "2.5 MB",
  "sender": "other",
  "timestamp": "4:15 pm"
}
```

### Catalog Message
```json
{
  "id": "catalog-1",
  "type": "catalog",
  "title": "Product Catalog",
  "items": 25,
  "sender": "other",
  "timestamp": "4:30 pm"
}
```

## Troubleshooting

### If messages don't appear:

1. **Check Console Logs**:
   - Look for `✅ Pusher connected successfully`
   - Look for `✅ Successfully subscribed to channel: chat-channel`
   - Look for `👂 Listening for event 'new-message'`

2. **Verify Configuration**:
   - Channel name must match: `chat-channel`
   - Event name must match: `new-message`
   - App key must match: `add5bbdd1a220e327bf7`
   - Cluster must match: `ap1`

3. **Check Network**:
   - Ensure your device/emulator has internet connection
   - Check if Pusher connection is established (look for connection logs)

4. **Verify Event Data**:
   - Ensure JSON is valid
   - Ensure required fields are present (id, type, sender, timestamp)

## Connection Status

Watch for these console messages:

- `✅ Pusher connected successfully` - Connection established
- `✅ Successfully subscribed to channel: chat-channel` - Subscribed to channel
- `👂 Listening for event 'new-message'` - Event listener active
- `📨 Received event 'new-message'` - Event received
- `💾 Message saved to SQLite` - Message persisted
- `✅ Message added to UI` - Message displayed

## Next Steps

Once you've verified real-time updates work:
1. Integrate with your backend API
2. Send messages from your backend using Pusher SDK
3. Messages will automatically appear in the app in real-time

