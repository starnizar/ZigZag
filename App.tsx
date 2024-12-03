import React from 'react';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SkiaScreen } from './src/screens/SkiaScreen.tsx';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

const RootStack = createNativeStackNavigator({
  screens: {
    Skia: {
      screen: SkiaScreen,
      options: {
        headerShown: false,
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);

const App = (): React.JSX.Element => {
  return <Navigation />;
};

export default gestureHandlerRootHOC(App);
