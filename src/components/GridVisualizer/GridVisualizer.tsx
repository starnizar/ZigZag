import React from 'react';
import {
  Atlas,
  Canvas,
  Fill,
  Skia,
  useRSXformBuffer,
  useRectBuffer,
  useTexture,
  type SkFont,
} from '@shopify/react-native-skia';
import {
  Extrapolation,
  interpolate,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

type GridVisualizerProps = {
  text: SharedValue<string | null>;
  font: SkFont | null;
  width: number;
  height: number;
  hSquaresAmount: number;
  vSquaresAmount: number;
  squareSize: number;

  scaleFactor: number;
};

export const GridVisualizer: React.FC<GridVisualizerProps> = ({
  text,
  font,
  width: canvasWidth,
  height: canvasHeight,
  hSquaresAmount: HSquares,
  vSquaresAmount: VSquares,
  scaleFactor,
  squareSize: squareSize,
}) => {
  const XSpacing = (canvasWidth - scaleFactor) / HSquares;
  const YSpacing = (canvasHeight - scaleFactor) / VSquares;
  const SquaresAmount = HSquares * VSquares;
  const ScaledXSpacing = canvasWidth / HSquares;
  const ScaledYSpacing = canvasHeight / VSquares;

  const animatedText = useDerivedValue(() => {
    if (!text.value || !font) {
      return null;
    }
    const textDim = font?.measureText(text.value) ?? {
      width: 0,
      height: 0,
    };
    const x = canvasWidth / 2 - textDim.width / 2;
    const y = canvasHeight / 2 + textDim.height / 2;

    const t = Skia.Path.MakeFromText(text.value, x, y, font);

    return t;
  }, [font]);

  const activeRects = useDerivedValue(() => {
    return new Array(SquaresAmount).fill(false).map((_, i) => {
      const tx = (i % HSquares) * XSpacing + (XSpacing + scaleFactor) / 2;
      const ty =
        Math.floor(i / HSquares) * YSpacing + (YSpacing + scaleFactor) / 2;

      return animatedText.value?.contains(
        tx + squareSize / 2,
        ty + squareSize / 2,
      );
    });
  }, []);

  const randomDelays = useDerivedValue(() => {
    return withSpring(
      activeRects.value.map(isActive => (isActive ? 1 : Math.random() - 0.5)),
      {
        duration: 300,
      },
    );
  }, []);

  const activeProgress = useDerivedValue(() => {
    return withSpring(
      activeRects.value.map((isActive, i) => {
        return isActive ? randomDelays.value[i] : 0;
      }),
      { mass: 2 },
    );
  }, []);

  const colors = useDerivedValue(() => {
    return activeProgress.value.map(progress => {
      const alpha = interpolate(
        progress,
        [-3, 0, 1, 2],
        [0, 0.8, 0, 0],
        Extrapolation.CLAMP,
      );
      return new Float32Array([0, 0, 0, alpha]);
    });
  }, []);

  const texture = useTexture(<Fill color={'white'} />, {
    width: canvasWidth,
    height: canvasHeight,
  });

  const transforms = useRSXformBuffer(SquaresAmount, (val, i) => {
    'worklet';

    const xShrinkedOffset = (XSpacing + scaleFactor) / 2;
    const yShrinkedOffset = (YSpacing + scaleFactor) / 2;

    const xScaledOffset = ScaledXSpacing / 2;
    const yScaledOffset = ScaledYSpacing / 2;

    const shrinkedTx = (i % HSquares) * XSpacing + xShrinkedOffset;
    const shrinkedTy = Math.floor(i / HSquares) * YSpacing + yShrinkedOffset;

    const scaledTx = (i % HSquares) * ScaledXSpacing + xScaledOffset;
    const scaledTy = Math.floor(i / HSquares) * ScaledYSpacing + yScaledOffset;

    const prog = activeProgress.value[i];
    const tx = interpolate(prog, [0, 1], [shrinkedTx, scaledTx]);
    const ty = interpolate(prog, [0, 1], [shrinkedTy, scaledTy]);

    const translatedX = tx;
    const translatedY = ty;

    const scale = interpolate(prog, [0, 1], [0.6, 0.85], Extrapolation.CLAMP);

    val.set(scale, 0, translatedX, translatedY);
  });

  const sprites = useRectBuffer(SquaresAmount, (val, j) => {
    'worklet';
    const x = (j % HSquares) * XSpacing;
    const y = Math.floor(j / HSquares) * YSpacing;
    val.setXYWH(x, y, squareSize, squareSize);
  });

  return (
    <Canvas
      mode="continuous"
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}>
      <Atlas
        image={texture}
        sprites={sprites}
        colors={colors}
        transforms={transforms}
      />
    </Canvas>
  );
};
