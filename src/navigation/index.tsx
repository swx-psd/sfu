import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "react-native";
import React from "react";
import HomeScreen from "../screens/Home";
import SearchScreen from "../screens/Search";
import LibraryScreen from "../screens/Library";
import MovieDetailScreen from "../screens/MovieDetail";
import TvDetailScreen from "../screens/TvDetail";
import SeasonScreen from "../screens/Season";
import EpisodeScreen from "../screens/Episode";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tabs.Navigator detachInactiveScreens={false} screenOptions={{ freezeOnBlur: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Search" component={SearchScreen} />
      <Tabs.Screen name="Library" component={LibraryScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigation() {
  const scheme = useColorScheme();
  return (
    <NavigationContainer theme={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, freezeOnBlur: false }}>
        <Stack.Screen name="(tabs)" component={TabsNavigator} />
        <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
        <Stack.Screen name="TvDetail" component={TvDetailScreen} />
        <Stack.Screen name="Season" component={SeasonScreen} />
        <Stack.Screen name="Episode" component={EpisodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


