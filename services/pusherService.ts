import Pusher from 'pusher-js';
import { PusherConfig, Message } from '../types';

let pusher: Pusher | null = null;
let channel: Pusher.Channel | null = null;

export const initPusher = (config: PusherConfig): { pusher: Pusher; channel: Pusher.Channel } | null => {
  const { appKey, cluster, channelName, eventName } = config;

  if (!appKey || !cluster || !channelName || !eventName) {
    console.error('Pusher configuration is incomplete');
    return null;
  }

  try {
    pusher = new Pusher(appKey, {
      cluster: cluster,
      encrypted: true,
    });

    pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully');
    });

    pusher.connection.bind('disconnected', () => {
      console.log('⚠️ Pusher disconnected');
    });

    pusher.connection.bind('error', (err: Error) => {
      console.error('❌ Pusher connection error:', err);
    });

    channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Successfully subscribed to channel: ${channelName}`);
    });

    channel.bind('pusher:subscription_error', (err: Error) => {
      console.error(`❌ Subscription error for channel ${channelName}:`, err);
    });

    console.log(`📡 Pusher initialized - Channel: ${channelName}, Event: ${eventName}`);

    return { pusher, channel };
  } catch (error) {
    console.error('Error initializing Pusher:', error);
    return null;
  }
};

export const bindMessageEvent = (eventName: string, callback: (data: Message) => void): void => {
  if (!channel) {
    console.error('Channel not initialized');
    return;
  }

  channel.bind(eventName, (data: Message) => {
    console.log(`📨 Received event '${eventName}' on channel '${channel?.name}':`, data);
    if (callback && typeof callback === 'function') {
      callback(data);
    }
  });

  console.log(`👂 Listening for event '${eventName}' on channel '${channel.name}'`);
};

export const unbindMessageEvent = (eventName: string): void => {
  if (!channel) {
    return;
  }
  channel.unbind(eventName);
};

export const disconnectPusher = (): void => {
  if (pusher) {
    pusher.disconnect();
    pusher = null;
    channel = null;
  }
};

export const getPusher = (): Pusher | null => pusher;

export const getChannel = (): Pusher.Channel | null => channel;

