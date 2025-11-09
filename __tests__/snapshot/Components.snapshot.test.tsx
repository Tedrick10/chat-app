import React from 'react';
import renderer from 'react-test-renderer';
import BottomTabBar from '../../components/BottomTabBar';
import UpdatesScreen from '../../screens/UpdatesScreen';
import SettingsScreen from '../../screens/SettingsScreen';

describe('Component Snapshot Tests', () => {
  describe('BottomTabBar', () => {
    it('should match snapshot with Chat active', () => {
      const tree = renderer
        .create(<BottomTabBar activeTab="Chat" onTabPress={jest.fn()} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should match snapshot with Updates active', () => {
      const tree = renderer
        .create(<BottomTabBar activeTab="Updates" onTabPress={jest.fn()} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should match snapshot with Settings active', () => {
      const tree = renderer
        .create(<BottomTabBar activeTab="Settings" onTabPress={jest.fn()} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('UpdatesScreen', () => {
    it('should match snapshot', () => {
      const tree = renderer.create(<UpdatesScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('SettingsScreen', () => {
    it('should match snapshot', () => {
      const tree = renderer.create(<SettingsScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
