import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Host, Slider } from '@expo/ui/swift-ui';

import { Pointer } from './Pointer';
import { getTimeInTimezone } from '../utils/date';
import { scheduleOnRN } from 'react-native-worklets';

const clockImage = require('../assets/clock.png');
const { width } = Dimensions.get('window');

const TIMING_CONFIG = {
  duration: 600,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

// Timezones
const LONDON = getTimeInTimezone('Europe/London');
const NEW_YORK = getTimeInTimezone('America/New_York');
const TOKYO = getTimeInTimezone('Asia/Tokyo');

// ------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------
export const ClockContainer = () => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isReset, setIsReset] = useState(false);

  const animAddition = useSharedValue(0);
  const otherAnimAddition = useSharedValue(0);

  // Animate on slider change
  useEffect(() => {
    const rounded = Math.round(sliderValue);

    // RESET mode
    if (isReset) {
      animAddition.value = withTiming(0, TIMING_CONFIG, () => {
        scheduleOnRN(setSliderValue, 0);
        scheduleOnRN(setIsReset, false);
      });
      otherAnimAddition.value = withTiming(0, TIMING_CONFIG);
      return;
    }

    // NORMAL mode
    animAddition.value = rounded;
    otherAnimAddition.value = withDelay(
      400,
      withTiming(rounded, TIMING_CONFIG),
    );

  }, [sliderValue, isReset]);

  return (
    <View style={styles.container}>
      <ClockFace
        animAddition={animAddition}
        otherAnimAddition={otherAnimAddition}
      />

      <SliderPanel
        sliderValue={sliderValue}
        onChange={setSliderValue}
        setIsReset={setIsReset}
      />
    </View>
  );
};

// ------------------------------------------------------
// CLOCK FACE
// ------------------------------------------------------
const ClockFace = ({
  animAddition,
  otherAnimAddition,
}: {
  animAddition: SharedValue<number>;
  otherAnimAddition: SharedValue<number>;
}) => {
  return (
    <View style={styles.clockWrapper}>
      <Animated.Image
        source={clockImage}
        style={styles.clockImage}
        resizeMode="cover"
      />

      {/* center dot */}
      <View style={styles.dot} />

      <Pointer time={LONDON} addition={animAddition} timezone="London" isHere />
      <Pointer
        time={NEW_YORK}
        addition={otherAnimAddition}
        timezone="New York"
        isHere={false}
      />
      <Pointer
        time={TOKYO}
        addition={otherAnimAddition}
        timezone="Tokyo"
        isHere={false}
      />
    </View>
  );
};

// ------------------------------------------------------
// SLIDER PANEL
// ------------------------------------------------------
const SliderPanel = ({
  sliderValue,
  onChange,
  setIsReset,
}: {
  sliderValue: number;
  onChange: (v: number) => void;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <GlassView style={styles.sliderPanel} glassEffectStyle="regular">
      <TouchableOpacity
        onPress={() => setIsReset(true)}
        style={styles.resetBtn}
      >
        <Feather name="rotate-ccw" size={16} color="#FF6301" />
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>-12h</Text>

        <Host style={{ flex: 1, minHeight: 40 }}>
          <Slider
            value={sliderValue}
            color="#FF6301"
            steps={25}
            min={-12}
            max={12}
            onValueChange={onChange}
          />
        </Host>

        <Text style={styles.sliderLabel}>+12h</Text>
      </View>

      <Dots />
    </GlassView>
  );
};

// ------------------------------------------------------
// DOTTED LINE
// ------------------------------------------------------
const Dots = () => {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 20 }).map((_, i) => (
        <Text key={i} style={styles.dotText}>
          ⋅
        </Text>
      ))}
    </View>
  );
};

// ------------------------------------------------------
// STYLES
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockWrapper: {
    width: width - 32,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 9999,
  },
  clockImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.05 }],
    position: 'absolute',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 10,
    backgroundColor: '#FF6301',
    position: 'absolute',
    zIndex: 10,
  },
  sliderPanel: {
    width: '90%',
    padding: 16,
    paddingVertical: 20,
    marginTop: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
  resetText: {
    color: '#FF6301',
    fontWeight: '500',
  },
  sliderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sliderLabel: {
    fontWeight: '300',
    color: '#9C9A9E',
    fontSize: 12,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    paddingLeft: 52,
    zIndex: -1,
    pointerEvents: 'none',
  },
  dotText: {
    fontSize: 14,
  },
});