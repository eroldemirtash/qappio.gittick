import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

export async function maybeRegisterPush() {
  if (Constants.appOwnership === 'expo') {
    console.warn('Push disabled in Expo Go (SDK53). Use dev build for remote push.');
    return null;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  return Notifications.getExpoPushTokenAsync();
}
