import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubtitleTrack } from '../../../api/opensubtitles';
import { styles } from '../styles';

interface SubtitleSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    isLoading: boolean;
    subtitles: SubtitleTrack[];
    selectedSubtitleId: string;
    onSelect: (track: SubtitleTrack | null) => void;
}

export const SubtitleSelectionModal: React.FC<SubtitleSelectionModalProps> = ({
    visible,
    onClose,
    isLoading,
    subtitles,
    selectedSubtitleId,
    onSelect,
}) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    if (!visible) return null;

    return (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalBackground} />
            </TouchableWithoutFeedback>
            <View style={[styles.modalContent, { width: isLandscape ? '50%' : '80%' }]}>
                <Text style={styles.modalTitle}>Altyazı Seç</Text>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#ff6b6b" />
                ) : (
                    <FlatList
                        data={[
                            { id: 'none', language: 'Yok', languageCode: 'none', filename: 'None', url: '' },
                            ...subtitles
                        ]}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const isSelected = item.id === selectedSubtitleId;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        isSelected && styles.modalItemActive
                                    ]}
                                    onPress={() => item.id === 'none' ? onSelect(null) : onSelect(item as SubtitleTrack)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.modalItemText,
                                            isSelected && styles.modalItemTextActive
                                        ]}>
                                            {item.language}
                                        </Text>
                                        {item.id !== 'none' && (
                                            <Text style={{ color: '#666', fontSize: 12 }} numberOfLines={1}>
                                                {item.filename}
                                            </Text>
                                        )}
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={20} color="#ff6b6b" />
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        </View>
    );
};
