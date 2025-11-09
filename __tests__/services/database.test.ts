import * as SQLite from 'expo-sqlite';
import { initDatabase, getDatabase, saveMessage, getMessages, clearMessages } from '../../services/database';
import { Message } from '../../types';

jest.mock('expo-sqlite');

describe('Database Service', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };

    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initDatabase', () => {
    it('should initialize database and create tables', async () => {
      const db = await initDatabase();

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('chatapp.db');
      expect(mockDb.execAsync).toHaveBeenCalledTimes(2);
      expect(db).toBe(mockDb);
    });

    it('should throw error on initialization failure', async () => {
      (SQLite.openDatabaseAsync as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(initDatabase()).rejects.toThrow('DB Error');
    });
  });

  describe('getDatabase', () => {
    it('should return database instance', async () => {
      const db = await getDatabase();

      expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('chatapp.db');
      expect(db).toBe(mockDb);
    });
  });

  describe('saveMessage', () => {
    it('should save a text message', async () => {
      const message: Message = {
        id: '1',
        type: 'text',
        text: 'Hello',
        sender: 'me',
        timestamp: '10:00 AM',
      };

      const result = await saveMessage(message);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE'),
        expect.arrayContaining(['1', 'text', 'Hello', null, null, null, null, null, null, null, 'me', '10:00 AM'])
      );
      expect(result).toBe(true);
    });

    it('should save an image message', async () => {
      const message: Message = {
        id: '2',
        type: 'image',
        uri: 'file://image.jpg',
        width: 300,
        height: 200,
        sender: 'me',
        timestamp: '10:01 AM',
      };

      await saveMessage(message);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['2', 'image', null, 'file://image.jpg', 300, 200])
      );
    });

    it('should handle null values correctly', async () => {
      const message: Message = {
        id: '3',
        type: 'text',
        text: null,
        sender: 'other',
        timestamp: '10:02 AM',
      };

      await saveMessage(message);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null])
      );
    });
  });

  describe('getMessages', () => {
    it('should retrieve all messages', async () => {
      const mockMessages = [
        {
          id: '1',
          type: 'text',
          text: 'Hello',
          sender: 'me',
          timestamp: '10:00 AM',
        },
        {
          id: '2',
          type: 'image',
          uri: 'file://image.jpg',
          sender: 'other',
          timestamp: '10:01 AM',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockMessages);

      const messages = await getMessages();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM messages')
      );
      expect(messages).toHaveLength(2);
      expect(messages[0].id).toBe('1');
      expect(messages[1].id).toBe('2');
    });

    it('should return empty array on error', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Query failed'));

      const messages = await getMessages();

      expect(messages).toEqual([]);
    });
  });

  describe('clearMessages', () => {
    it('should delete all messages', async () => {
      const result = await clearMessages();

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM messages');
      expect(result).toBe(true);
    });

    it('should throw error on failure', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Delete failed'));

      await expect(clearMessages()).rejects.toThrow('Delete failed');
    });
  });
});

