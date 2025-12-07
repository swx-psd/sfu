import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Ayarlar</Text>

            {/* Genel Ayarlar */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genel</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="moon" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Koyu Tema</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="language" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Dil</Text>
                    </View>
                    <View style={styles.settingRight}>
                        <Text style={styles.settingValue}>Türkçe</Text>
                        <Ionicons name="chevron-forward" size={20} color="#808080" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="notifications" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Bildirimler</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>
            </View>

            {/* Video Ayarları */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Video</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="videocam" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Video Kalitesi</Text>
                    </View>
                    <View style={styles.settingRight}>
                        <Text style={styles.settingValue}>Otomatik</Text>
                        <Ionicons name="chevron-forward" size={20} color="#808080" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="download" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>İndirmeler</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>
            </View>

            {/* Hesap */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hesap</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="person" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Profil</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="heart" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Favorilerim</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="time" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>İzleme Geçmişi</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>
            </View>

            {/* Hakkında */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hakkında</Text>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="information-circle" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Uygulama Hakkında</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="document-text" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Gizlilik Politikası</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="star" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Uygulamayı Değerlendirin</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#808080" />
                </TouchableOpacity>
            </View>

            {/* Test (OTA Verification) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Geliştirici</Text>
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => alert('Test v1: Güncelleme Başarılı!')}
                >
                    <View style={styles.settingLeft}>
                        <Ionicons name="construct" size={24} color="#ff6b6b" />
                        <Text style={styles.settingText}>Test Butonu</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Sürüm Bilgisi */}
            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>SecFlix v1.0.0</Text>
                <Text style={styles.versionSubText}>TMDB API kullanılmaktadır</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0b0b',
        paddingTop: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 30,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 15,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#1a1a1a',
        marginHorizontal: 20,
        marginVertical: 2,
        borderRadius: 8,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingText: {
        color: '#ffffff',
        fontSize: 16,
        marginLeft: 15,
    },
    settingValue: {
        color: '#808080',
        fontSize: 14,
        marginRight: 10,
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        marginTop: 20,
    },
    versionText: {
        color: '#808080',
        fontSize: 14,
        fontWeight: '500',
    },
    versionSubText: {
        color: '#606060',
        fontSize: 12,
        marginTop: 5,
    },
});
