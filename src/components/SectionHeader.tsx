import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  onShowAllPress?: () => void;
}

export default function SectionHeader({ title, onShowAllPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onShowAllPress && (
        <TouchableOpacity 
          style={styles.showAllButton} 
          onPress={() => {
            console.log('📰 "Tumunu Goster" butonuna dokunuldu:', title);
            console.log('📱 Platform:', Platform.OS);
            onShowAllPress();
          }}
          onPressIn={() => console.log('👆 "Tumunu Goster" basildi (onPressIn):', title)}
          onPressOut={() => console.log('👆 "Tumunu Goster" birakildi (onPressOut):', title)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.showAllText}>Tümünü Göster</Text>
          <Ionicons name="chevron-forward" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8, // Yan padding azaltıldı (12 → 8)
    marginBottom: 8, // Alt margin azaltıldı (12 → 8)
    marginTop: 12, // Üst margin azaltıldı (20 → 12)
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showAllText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});