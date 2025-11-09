# ChatApp - Real-Time Chat Application

A modern React Native chat application built with **Expo** and **TypeScript**, featuring real-time messaging via Pusher, local SQLite storage, and support for multiple message types. The app includes a bottom tab navigation with Updates, Chat, and Settings screens.

## Features

### Core Features
- **Real-Time Messaging**: Powered by Pusher for instant message delivery
- **Local Storage**: SQLite database for offline message persistence
- **Bottom Tab Navigation**: Three-tab interface (Updates, Chat, Settings)
- **TypeScript**: Fully typed codebase for better developer experience
- **Multiple Message Types**:
  - Text messages
  - Image messages (from gallery or camera)
  - Video messages
  - GIF messages
  - File attachments
  - Catalog messages
- **Typing Indicator**: Animated typing indicator when other users are typing
- **Modern UI**: Clean, responsive design with light gray message bubbles
- **Attachment Popup**: Easy access to camera, gallery, files, and catalog options
- **Auto-Save**: All messages (sent and received) are automatically saved to SQLite
- **Real-Time Updates**: UI updates immediately when messages are added to the database

### Navigation
- **Updates Tab**: Placeholder screen for future updates/notifications
- **Chat Tab**: Main chat interface with full messaging functionality
- **Settings Tab**: Placeholder screen for app settings

## Project Structure

```
ChatApp/
├── App.tsx                          # Main app entry point with bottom tab navigation
├── index.tsx                        # App registration
├── tsconfig.json                    # TypeScript configuration
├── jest.config.ts                   # Jest testing configuration
├── jest.setup.ts                    # Jest setup file
├── types/
│   └── index.ts                     # TypeScript type definitions
├── screens/
│   ├── ChattingScreen.tsx          # Main chat screen component
│   ├── UpdatesScreen.tsx           # Updates/notifications screen
│   └── SettingsScreen.tsx          # Settings screen
├── components/
│   └── BottomTabBar.tsx             # Custom bottom tab navigation component
├── services/
│   ├── database.ts                  # SQLite database operations
│   └── pusherService.ts             # Pusher real-time messaging service
├── config/
│   └── pusherConfig.ts              # Pusher configuration
├── __tests__/                       # Test files
│   ├── services/                    # Service unit tests
│   ├── components/                  # Component tests
│   ├── screens/                     # Screen tests
│   ├── integration/                 # Integration tests
│   ├── e2e/                         # End-to-end tests
│   ├── snapshot/                    # Snapshot tests
│   └── performance/                 # Performance tests
└── assets/                          # App assets (icons, images)
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- TypeScript knowledge (for development)
- Pusher account (for real-time messaging)
- iOS Simulator / Android Emulator or physical device

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tedrick10/chat-app.git
cd chat-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Pusher

Edit `config/pusherConfig.ts` with your Pusher credentials:

```typescript
export const pusherConfig: PusherConfig = {
  appKey: 'YOUR_PUSHER_APP_KEY',
  cluster: 'YOUR_PUSHER_CLUSTER',
  channelName: 'chat-channel',
  eventName: 'new-message',
};

export const userConfig: UserConfig = {
  userId: 'user-1',
  userName: 'Me',
};
```

**Current Configuration:**
- App Key: `add5bbdd1a220e327bf7`
- Cluster: `ap1`
- Channel Name: `chat-channel`
- Event Name: `new-message`

### 4. Start the development server

```bash
npm start
```

Or use Expo CLI:

```bash
npx expo start
```

### 5. Run on your device

- **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
- **Android**: Press `a` in the terminal or scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `expo` - Expo framework
- `expo-sqlite` - SQLite database
- `pusher-js` - Pusher WebSocket client
- `expo-image-picker` - Image/video picker
- `expo-av` - Video playback
- `expo-document-picker` - Document/file picker
- `react-native-safe-area-context` - Safe area handling
- `@react-native-community/netinfo` - Network information
- `@expo/vector-icons` - Icon library
- `typescript` - TypeScript compiler
- Testing libraries (Jest, React Testing Library, Detox)

### Step 2: Configure Pusher

1. Create a Pusher account at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Get your App Key, Secret, and Cluster from the dashboard
4. Update `config/pusherConfig.ts` with your credentials

### Step 3: Set Channel and Event Names

Update the following in `config/pusherConfig.ts`:

- **channelName**: The Pusher channel name your backend uses
- **eventName**: The Pusher event name your backend uses
- **userId**: Current user's unique identifier
- **userName**: Current user's display name

### Step 4: Run the App

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

## Testing

The project includes comprehensive testing coverage. See [TESTING.md](./TESTING.md) for detailed testing documentation.

### Quick Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit              # Unit tests only
npm run test:integration        # Integration tests only
npm run test:snapshot          # Snapshot tests only
npm run test:performance       # Performance tests only
npm run test:e2e:ios          # E2E tests (iOS)
npm run test:e2e:android      # E2E tests (Android)

# Update snapshots
npm run test:update-snapshots
```

### Test Coverage

- **Unit Tests**: Services, components, and screens
- **Integration Tests**: Database and Pusher integration
- **E2E Tests**: Complete user flows with Detox
- **Snapshot Tests**: UI component consistency
- **Performance Tests**: Database operation benchmarks

For detailed testing information, see [TESTING.md](./TESTING.md).

## Testing Real-Time Updates

### Using Pusher Debug Console

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Select your app
3. Click on **"Debug Console"** in the sidebar
4. Configure the test event:
   - **Channel**: `chat-channel`
   - **Event**: `new-message`
   - **Data**: 
   ```json
   {
     "id": "test-123",
     "type": "text",
     "text": "Hello from Pusher!",
     "sender": "other",
     "timestamp": "2:30 pm"
   }
   ```
