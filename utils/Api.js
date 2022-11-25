const USER_AGENT = "Conch Bay/0.1.0";

/**
 * Returns schedules and shifts. This method is throwable.
 */
const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json", {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });
  const json = await res.json();
  return json;
};

export { fetchSchedules };
