import { ViolationStats, DashboardReading } from "@/types";

// SỬA 1: Lấy link từ biến môi trường (Do Amplify/Terraform bơm vào)
// Nếu chạy local mà chưa có env thì fallback về chuỗi rỗng để tránh lỗi crash
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://qplgmgegck.execute-api.ap-southeast-1.amazonaws.com"; 

const DASHBOARD_API_URL = `${API_BASE_URL}/dashboard`;
const SEARCH_API_URL = `${API_BASE_URL}/search?cccd=`;

const toDate = (reading: DashboardReading): Date | null => {
  if (Number.isFinite(reading.timestamp) && reading.timestamp > 0) {
    // SỬA 2: Backend Python đã trả về Milliseconds rồi, KHÔNG nhân 1000 nữa
    return new Date(reading.timestamp); 
  }

  if (reading.timestamp_human) {
    const normalized = reading.timestamp_human.replace(" ", "T");
    const parsed = new Date(`${normalized}Z`); // Giả sử server trả về giờ UTC
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
      // Các trường khác có thể optional tùy logic, nhưng timestamp là bắt buộc để sort
      "cccd" in item 
  );
};

export const fetchDashboardReadings = async (): Promise<DashboardReading[]> => {
  try {
    console.log("Fetching from:", DASHBOARD_API_URL); // Log để debug xem link đúng chưa
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

export const fetchViolationStats = async (): Promise<ViolationStats[]> => {
  try {
    const readings = await fetchDashboardReadings();
    return aggregateReadingsByMonth(readings);
  } catch (error) {
    console.error("Failed to aggregate dashboard data", error);
    return [];
  }
};

export const searchByCCCD = async (
  cccd: string
): Promise<DashboardReading[]> => {
  if (!cccd) {
    return [];
  }

  try {
    const url = `${SEARCH_API_URL}${encodeURIComponent(cccd)}`;
    console.log("Searching at:", url);
    
    const response = await fetch(url);

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