5. Click **"Trigger Event"**
6. The message should appear in your app immediately

### Expected Console Logs

When a message is received, you should see:
- `✅ Pusher connected successfully`
- `✅ Successfully subscribed to channel: chat-channel`
- `👂 Listening for event 'new-message'`
- `📨 Received event 'new-message' on channel 'chat-channel'`
- `📬 Processing received message:`
- `💾 Message saved to SQLite`
- `✅ Message added to UI`

## Message Types

### Text Message
```json
{
  "id": "msg-1",
  "type": "text",
  "text": "Hello!",
  "sender": "other",
  "timestamp": "2:30 pm"
}
```

### Image Message
```json
{
  "id": "img-1",
  "type": "image",
  "uri": "https://example.com/image.jpg",
  "width": 300,
  "height": 200,
  "sender": "other",
  "timestamp": "2:30 pm"
}
```

### Video Message
```json
{
  "id": "vid-1",
  "type": "video",
  "uri": "https://example.com/video.mp4",
  "width": 300,
  "height": 200,
  "sender": "other",
  "timestamp": "2:30 pm"
}
```

### GIF Message
```json
{
  "id": "gif-1",
  "type": "gif",
  "uri": "https://media.giphy.com/media/example.gif",
  "sender": "other",
  "timestamp": "2:30 pm"
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
  "timestamp": "2:30 pm"
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
  "timestamp": "2:30 pm"
}
```

## Database Schema

The app uses SQLite with the following schema:

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  text TEXT,
  uri TEXT,
  width INTEGER,
  height INTEGER,
  fileName TEXT,
  fileSize TEXT,
  title TEXT,
  items INTEGER,
  sender TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Architecture

### TypeScript
The entire codebase is written in TypeScript for:
- Type safety and better IDE support
- Improved code maintainability
- Early error detection
- Better refactoring capabilities

### Navigation
The app uses a custom bottom tab navigation implementation:
- **App.tsx**: Manages tab state and renders active screen
- **BottomTabBar.tsx**: Custom tab bar component with three tabs
- Each screen is a separate component in the `screens/` directory

### State Management
- React hooks (`useState`, `useEffect`) for component state
- SQLite for persistent message storage
- Pusher for real-time message synchronization

### Services
- **database.ts**: Handles all SQLite operations (init, save, get, clear)
- **pusherService.ts**: Manages Pusher connection, subscription, and event binding

### Type Definitions
- **types/index.ts**: Centralized TypeScript type definitions
  - `Message`, `MessageType`, `MessageSender`
  - `PusherConfig`, `UserConfig`
  - `TabId`

## Backend Integration

To send messages from your backend:

1. Install Pusher SDK for your backend language
2. Trigger events to the same channel and event name:
   ```javascript
   pusher.trigger('chat-channel', 'new-message', {
     id: Date.now().toString(),
     type: 'text',
     text: 'Hello from backend!',
     sender: 'other',
     timestamp: new Date().toLocaleTimeString()
   });
   ```
3. Messages will automatically appear in the app in real-time

## Troubleshooting

### Messages not appearing
1. Check console logs for connection status
2. Verify Pusher credentials in `config/pusherConfig.ts`
3. Ensure channel name and event name match your backend
4. Check network connection

### Database errors
1. Clear app data and restart
2. Check SQLite permissions
3. Verify database initialization logs

### Pusher connection issues
1. Verify App Key and Cluster are correct
2. Check network connectivity
3. Ensure Pusher app is active in dashboard
4. Check console for connection error messages

### Navigation issues
1. Ensure all screen components are properly imported
2. Check that BottomTabBar is receiving correct props
3. Verify tab IDs match the switch statement in App.tsx

### TypeScript errors
1. Run `npm run test` to check for type errors
2. Ensure all imports are using `.ts` or `.tsx` extensions
3. Check `tsconfig.json` configuration
4. Verify type definitions in `types/index.ts`

### Testing issues
1. Clear Jest cache: `npm test -- --clearCache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check test mocks in `jest.setup.ts`
4. Verify test environment setup

## Development

### TypeScript Compilation

The project uses TypeScript with strict mode enabled. Type checking happens automatically during development.

### Code Style

- Use TypeScript for all new files
- Follow existing code patterns
- Use type definitions from `types/index.ts`
- Write tests for new features

### Building

```bash
# Development build
npm start

# Production build (when using EAS Build)
eas build --platform ios
eas build --platform android
```

## Dependencies

### Production Dependencies
- `expo`: ~54.0.23
- `expo-sqlite`: ~15.0.1
- `pusher-js`: ^8.4.0
- `expo-image-picker`: ~16.0.3
- `expo-av`: ~15.0.1
- `expo-document-picker`: ^14.0.7
- `expo-vector-icons`: ^10.0.1
- `react-native-safe-area-context`: ~5.6.0
- `@react-native-community/netinfo`: 11.4.1
- `react`: 19.1.0
- `react-native`: 0.81.5

### Development Dependencies
- `typescript`: ^5.9.3
- `@types/react`: ^19.2.2
- `@types/react-native`: ^0.72.8
- `@types/jest`: ^30.0.0
- `jest`: ^30.2.0
- `jest-expo`: ^54.0.13
- `@testing-library/react-native`: ^13.3.3
- `@testing-library/jest-native`: ^5.4.3
- `react-test-renderer`: ^19.1.0
- `detox`: Latest
- `detox-cli`: Latest

## License

This project is private and proprietary.

## Support

For issues or questions, please check:
- [Pusher Documentation](https://pusher.com/docs/channels)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Testing Guide](./TESTING.md) - Comprehensive testing documentation
# chat-app
