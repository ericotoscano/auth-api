export const filterDetails = (
  details: Record<string, any>
): Record<string, any> => {
  if (!details || typeof details !== "object") {
    return {};
  }

  const SENSITIVE_ = [
    "password",
    "confirm",
    "token",
    "secret",
    "key",
    "authorization",
  ];

  const out: Record<string, boolean> = {};

  for (const key of Object.keys(details)) {
    out[key] = "***REDACTED***";
  }

  return out;
};

export const filterBody = (body: any): Record<string, any> => {
  if (!body || typeof body !== "object") return body;

  const SENSITIVE_KEYS = [
    "password",
    "confirm",
    "token",
    "secret",
    "key",
    "authorization",
  ];

  const out: Record<string, any> = { ...body };

  for (const key of Object.keys(out)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      out[key] = "***REDACTED***";
    }
  }

  return out;
};
