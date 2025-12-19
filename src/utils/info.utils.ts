export const filterInfo = (
  info: Record<string, any>,
  sensitiveKeys: string[]
): Record<string, any> => {
  if (!info || typeof info !== "object") return {};

  const out: Record<string, any> = { ...info };

  for (const key of Object.keys(info)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      out[key] = "***REDACTED***";
    }
  }

  return out;
};