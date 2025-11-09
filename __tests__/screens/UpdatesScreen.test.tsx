import React from 'react';
import { render } from '@testing-library/react-native';
import UpdatesScreen from '../../screens/UpdatesScreen';

describe('UpdatesScreen', () => {
  it('should render correctly', () => {
    const { getByText } = render(<UpdatesScreen />);

    expect(getByText('Updates')).toBeTruthy();
    expect(getByText('No updates available')).toBeTruthy();
  });

  it('should match snapshot', () => {
    const tree = render(<UpdatesScreen />);
    expect(tree).toMatchSnapshot();
  });
});

