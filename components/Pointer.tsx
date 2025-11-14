import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { interpolateColor, SharedValue, useAnimatedProps, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = {
  time: Date;
  addition: SharedValue<number>;
  timezone: string;
  isHere: boolean;
};

export const Pointer: React.FC<Props> = ({ time, addition, timezone, isHere }) => {
  const hours24 = time.getHours();
  const minutes = time.getMinutes();
  const hours12 = hours24 % 12;
  const baseRotation = hours12 * 30 + minutes * 0.5;

  const mod = (n: number, m: number) => {
    'worklet';
    return ((n % m) + m) % m;
  };

  const getIsPM = (raw24: number) => {
    'worklet';
    return mod(raw24, 24) >= 12;
  };

  const ampmProgress = useDerivedValue(() => {
    const isPM = getIsPM(addition.value + hours24);
    return isPM ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 });
  });

  const rotation = useDerivedValue(() => {
    return baseRotation + addition.value * 30;
  })

  const timeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`
        }
      ]
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      ampmProgress.value,
      [0, 1],
      isHere
        ? ['#FFFFFF', '#FFFFFF'] // same when here
        : ['#030303', '#FFFFFF'] // AM dark → PM white
    );

    const normalized = rotation.value % 360;

    let rotate = '0deg';
    if (rotation.value < 0 && normalized > -180) rotate = '-180deg';
    else if (normalized > 180) rotate = '180deg';

    return {
      color,
      transform: [{ rotate }],
      textAlign: rotate === '0deg' ? 'right' : 'left',
    };
  });

  const blockColorStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      ampmProgress.value,
      [0, 1],
      isHere
        ? ['#FF6301', '#FF6301'] // if it's here, keep same color
        : ['#DEDEDE', '#030303'] // AM to PM colors
    );

    return { backgroundColor: bgColor };
  });

  const animatedProps = useAnimatedProps(() => {
    const rawHour = addition.value + hours12;
    const raw24 = addition.value + hours24;

    const finalHour = mod(Math.round(rawHour), 12) || 12;
    const isPM = getIsPM(raw24);
    const text = `${finalHour}:${minutes < 10 ? '0' : ''}${minutes} ${isPM ? 'PM' : 'AM'}`;

    return { text, defaultValue: text };
  });

  return (
    <Animated.View
      style={[
        styles.root,
        { zIndex: isHere ? 2 : 1 },
        timeStyle,
      ]}
    >
      <View style={styles.column}>
        {/* Time bubble */}
        <Animated.View
          style={[styles.bubble, blockColorStyle]}
        >
          <View style={styles.innerRow}>
            <Animated.Text style={[styles.timezoneText, textStyle]}>
              {timezone}
            </Animated.Text>
            <AnimatedTextInput
              editable={false}
              animatedProps={animatedProps}
              style={[styles.timeText, textStyle]}
            />
          </View>
        </Animated.View>

        {/* Line */}
        <Animated.View style={[styles.line, blockColorStyle]}></Animated.View>
      </View>
      <View style={{ flex: 1 }}></View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
    width: 4,
    position: 'absolute',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    width: '100%',
    height: 120,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  innerRow: {
    position: 'absolute',
    width: 120,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  timezoneText: {
    fontSize: 12,
    lineHeight: 0,
    paddingBottom: 2,
    fontWeight: '500',
  },
  timeText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 0,
    opacity: 0.6,
    textAlign: 'right',
  },
  line: {
    width: 1,
    flex: 1,
  },
});