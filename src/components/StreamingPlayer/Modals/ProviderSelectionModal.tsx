import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamingLink } from '../../../streaming/types';
import { styles } from '../styles';

interface ProviderSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    providers: StreamingLink[];
    currentProvider: string | undefined;
    onSelect: (providerName: string) => void;
}

export const ProviderSelectionModal: React.FC<ProviderSelectionModalProps> = ({
    visible,
    onClose,
    providers,
    currentProvider,
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
                <Text style={styles.modalTitle}>Kaynak Seç</Text>
                <FlatList
                    data={providers}
                    keyExtractor={(item) => item.provider}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.modalItem,
                                currentProvider === item.provider && styles.modalItemActive
                            ]}
                            onPress={() => onSelect(item.provider)}
                        >
                            <Text style={[
                                styles.modalItemText,
                                currentProvider === item.provider && styles.modalItemTextActive
                            ]}>
                                {item.provider.charAt(0).toUpperCase() + item.provider.slice(1)}
                            </Text>
                            {currentProvider === item.provider && (
                                <Ionicons name="checkmark" size={20} color="#ff6b6b" />
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
};
