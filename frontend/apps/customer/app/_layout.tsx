import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(MaterialIcons.font);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
