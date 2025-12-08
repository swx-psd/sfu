import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { styles } from './styles';

interface SubtitleOverlayProps {
    text: string | null;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ text }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    if (!text) return null;

    return (
        <View style={[styles.subtitleContainer, { bottom: isLandscape ? 30 : 80 }]} pointerEvents="none">
            <Text style={[styles.subtitleText, { fontSize: isLandscape ? 20 : 16 }]}>{text}</Text>
        </View>
    );
};
