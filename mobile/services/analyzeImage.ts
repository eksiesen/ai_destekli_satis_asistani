import { ANALYZE_API_URL } from '../constants/api';
import {
  parseAnalysisResponse,
  type ScamAnalysisResult,
} from '../types/analysis';

type UploadPayload = {
  uri: string;
  fileName: string;
  mimeType: string;
};

/** React Native FormData dosya parçası (Blob tipi ile uyumsuz; RN şekli) */
type RNFilePayload = {
  uri: string;
  name: string;
  type: string;
};

export async function postAnalyzeImage(
  payload: UploadPayload,
): Promise<ScamAnalysisResult> {
  const formData = new FormData();
  const file: RNFilePayload = {
    uri: payload.uri,
    name: payload.fileName,
    type: payload.mimeType,
  };
  formData.append('file', file as unknown as Blob);

  const response = await fetch(ANALYZE_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analyze failed: ${response.status}`);
  }

  const json: unknown = await response.json();
  return parseAnalysisResponse(json);
}
