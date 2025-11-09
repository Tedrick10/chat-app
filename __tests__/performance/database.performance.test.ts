import { saveMessage, getMessages, clearMessages, initDatabase } from '../../services/database';
import { Message } from '../../types';

describe('Database Performance Tests', () => {
  beforeEach(async () => {
    await initDatabase();
    await clearMessages();
  });

  afterEach(async () => {
    await clearMessages();
  });

  it('should save 100 messages in reasonable time', async () => {
    const startTime = Date.now();
    const messages: Message[] = [];

    for (let i = 0; i < 100; i++) {
      messages.push({
        id: `perf-${i}`,
        type: 'text',
        text: `Message ${i}`,
        sender: i % 2 === 0 ? 'me' : 'other',
        timestamp: `10:${String(i).padStart(2, '0')} AM`,
      });
    }

    for (const message of messages) {
      await saveMessage(message);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000);
  });

  it('should retrieve 100 messages in reasonable time', async () => {
    const messages: Message[] = [];

    for (let i = 0; i < 100; i++) {
      messages.push({
        id: `perf-${i}`,
        type: 'text',
        text: `Message ${i}`,
        sender: 'me',
        timestamp: `10:${String(i).padStart(2, '0')} AM`,
      });
    }

    for (const message of messages) {
      await saveMessage(message);
    }

    const startTime = Date.now();
    const retrievedMessages = await getMessages();
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(retrievedMessages).toHaveLength(100);
    expect(duration).toBeLessThan(1000);
  });

  it('should handle concurrent saves efficiently', async () => {
    const startTime = Date.now();
    const promises: Promise<boolean>[] = [];

    for (let i = 0; i < 50; i++) {
      const message: Message = {
        id: `concurrent-${i}`,
        type: 'text',
        text: `Concurrent message ${i}`,
        sender: 'me',
        timestamp: '10:00 AM',
      };
      promises.push(saveMessage(message));
    }

    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(3000);
  });
});

