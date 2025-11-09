import * as SQLite from 'expo-sqlite';
import { initDatabase, saveMessage, getMessages, clearMessages } from '../../services/database';
import { Message } from '../../types';

describe('Database Integration Tests', () => {
  let db: any;

  beforeEach(async () => {
    db = await initDatabase();
    await clearMessages();
  });

  afterEach(async () => {
    await clearMessages();
  });

  it('should save and retrieve text messages', async () => {
    const message: Message = {
      id: 'test-1',
      type: 'text',
      text: 'Integration test message',
      sender: 'me',
      timestamp: '10:00 AM',
    };

    await saveMessage(message);
    const messages = await getMessages();

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Integration test message');
    expect(messages[0].sender).toBe('me');
  });

  it('should save and retrieve multiple messages', async () => {
    const messages: Message[] = [
      {
        id: 'test-1',
        type: 'text',
        text: 'First message',
        sender: 'me',
        timestamp: '10:00 AM',
      },
      {
        id: 'test-2',
        type: 'text',
        text: 'Second message',
        sender: 'other',
        timestamp: '10:01 AM',
      },
      {
        id: 'test-3',
        type: 'image',
        uri: 'file://image.jpg',
        sender: 'me',
        timestamp: '10:02 AM',
      },
    ];

    for (const message of messages) {
      await saveMessage(message);
    }

    const retrievedMessages = await getMessages();

    expect(retrievedMessages).toHaveLength(3);
    expect(retrievedMessages[0].id).toBe('test-1');
    expect(retrievedMessages[1].id).toBe('test-2');
    expect(retrievedMessages[2].id).toBe('test-3');
  });

  it('should update existing message on save', async () => {
    const message: Message = {
      id: 'test-1',
      type: 'text',
      text: 'Original message',
      sender: 'me',
      timestamp: '10:00 AM',
    };

    await saveMessage(message);

    const updatedMessage: Message = {
      ...message,
      text: 'Updated message',
    };

    await saveMessage(updatedMessage);
    const messages = await getMessages();

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Updated message');
  });

  it('should handle different message types', async () => {
    const messageTypes: Message['type'][] = ['text', 'image', 'video', 'gif', 'file', 'catalog'];

    for (const type of messageTypes) {
      const message: Message = {
        id: `test-${type}`,
        type,
        sender: 'me',
        timestamp: '10:00 AM',
        ...(type === 'text' && { text: 'Test' }),
        ...(type === 'image' && { uri: 'file://image.jpg' }),
        ...(type === 'video' && { uri: 'file://video.mp4' }),
        ...(type === 'gif' && { uri: 'file://gif.gif' }),
        ...(type === 'file' && { fileName: 'test.pdf' }),
        ...(type === 'catalog' && { title: 'Catalog', items: 10 }),
      };

      await saveMessage(message);
    }

    const messages = await getMessages();
    expect(messages).toHaveLength(messageTypes.length);
  });
});

