export const formatErrorDetails = (
  details: Record<string, string | boolean | Date>
): Record<string, boolean> => {
  if (!details || typeof details !== "object") {
    return {};
  }

  const out: Record<string, boolean> = {};

  for (const key of Object.keys(details)) {
    out[key] = true;
  }

  return out;
};
