import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

type ImageAsset = Pick<
  ImagePicker.ImagePickerAsset,
  'uri' | 'fileName' | 'mimeType' | 'file'
>;

export const createImageUploadFormData = (
  asset: ImageAsset,
  fieldName = 'file'
) => {
  const formData = new FormData();

  if (Platform.OS === 'web' && asset.file) {
    formData.append(fieldName, asset.file);
    return formData;
  }

  formData.append(
    fieldName,
    {
      uri: asset.uri,
      name: asset.fileName || `upload-${Date.now()}.jpg`,
      type: asset.mimeType || asset.file?.type || 'image/jpeg',
    } as any
  );

  return formData;
};
