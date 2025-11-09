import * as SQLite from 'expo-sqlite';
import { Message } from '../types';

const dbName = 'chatapp.db';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync(dbName);
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
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
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp);
    `);

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync(dbName);
};

export const saveMessage = async (message: Message): Promise<boolean> => {
  try {
    const db = await getDatabase();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO messages (
        id, type, text, uri, width, height, fileName, fileSize, title, items, sender, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.type,
        message.text || null,
        message.uri || null,
        message.width || null,
        message.height || null,
        message.fileName || null,
        message.fileSize || null,
        message.title || null,
        message.items || null,
        message.sender,
        message.timestamp,
      ]
    );

    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getMessages = async (): Promise<Message[]> => {
  try {
    const db = await getDatabase();
    
    const result = await db.getAllAsync(
      `SELECT * FROM messages ORDER BY timestamp ASC`
    ) as any[];

    return result.map((row) => ({
      id: row.id as string,
      type: row.type as Message['type'],
      text: row.text as string | null,
      uri: row.uri as string | null,
      width: row.width as number | null,
      height: row.height as number | null,
      fileName: row.fileName as string | null,
      fileSize: row.fileSize as string | null,
      title: row.title as string | null,
      items: row.items as number | null,
      sender: row.sender as Message['sender'],
      timestamp: row.timestamp as string,
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const clearMessages = async (): Promise<boolean> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM messages');
    return true;
  } catch (error) {
    console.error('Error clearing messages:', error);
    throw error;
  }
};

