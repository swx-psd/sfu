import React from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle;
  radius?: number;
};

export default function Skeleton({ width = "100%", height = 16, style, radius = 8 }: Props) {
  return <View style={[styles.base, { width, height, borderRadius: radius }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#262626",
  },
});


