import Pusher from 'pusher-js';
import { initPusher, bindMessageEvent, unbindMessageEvent, disconnectPusher, getPusher, getChannel } from '../../services/pusherService';
import { PusherConfig } from '../../types';

jest.mock('pusher-js');

describe('Pusher Service', () => {
  let mockPusher: any;
  let mockChannel: any;
  let config: PusherConfig;

  beforeEach(() => {
    mockChannel = {
      bind: jest.fn(),
      unbind: jest.fn(),
      name: 'test-channel',
    };

    mockPusher = {
      subscribe: jest.fn(() => mockChannel),
      connection: {
        bind: jest.fn(),
      },
      disconnect: jest.fn(),
    };

    (Pusher as jest.Mock).mockImplementation(() => mockPusher);

    config = {
      appKey: 'test-key',
      cluster: 'us2',
      channelName: 'test-channel',
      eventName: 'test-event',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initPusher', () => {
    it('should initialize Pusher with correct config', () => {
      const result = initPusher(config);

      expect(Pusher).toHaveBeenCalledWith('test-key', {
        cluster: 'us2',
        encrypted: true,
      });
      expect(mockPusher.subscribe).toHaveBeenCalledWith('test-channel');
      expect(result).toEqual({ pusher: mockPusher, channel: mockChannel });
    });

    it('should bind connection events', () => {
      initPusher(config);

      expect(mockPusher.connection.bind).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockPusher.connection.bind).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockPusher.connection.bind).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should bind subscription events', () => {
      initPusher(config);

      expect(mockChannel.bind).toHaveBeenCalledWith('pusher:subscription_succeeded', expect.any(Function));
      expect(mockChannel.bind).toHaveBeenCalledWith('pusher:subscription_error', expect.any(Function));
    });

    it('should return null if config is incomplete', () => {
      const incompleteConfig = { ...config, appKey: '' };
      const result = initPusher(incompleteConfig);

      expect(result).toBeNull();
    });

    it('should return null on error', () => {
      (Pusher as jest.Mock).mockImplementation(() => {
        throw new Error('Init failed');
      });

      const result = initPusher(config);

      expect(result).toBeNull();
    });
  });

  describe('bindMessageEvent', () => {
    it('should bind event with callback', () => {
      initPusher(config);
      const callback = jest.fn();

      bindMessageEvent('test-event', callback);

      expect(mockChannel.bind).toHaveBeenCalledWith('test-event', expect.any(Function));
    });

    it('should not bind if channel is not initialized', () => {
      const callback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      bindMessageEvent('test-event', callback);

      expect(consoleSpy).toHaveBeenCalledWith('Channel not initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('unbindMessageEvent', () => {
    it('should unbind event', () => {
      initPusher(config);

      unbindMessageEvent('test-event');

      expect(mockChannel.unbind).toHaveBeenCalledWith('test-event');
    });

    it('should not unbind if channel is not initialized', () => {
      unbindMessageEvent('test-event');

      expect(mockChannel.unbind).not.toHaveBeenCalled();
    });
  });

  describe('disconnectPusher', () => {
    it('should disconnect Pusher', () => {
      initPusher(config);

      disconnectPusher();

      expect(mockPusher.disconnect).toHaveBeenCalled();
    });

    it('should handle null pusher gracefully', () => {
      expect(() => disconnectPusher()).not.toThrow();
    });
  });

  describe('getPusher and getChannel', () => {
    it('should return pusher instance', () => {
      initPusher(config);

      expect(getPusher()).toBe(mockPusher);
    });

    it('should return channel instance', () => {
      initPusher(config);

      expect(getChannel()).toBe(mockChannel);
    });
  });
});

