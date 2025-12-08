import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamingLink } from '../../../streaming/types';
import { styles } from '../styles';

interface QualitySelectionModalProps {
    visible: boolean;
    onClose: () => void;
    links: StreamingLink[];
    currentLink: StreamingLink | undefined;
    onSelect: (link: StreamingLink) => void;
}

export const QualitySelectionModal: React.FC<QualitySelectionModalProps> = ({
    visible,
    onClose,
    links,
    currentLink,
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
                <Text style={styles.modalTitle}>Kalite Seç</Text>
                <FlatList
                    data={links}
                    keyExtractor={(item, index) => `${item.provider}-${index}`}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.modalItem,
                                currentLink === item && styles.modalItemActive
                            ]}
                            onPress={() => onSelect(item)}
                        >
                            <Text style={[
                                styles.modalItemText,
                                currentLink === item && styles.modalItemTextActive
                            ]}>
                                {item.quality}
                            </Text>
                            {currentLink === item && (
                                <Ionicons name="checkmark" size={20} color="#ff6b6b" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
};
