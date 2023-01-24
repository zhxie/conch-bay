import pRetry from "p-retry";

export const fetchRetry = async (input: RequestInfo, init?: RequestInit) => {
  return await pRetry(
    async () => {
      return await fetch(input, init);
    },
    { retries: 3 }
  );
};
