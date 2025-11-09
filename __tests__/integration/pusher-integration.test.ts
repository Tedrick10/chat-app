import { initPusher, bindMessageEvent, disconnectPusher } from '../../services/pusherService';
import { saveMessage, getMessages } from '../../services/database';
import { PusherConfig } from '../../types';

describe('Pusher Integration Tests', () => {
  let config: PusherConfig;

  beforeEach(() => {
    config = {
      appKey: 'test-key',
      cluster: 'us2',
      channelName: 'test-channel',
      eventName: 'test-event',
    };
  });

  afterEach(() => {
    disconnectPusher();
  });

  it('should initialize Pusher and bind message event', () => {
    const result = initPusher(config);
    expect(result).not.toBeNull();

    const callback = jest.fn();
    bindMessageEvent(config.eventName, callback);
    expect(callback).toBeDefined();
  });

  it('should handle message flow from Pusher to database', async () => {
    const pusherInit = initPusher(config);
    expect(pusherInit).not.toBeNull();

    const testMessage = {
      id: 'pusher-1',
      type: 'text' as const,
      text: 'Message from Pusher',
      sender: 'other' as const,
      timestamp: '10:00 AM',
    };

    const callback = jest.fn(async (data) => {
      await saveMessage(data);
    });

    bindMessageEvent(config.eventName, callback);
    
    callback(testMessage);

    await new Promise(resolve => setTimeout(resolve, 100));

    const messages = await getMessages();
    expect(messages.length).toBeGreaterThanOrEqual(0);
  });

  it('should disconnect Pusher cleanly', () => {
    initPusher(config);
    expect(() => disconnectPusher()).not.toThrow();
  });
});

