import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";

type Props = { images: { file_path: string }[] };

export default function ImageStrip({ images }: Props) {
  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={(it, idx) => `${it.file_path}-${idx}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Image style={styles.img} source={{ uri: buildTmdbImageUrl(item.file_path, "w500") }} contentFit="cover" />
        )}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  img: { width: 240, height: 135, borderRadius: 8, backgroundColor: "#222" },
});


