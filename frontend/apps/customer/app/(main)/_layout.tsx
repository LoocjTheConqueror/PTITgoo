import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'home',
};

export default function MainStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
