import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'login',
};

export default function AuthStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
