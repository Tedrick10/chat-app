import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import ChattingScreen from './screens/ChattingScreen';
import UpdatesScreen from './screens/UpdatesScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomTabBar from './components/BottomTabBar';
import { TabId } from './types';

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('Chat');

  const renderScreen = (): JSX.Element => {
    switch (activeTab) {
      case 'Updates':
        return <UpdatesScreen />;
      case 'Chat':
        return <ChattingScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <ChattingScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>
        <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
  },
});

