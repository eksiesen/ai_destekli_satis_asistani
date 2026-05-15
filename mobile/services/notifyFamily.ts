import { NOTIFY_FAMILY_URL } from '../config/api';

export async function notifyFamily(params: {
  to: string;
  userFullName: string;
  riskScore: number;
  riskLevel: string;
  scamType: string;
  reasons: string[];
  analyzedUrl?: string;
  elderlyExplanation?: string;
}): Promise<void> {
  console.log("Notify family URL:", NOTIFY_FAMILY_URL);
  console.log("Notify family payload:", params);

  const response = await fetch(NOTIFY_FAMILY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const rawText = await response.text();
  console.log("Notify family response status:", response.status);
  console.log("Notify family raw response:", rawText);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    throw new Error('Invalid JSON response');
  }

  if (result.success === false) {
    throw new Error(result.error || 'Failed to notify family');
  }
}
