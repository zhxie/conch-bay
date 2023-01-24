import { SplatNet } from "../../models";
import { fetchRetry } from "../fetch";

export const fetchSchedules = async () => {
  const res = await fetchRetry("https://splatoon3.ink/data/schedules.json", {});
  const json = await res.json();
  return (json as SplatNet.GraphQlResponse<SplatNet.Schedules>).data!;
};
