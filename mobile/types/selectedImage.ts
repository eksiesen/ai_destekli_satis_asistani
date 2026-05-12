export type SelectedImage = {
  uri: string;
  label: string;
  mimeType: string;
  /** Çoklu parça yükleme için dosya adı (RN `name` alanı) */
  fileName: string;
  /** Yalnızca web (Expo ImagePicker): gerçek File nesnesi */
  file?: File;
};
