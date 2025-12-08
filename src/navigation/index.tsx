import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import HomeScreen from "../screens/Home";
import SearchScreen from "../screens/Search";
import SettingsScreen from "../screens/Settings";
import MovieDetailScreen from "../screens/MovieDetail";
import TvDetailScreen from "../screens/TvDetail";
import SeasonScreen from "../screens/Season";
import EpisodeScreen from "../screens/Episode";
import ProviderContentScreen from "../screens/ProviderContent";
import TrendingListScreen from "../screens/TrendingList";
import VideoPlayerScreen from "../screens/VideoPlayer";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tabs.Navigator
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#1a1a1a',
          height: 60,
        },
        tabBarActiveTintColor: '#ff6b6b',
        tabBarInactiveTintColor: '#808080',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Arama',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ayarlar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNavigation() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: false }}>
        <Stack.Screen name="(tabs)" component={TabsNavigator} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="TvDetail" component={TvDetailScreen} />
        <Stack.Screen name="Season" component={SeasonScreen} />
        <Stack.Screen name="Episode" component={EpisodeScreen} />
        <Stack.Screen name="ProviderContent" component={ProviderContentScreen} />
        <Stack.Screen name="TrendingList" component={TrendingListScreen} />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false,
            autoHideHomeIndicator: true
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


