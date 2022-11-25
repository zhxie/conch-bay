/**
 * Returns schedules and shifts. This method is throwable.
 */
const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json");
  const json = await res.json();
  return json;
};

export { fetchSchedules };
