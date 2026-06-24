export function buildViewerUrl(deviceId: string) {
  const params = new URLSearchParams({ deviceId });
  return `/dashboard/viewer?${params.toString()}`;
}

export function buildViewerSessionUrl(sessionId: string) {
  const params = new URLSearchParams({ sessionId });
  return `/dashboard/viewer?${params.toString()}`;
}
