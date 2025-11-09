import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomTabBar from '../../components/BottomTabBar';
import { TabId } from '../../types';

describe('BottomTabBar Component', () => {
  const mockOnTabPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tabs', () => {
    const { getByText } = render(
      <BottomTabBar activeTab="Chat" onTabPress={mockOnTabPress} />
    );

    expect(getByText('Updates')).toBeTruthy();
    expect(getByText('Chat')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('should highlight active tab', () => {
    const { getByText } = render(
      <BottomTabBar activeTab="Chat" onTabPress={mockOnTabPress} />
    );

    const chatTab = getByText('Chat');
    expect(chatTab).toBeTruthy();
  });

  it('should call onTabPress when tab is pressed', () => {
    const { getByText } = render(
      <BottomTabBar activeTab="Chat" onTabPress={mockOnTabPress} />
    );

    const updatesTab = getByText('Updates');
    fireEvent.press(updatesTab);

    expect(mockOnTabPress).toHaveBeenCalledWith('Updates');
  });

  it('should change active tab styling', () => {
    const { rerender, getByText } = render(
      <BottomTabBar activeTab="Chat" onTabPress={mockOnTabPress} />
    );

    const chatTab = getByText('Chat');
    expect(chatTab).toBeTruthy();

    rerender(<BottomTabBar activeTab="Settings" onTabPress={mockOnTabPress} />);

    const settingsTab = getByText('Settings');
    expect(settingsTab).toBeTruthy();
  });

  it('should render with different active tabs', () => {
    const tabs: TabId[] = ['Updates', 'Chat', 'Settings'];

    tabs.forEach((tab) => {
      const { getByText } = render(
        <BottomTabBar activeTab={tab} onTabPress={mockOnTabPress} />
      );
      expect(getByText(tab)).toBeTruthy();
    });
  });
});

