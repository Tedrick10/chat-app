import React from 'react';
import renderer from 'react-test-renderer';
import App from '../../App';

jest.mock('../../services/database', () => ({
  initDatabase: jest.fn(() => Promise.resolve()),
  getMessages: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../services/pusherService', () => ({
  initPusher: jest.fn(() => ({ pusher: {}, channel: {} })),
  bindMessageEvent: jest.fn(),
}));

describe('App Snapshot Tests', () => {
  it('should match App snapshot', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

