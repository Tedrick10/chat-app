import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChattingScreen from '../../screens/ChattingScreen';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { saveMessage, getMessages, initDatabase } from '../../services/database';
import { initPusher, bindMessageEvent } from '../../services/pusherService';

jest.mock('../../services/database');
jest.mock('../../services/pusherService');
jest.mock('../../config/pusherConfig', () => ({
  pusherConfig: {
    appKey: 'test-key',
    cluster: 'us2',
    channelName: 'test-channel',
    eventName: 'test-event',
  },
}));

describe('ChattingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (initDatabase as jest.Mock).mockResolvedValue({});
    (getMessages as jest.Mock).mockResolvedValue([]);
    (initPusher as jest.Mock).mockReturnValue({ pusher: {}, channel: {} });
    (bindMessageEvent as jest.Mock).mockReturnValue(undefined);
  });

  it('should render loading state initially', () => {
    const { getByText } = render(<ChattingScreen />);
    expect(getByText('Loading messages...')).toBeTruthy();
  });

  it('should render chat interface after loading', async () => {
    const { getByPlaceholderText, getByText } = render(<ChattingScreen />);
    
    await waitFor(() => {
      expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    });
  });

  it('should send a text message', async () => {
    (getMessages as jest.Mock).mockResolvedValue([]);
    const { getByPlaceholderText, getByTestId } = render(<ChattingScreen />);
    
    await waitFor(() => {
      const input = getByPlaceholderText('Type a message...');
      fireEvent.changeText(input, 'Hello World');
      
      const sendButton = getByTestId('send-button');
      fireEvent.press(sendButton);
    });

    await waitFor(() => {
      expect(saveMessage).toHaveBeenCalled();
    });
  });

  it('should open attachment modal', async () => {
    (getMessages as jest.Mock).mockResolvedValue([]);
    const { getByText } = render(<ChattingScreen />);
    
    await waitFor(() => {
      const attachButton = getByText('+');
      fireEvent.press(attachButton);
    });

    await waitFor(() => {
      expect(getByText('Take Camera')).toBeTruthy();
      expect(getByText('Choose from Gallery')).toBeTruthy();
    });
  });

  it('should pick image from gallery', async () => {
    (getMessages as jest.Mock).mockResolvedValue([]);
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file://image.jpg',
        width: 300,
        height: 200,
      }],
    });

    const { getByText } = render(<ChattingScreen />);
    
    await waitFor(async () => {
      const attachButton = getByText('+');
      fireEvent.press(attachButton);
      
      await waitFor(() => {
        const galleryOption = getByText('Choose from Gallery');
        fireEvent.press(galleryOption);
      });
    });

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('should handle GIF selection', async () => {
    (getMessages as jest.Mock).mockResolvedValue([]);
    const { getByText } = render(<ChattingScreen />);
    
    await waitFor(() => {
      const gifButton = getByText('GIF');
      fireEvent.press(gifButton);
    });

    await waitFor(() => {
      expect(saveMessage).toHaveBeenCalled();
    });
  });
});

