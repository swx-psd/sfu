import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

type Props = {
  width?: number | string;
  height?: number | string;
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


