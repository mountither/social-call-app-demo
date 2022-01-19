import 'react-native-reanimated'

import React from 'react'
import { Appearance, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AppNavigation from './src/navigation'
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Toast from 'react-native-toast-message';
const App = () => {
  // const colorScheme = Appearance.getColorScheme();

  return (
    <Provider store={store}>
      <SafeAreaProvider>

        <StatusBar
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
          translucent
          animated={true}
        />
        <AppNavigation />
      </SafeAreaProvider>
      <Toast />
    </Provider>

  )
}

export default App
