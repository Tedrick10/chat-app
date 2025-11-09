# Testing Guide

This document provides comprehensive information about testing the ChatApp, including unit tests, integration tests, E2E tests, snapshot tests, performance tests, and manual testing procedures.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Snapshot Testing](#snapshot-testing)
6. [Performance Testing](#performance-testing)
7. [Manual & Exploratory Testing](#manual--exploratory-testing)
8. [Running Tests](#running-tests)
9. [Test Coverage](#test-coverage)

## Testing Overview

The ChatApp uses a comprehensive testing strategy covering all aspects of the application:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between services and components
- **E2E Tests**: Test complete user flows using Detox
- **Snapshot Tests**: Ensure UI consistency over time
- **Performance Tests**: Validate database and service performance
- **Manual Tests**: Human-driven exploratory testing

## Unit Testing

Unit tests verify that individual functions, components, and services work correctly in isolation.

### Test Files

- `__tests__/services/database.test.ts` - Database service unit tests
- `__tests__/services/pusherService.test.ts` - Pusher service unit tests
- `__tests__/components/BottomTabBar.test.tsx` - Bottom tab bar component tests
- `__tests__/screens/ChattingScreen.test.tsx` - Chat screen component tests
- `__tests__/screens/UpdatesScreen.test.tsx` - Updates screen tests
- `__tests__/screens/SettingsScreen.test.tsx` - Settings screen tests

### Running Unit Tests

```bash
npm run test:unit
```

### Example Unit Test

```typescript
describe('Database Service', () => {
  it('should save a text message', async () => {
    const message: Message = {
      id: '1',
      type: 'text',
      text: 'Hello',
      sender: 'me',
      timestamp: '10:00 AM',
    };

    const result = await saveMessage(message);
    expect(result).toBe(true);
  });
});
```

## Integration Testing

Integration tests verify that multiple components and services work together correctly.

### Test Files

- `__tests__/integration/database-integration.test.ts` - Database integration tests
- `__tests__/integration/pusher-integration.test.ts` - Pusher integration tests

### Running Integration Tests

```bash
npm run test:integration
```

### What Integration Tests Cover

- Database operations with real SQLite database
- Message flow from Pusher to database to UI
- Service interactions
- Component-service integration

## E2E Testing

End-to-end tests verify complete user flows using Detox, simulating real user interactions.

### Prerequisites

1. Install Detox CLI globally:
```bash
npm install -g detox-cli
```

2. Build the app:
```bash
# iOS
detox build --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
```

### Test Files

- `__tests__/e2e/chat.e2e.test.ts` - Chat functionality E2E tests

### Running E2E Tests

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android
```

### E2E Test Scenarios

1. **App Launch**: Verify app launches correctly
2. **Tab Navigation**: Test navigation between Updates, Chat, and Settings tabs
3. **Message Sending**: Test sending text messages
4. **Typing Indicator**: Verify typing indicator appears
5. **Attachment Modal**: Test opening attachment options

### Example E2E Test

```typescript
it('should send a text message', async () => {
  await element(by.id('message-input')).typeText('Hello, this is a test message');
  await element(by.id('send-button')).tap();
  await expect(element(by.text('Hello, this is a test message'))).toBeVisible();
});
```

## Snapshot Testing

Snapshot tests capture component output and compare it against stored snapshots to detect unintended UI changes.

### Test Files

- `__tests__/snapshot/App.snapshot.test.tsx` - App component snapshots
- `__tests__/snapshot/Components.snapshot.test.tsx` - Component snapshots

### Running Snapshot Tests

```bash
npm run test:snapshot
```

### Updating Snapshots

When intentional UI changes are made:

```bash
npm run test:update-snapshots
```

### What Snapshot Tests Cover

- App component structure
- BottomTabBar in different states
- Screen components (Updates, Settings)
- UI consistency

## Performance Testing

Performance tests validate that the application meets performance requirements, especially for database operations.

### Test Files

- `__tests__/performance/database.performance.test.ts` - Database performance tests

### Running Performance Tests

```bash
npm run test:performance
```

### Performance Benchmarks

- **Save 100 messages**: Should complete in < 5 seconds
- **Retrieve 100 messages**: Should complete in < 1 second
- **Concurrent saves**: 50 concurrent saves should complete in < 3 seconds

### Example Performance Test

```typescript
it('should save 100 messages in reasonable time', async () => {
  const startTime = Date.now();
  
  for (let i = 0; i < 100; i++) {
    await saveMessage({
      id: `perf-${i}`,
      type: 'text',
      text: `Message ${i}`,
      sender: 'me',
      timestamp: '10:00 AM',
    });
  }
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(5000);
});
```

## Manual & Exploratory Testing

Manual testing involves human testers exploring the application to find issues that automated tests might miss.

### Manual Testing Checklist

#### Navigation Testing
- [ ] App launches successfully
- [ ] Bottom tab navigation works correctly
- [ ] All three tabs (Updates, Chat, Settings) are accessible
- [ ] Active tab is highlighted correctly
- [ ] Tab switching is smooth

#### Chat Functionality
- [ ] Text messages can be sent
- [ ] Messages appear in chat immediately
- [ ] Message bubbles are styled correctly
- [ ] Timestamps display correctly
- [ ] Typing indicator appears when sending
- [ ] Typing indicator animates correctly

#### Media Messages
- [ ] Image can be selected from gallery
- [ ] Image can be taken with camera
- [ ] Images display correctly in chat
- [ ] Video can be selected from gallery
- [ ] Videos play correctly
- [ ] GIF button works
- [ ] GIFs display and animate

#### File Attachments
- [ ] File picker opens correctly
- [ ] Files can be selected
- [ ] File messages display correctly
- [ ] File names and sizes show correctly

#### Catalog Messages
- [ ] Catalog option appears in attachment modal
- [ ] Catalog messages are sent correctly
- [ ] Catalog messages display correctly

#### Real-Time Features
- [ ] Pusher connection is established
- [ ] Messages received via Pusher appear in chat
- [ ] Messages are saved to database automatically
- [ ] UI updates when new messages arrive

#### Database Persistence
- [ ] Messages persist after app restart
- [ ] Messages load correctly on app launch
- [ ] Database operations are fast

#### UI/UX Testing
- [ ] Header displays correctly
- [ ] Profile image loads
- [ ] Verified badge shows
- [ ] Status indicator works
- [ ] Subscribers button displays
- [ ] Input area is accessible
- [ ] Keyboard appears/disappears correctly
- [ ] Attachment modal opens/closes smoothly
- [ ] Modal animations are smooth

#### Error Handling
- [ ] App handles network errors gracefully
- [ ] App handles database errors gracefully
- [ ] Permission requests work correctly
- [ ] Error messages are user-friendly

### Exploratory Testing Scenarios

1. **Rapid Message Sending**
   - Send 20 messages quickly
   - Verify all messages appear
   - Check for performance issues

2. **Large Media Files**
   - Send large images
   - Send long videos
   - Verify app handles large files

3. **Network Interruption**
   - Disable network while sending
   - Re-enable network
   - Verify message delivery

4. **App Backgrounding**
   - Send message
   - Background app
   - Return to app
   - Verify state is maintained

5. **Multiple Tabs**
   - Switch between tabs rapidly
   - Verify no crashes
   - Verify state is maintained

6. **Edge Cases**
   - Send empty message (should be prevented)
   - Send very long message
   - Send special characters
   - Send emojis

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Snapshot tests only
npm run test:snapshot

# Performance tests only
npm run test:performance

# E2E tests
npm run test:e2e:ios
npm run test:e2e:android
```

## Test Coverage

### Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical paths covered
- **E2E Tests**: All major user flows covered
- **Snapshot Tests**: All UI components covered

### Viewing Coverage Report

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in a browser.

### Coverage Areas

- Services: database.ts, pusherService.ts
- Components: BottomTabBar, all screens
- Utilities: Type definitions, configs

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up after each test
3. **Mocking**: Mock external dependencies
4. **Descriptive Names**: Use clear test descriptions
5. **AAA Pattern**: Arrange, Act, Assert
6. **Edge Cases**: Test edge cases and error conditions
7. **Performance**: Keep tests fast
8. **Maintainability**: Keep tests simple and readable

## Troubleshooting

### Tests Failing

1. Clear Jest cache: `npm test -- --clearCache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check mocks are properly configured
4. Verify test environment setup

### E2E Tests Not Running

1. Ensure app is built: `detox build`
2. Check device/simulator is running
3. Verify Detox configuration
4. Check network connectivity

### Snapshot Tests Failing

1. Review changes to ensure they're intentional
2. Update snapshots: `npm run test:update-snapshots`
3. Commit updated snapshots

## Continuous Integration

Tests should run automatically in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e:ios
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing-with-jest/)
