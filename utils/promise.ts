export const ok = async <T>(promise: Promise<T>) => {
  try {
    await promise;
    return true;
  } catch {
    return false;
  }
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
