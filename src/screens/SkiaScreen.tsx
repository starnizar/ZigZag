import React, { useCallback, useEffect, useState } from 'react';
import {
  BlurMask,
  Canvas,
  Fill,
  RadialGradient,
  useFont,
  vec,
} from '@shopify/react-native-skia';
import { Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
// import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { GridVisualizer } from '../components/GridVisualizer/GridVisualizer.tsx';

const { width: WindowWidth, height: WindowHeight } = Dimensions.get('window');

const CanvasWidth = 400;
const CanvasHeight = 440;

const HSquares = 50;
const VSquares = 50;

const InternalPadding = 70;
const SquareSize = 2.5;

const fontAsset = require('../../assets/fonts/SF-Pro-Rounded-Heavy.otf');
const fontSize = 120;

export const SkiaScreen = () => {
  const font = useFont(fontAsset, fontSize);
  const text = useSharedValue<string | null>('00');

  const [tic, setTic] = useState<boolean>(false);

  // const generateRandomText = useCallback(() => {
  //   text.value = null;
  //   setTimeout(() => {
  //     text.value = Math.floor(Math.random() * 100).toString();
  //   }, 100);
  // }, [text]);
  //
  // const tapGesture = Gesture.Tap().onTouchesUp(() => {
  //   runOnJS(generateRandomText)();
  // });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      text.value = new Date().getSeconds().toString();
      setTic(prevState => !prevState);
    });

    return () => clearTimeout(timeoutId);
  }, [tic]);

  return (
    <View style={styles.container}>
      {/*<GestureDetector gesture={tapGesture}>*/}
      <Animated.View>
        <StatusBar barStyle="light-content" />

        <GridVisualizer
          text={text}
          width={CanvasWidth}
          height={CanvasHeight}
          hSquaresAmount={HSquares}
          vSquaresAmount={VSquares}
          scaleFactor={InternalPadding}
          font={font}
          squareSize={SquareSize}
        />
      </Animated.View>
      {/*</GestureDetector>*/}

      <Canvas
        style={{
          position: 'absolute',
          width: WindowWidth,
          height: WindowHeight,
          zIndex: -1,
        }}>
        <Fill>
          <RadialGradient
            c={vec(WindowWidth / 2, WindowHeight / 2)}
            r={WindowWidth}
            colors={['rgba(255,255,255,0.1)', 'transparent']}
          />
          <BlurMask blur={10} />
        </Fill>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
});
