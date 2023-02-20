export const ok = async <T>(promise: Promise<T>) => {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
};
