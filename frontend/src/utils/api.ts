import { ViolationStats, DashboardReading } from "@/types";

const DASHBOARD_API_URL =
  "https://qplgmgegck.execute-api.ap-southeast-1.amazonaws.com/dashboard";

const toDate = (reading: DashboardReading): Date | null => {
  if (Number.isFinite(reading.timestamp) && reading.timestamp > 0) {
    return new Date(reading.timestamp * 1000);
  }

  if (reading.timestamp_human) {
    const normalized = reading.timestamp_human.replace(" ", "T");
    const parsed = new Date(`${normalized}Z`);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

export const aggregateReadingsByMonth = (
  readings: DashboardReading[]
): ViolationStats[] => {
  const monthlyMap = new Map<string, ViolationStats>();

  readings.forEach((reading) => {
    const date = toDate(reading);
    if (!date) {
      return;
    }

    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const id = `${year}-${monthIndex}`;
    const label = `Tháng ${monthIndex + 1}`;

    const current = monthlyMap.get(id);
    if (current) {
      current.violations += 1;
    } else {
      monthlyMap.set(id, {
        month: label,
        violations: 1,
        year,
      });
    }
  });

  return Array.from(monthlyMap.values()).sort((a, b) => {
    if (a.year === b.year) {
      return (
        parseInt(a.month.replace("Tháng ", ""), 10) -
        parseInt(b.month.replace("Tháng ", ""), 10)
      );
    }
    return a.year - b.year;
  });
};

const parseDashboardPayload = (payload: unknown): DashboardReading[] => {
  if (!Array.isArray(payload)) {
    console.error("Dashboard payload is not an array");
    return [];
  }

  return payload.filter(
    (item): item is DashboardReading =>
      typeof item === "object" &&
      item !== null &&
      "timestamp" in item &&
      "timestamp_human" in item &&
      "officer_id" in item &&
      "device_id" in item &&
      "alcohol_level" in item &&
      "cccd" in item &&
      "spo2" in item &&
      "heart_rate" in item
  );
};

export const fetchDashboardReadings = async (): Promise<DashboardReading[]> => {
  try {
    const response = await fetch(DASHBOARD_API_URL);

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;

    return parseDashboardPayload(payload);
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    return [];
  }
};

// Fetch real dashboard data grouped by month
export const fetchViolationStats = async (): Promise<ViolationStats[]> => {
  try {
    const readings = await fetchDashboardReadings();
    return aggregateReadingsByMonth(readings);
  } catch (error) {
    console.error("Failed to aggregate dashboard data", error);
    return [];
  }
};

const SEARCH_API_URL =
  "https://qplgmgegck.execute-api.ap-southeast-1.amazonaws.com/search?cccd=";

export const searchByCCCD = async (
  cccd: string
): Promise<DashboardReading[]> => {
  if (!cccd) {
    return [];
  }

  try {
    const response = await fetch(`${SEARCH_API_URL}${encodeURIComponent(cccd)}`);

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    return parseDashboardPayload(payload);
  } catch (error) {
    console.error("Failed to fetch search data", error);
    return [];
  }
};

