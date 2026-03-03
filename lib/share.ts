import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { Alert } from 'react-native';

/**
 * Captures a view as image and shares to Instagram Stories
 */
export async function shareToInstagram(viewRef: any) {
  try {
    // Capture the view as image
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device');
      return;
    }

    // Share the image
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share to Instagram',
    });
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert('Share failed', 'Could not share to Instagram');
  }
}

/**
 * Saves card image to camera roll
 */
export async function saveCardImage(viewRef: any) {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
    });

    // On iOS, we can use Sharing to save to Photos
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('Save error:', error);
    Alert.alert('Save failed', 'Could not save image');
  }
}
