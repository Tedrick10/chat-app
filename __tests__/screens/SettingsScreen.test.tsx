import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../../screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('should render correctly', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Settings coming soon')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<SettingsScreen />);
    expect(tree).toMatchSnapshot();
  });
});

