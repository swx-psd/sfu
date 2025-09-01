import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Constants from "expo-constants";

type Props = {
  title: string;
  posterPath?: string | null;
};

export default function PosterCard({ title, posterPath }: Props) {
  const imageBase = (Constants.expoConfig?.extra as any)?.tmdb?.imageBase || "https://image.tmdb.org/t/p/";
  const uri = posterPath ? `${imageBase}w300${posterPath}` : undefined;

  return (
    <View style={styles.container}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <Text numberOfLines={2} style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 120 },
  image: { width: 120, height: 180, borderRadius: 8, backgroundColor: "#222" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  title: { marginTop: 6, fontSize: 12 },
});


