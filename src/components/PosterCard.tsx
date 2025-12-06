import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";

type Props = {
  title: string;
  posterPath?: string | null;
};

export default function PosterCard({ title, posterPath }: Props) {
  const uri = buildTmdbImageUrl(posterPath, "w300");

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
  container: { width: '100%' },
  image: { width: '100%', aspectRatio: 2 / 3, borderRadius: 8, backgroundColor: "#222" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  title: { marginTop: 6, fontSize: 12, color: '#ffffff' },
});


