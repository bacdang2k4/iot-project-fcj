import { useEffect, useMemo, useState } from "react";
import type { TooltipProps } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Card from "@/components/Card";
import {
  aggregateReadingsByMonth,
  fetchDashboardReadings,
} from "@/utils/api";
import { DashboardReading, ViolationStats } from "@/types";
import { TrendingUp, AlertCircle, Users } from "lucide-react";

// --- HÀM XỬ LÝ NGÀY THÁNG (ĐÃ SỬA LỖI 1970) ---
const getReadingDate = (reading: DashboardReading): Date | null => {
  let ts = reading.timestamp;

  // Kiểm tra tính hợp lệ cơ bản
  if (!Number.isFinite(ts) || ts <= 0) {
    // Fallback: Thử parse từ chuỗi timestamp_human nếu timestamp số bị lỗi
    if (reading.timestamp_human) {
      const normalized = reading.timestamp_human.replace(" ", "T");
      const parsed = new Date(`${normalized}Z`);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  }

  // --- LOGIC TỰ ĐỘNG PHÁT HIỆN ---
  // Nếu timestamp nhỏ hơn 100 tỷ (tương đương năm 1973), 
  // chắc chắn server đang trả về GIÂY (Seconds).
  // Javascript cần Mili-giây, nên ta nhân 1000.
  if (ts < 100000000000) {
    ts *= 1000;
  }
  // Ngược lại, nếu lớn hơn thì nó đã là Mili-giây rồi, giữ nguyên.

  return new Date(ts);
};
// ------------------------------------------------

const Dashboard = () => {
  const [stats, setStats] = useState<ViolationStats[]>([]);
  const [readings, setReadings] = useState<DashboardReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<"month" | "year">("month");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [severityYear, setSeverityYear] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardReadings();
        setReadings(data);
        
        // Cần đảm bảo hàm aggregateReadingsByMonth bên api.ts cũng dùng logic date tương tự
        // Nhưng tạm thời ta dùng dữ liệu raw để tính toán lại trong component này nếu cần
        setStats(aggregateReadingsByMonth(data)); 
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const availableYears = useMemo(() => {
    // Tái tạo lại danh sách năm từ readings để đảm bảo logic getReadingDate được áp dụng
    const years = new Set<number>();
    readings.forEach(r => {
        const d = getReadingDate(r);
        if (d) years.add(d.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [readings]);

  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (!severityYear && availableYears.length > 0) {
      setSeverityYear(availableYears[0]);
    }
  }, [availableYears, severityYear]);

  const totalViolations = readings.length;
  // Tính lại avg dựa trên số tháng thực tế có dữ liệu
  const avgViolations =
    stats.length > 0 ? Math.round(totalViolations / stats.length) : 0;
    
  const uniqueOffenders = new Set(readings.map((item) => item.cccd)).size;
  
  const severityDistribution = useMemo(() => {
    if (!severityYear) {
      return [];
    }

    const counts = { high: 0, medium: 0, low: 0 };
    readings.forEach((reading) => {
      const date = getReadingDate(reading);
      if (!date || date.getFullYear() !== severityYear) {
        return;
      }

      const level = reading.alcohol_level ?? 0;
      if (level >= 0.8) {
        counts.high += 1;
      } else if (level >= 0.5) {
        counts.medium += 1;
      } else {
        counts.low += 1;
      }
    });

    const total = counts.high + counts.medium + counts.low;
    if (total === 0) {
      return [];
    }

    const toPercent = (value: number) =>
      Math.round((value / total) * 100);

    return [
      {
        key: "high",
        label: "Rất cao > 0.8 mg/l",
        subLabel: "Đã uống quá mức cho phép",
        value: counts.high,
        percent: toPercent(counts.high),
        color: "#f87171",
      },
      {
        key: "medium",
        label: "Cao 0.5 - 0.8 mg/l",
        subLabel: "Cần xử lý nghiêm",
        value: counts.medium,
        percent: toPercent(counts.medium),
        color: "#fbbf24",
      },
      {
        key: "low",
        label: "Trung bình < 0.5 mg/l",
        subLabel: "Trong ngưỡng bị xử phạt",
        value: counts.low,
        percent: toPercent(counts.low),
        color: "#60a5fa",
      },
    ];
  }, [readings, severityYear]);

  const hasReadings = readings.length > 0;
  
  const monthlyChartData = useMemo(() => {
    if (!selectedYear) {
      return [];
    }

    // Tạo khung dữ liệu 12 tháng
    const template = Array.from({ length: 12 }, (_, index) => ({
      monthIndex: index,
      label: `Tháng ${index + 1}`,
      year: selectedYear,
      violations: 0,
    }));

    // Duyệt qua dữ liệu gốc để đếm (chính xác hơn dùng stats cũ)
    readings.forEach((reading) => {
        const date = getReadingDate(reading);
        if (date && date.getFullYear() === selectedYear) {
            const month = date.getMonth(); // 0-11
            template[month].violations += 1;
        }
    });

    return template;
  }, [readings, selectedYear]);

  const yearlyChartData = useMemo(() => {
    const yearMap = new Map<number, number>();
    readings.forEach((reading) => {
      const date = getReadingDate(reading);
      if (!date) {
        return;
      }
      const year = date.getFullYear();
      yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
    });

    return Array.from(yearMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, violations]) => ({
        label: `Năm ${year}`,
        year,
        violations,
      }));
  }, [readings]);

  const chartData = chartMode === "month" ? monthlyChartData : yearlyChartData;
  const hasChartData = chartData.length > 0 && chartData.some(d => d.violations > 0);

  const severityTooltipFormatter: TooltipProps<
    number,
    string
  >["formatter"] = (value, _name, payload) => {
    const percent = payload?.payload?.percent ?? 0;
    const label = payload?.payload?.label ?? "";
    return [`${value} trường hợp (${percent}%)`, label];
  };

  return (
    <>
      {/* Warning Banner - Full Width - Outside Container */}
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-r from-red-500/90 via-orange-500/90 to-red-600/90 border-y border-white/30 shadow-2xl -mt-8 mb-8 w-screen ml-[calc(-50vw+50%)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative px-6 md:px-10 lg:px-16 py-8 md:py-10 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-6">
          {/* Left Icon */}
          <div className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 animate-pulse flex-shrink-0">
            <AlertCircle className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white drop-shadow-lg" />
          </div>
          
          {/* Center Content */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
              ĐÃ UỐNG RƯỢU BIA THÌ KHÔNG LÁI XE
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mt-3 md:mt-4 drop-shadow-lg font-medium">
              An toàn cho bạn - An toàn cho mọi người
            </p>
          </div>
          
          {/* Right Content */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="text-center md:text-right">
              <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg"></p>
              <p className="text-sm md:text-base lg:text-lg text-white/90 font-medium mt-1"></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">Dashboard</h1>
        <p className="text-lg md:text-xl text-gray-700 mt-3 drop-shadow-md">Thống kê vi phạm nồng độ cồn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-gray-700 drop-shadow-sm">Tổng vi phạm</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 drop-shadow-md">{totalViolations}</p>
              <p className="text-sm md:text-base text-gray-600 mt-2 drop-shadow-sm">Số bản ghi từ API</p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-red-500/20 backdrop-blur-sm flex items-center justify-center border border-red-300/30 ml-4">
              <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-red-600 drop-shadow-lg" />
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-gray-700 drop-shadow-sm">Trung bình/tháng</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 drop-shadow-md">{avgViolations}</p>
              <p className="text-sm md:text-base text-gray-600 mt-2 drop-shadow-sm font-medium">Từ dữ liệu thực</p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-300/30 ml-4">
              <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-blue-600 drop-shadow-lg" />
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-gray-700 drop-shadow-sm">Người vi phạm duy nhất</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 drop-shadow-md">{uniqueOffenders}</p>
              <p className="text-sm md:text-base text-gray-600 mt-2 drop-shadow-sm">Dựa trên CCCD</p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center border border-yellow-300/30 ml-4">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-yellow-600 drop-shadow-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card
        title="Biểu đồ vi phạm"
        description={
          chartMode === "month"
            ? "Số lượng vi phạm theo từng tháng từ dữ liệu thực"
            : "Số lượng vi phạm theo từng năm từ dữ liệu thực"
        }
        className="py-2"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 mb-6">
          <div className="inline-flex rounded-full bg-white/10 border border-white/20 p-1 backdrop-blur-sm self-end md:self-auto">
            <button
              type="button"
              onClick={() => setChartMode("month")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                chartMode === "month"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setChartMode("year")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                chartMode === "year"
                  ? "bg-white text-gray-900 shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Theo năm
            </button>
          </div>

          {chartMode === "month" && availableYears.length > 0 && (
            <div className="flex items-center gap-3">
              <label htmlFor="year-select" className="text-sm font-semibold text-gray-700">
                Chọn năm
              </label>
              <select
                id="year-select"
                value={selectedYear ?? ""}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="rounded-lg border border-white/30 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-lg text-gray-600 drop-shadow-sm">Đang tải dữ liệu...</p>
          </div>
        ) : !hasChartData ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-lg text-gray-600 drop-shadow-sm">Không có dữ liệu từ API</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis dataKey="label" stroke="rgba(0,0,0,0.6)" fontSize={14} />
              <YAxis stroke="rgba(0,0,0,0.6)" fontSize={14} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "14px" }} />
              <Bar dataKey="violations" name="Số vi phạm" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>


      {/* Severity breakdown */}
      <Card
        title="Mức độ vi phạm"
        description="Phân bổ theo ngưỡng nồng độ cồn"
        className="py-2"
      >
        <div className="flex justify-end px-1 mb-4">
          {availableYears.length > 0 && (
            <div className="flex items-center gap-3">
              <label htmlFor="severity-year-select" className="text-sm font-semibold text-gray-700">
                Chọn năm
              </label>
              <select
                id="severity-year-select"
                value={severityYear ?? ""}
                onChange={(event) => setSeverityYear(Number(event.target.value))}
                className="rounded-lg border border-white/30 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-lg text-gray-600 drop-shadow-sm">Đang tải dữ liệu...</p>
          </div>
        ) : !severityYear || severityDistribution.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-lg text-gray-600 drop-shadow-sm">Không có dữ liệu cho năm đã chọn</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={0}
                    outerRadius={180}
                    paddingAngle={2}
                  >
                    {severityDistribution.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={severityTooltipFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {severityDistribution.map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-2xl border border-white/30 bg-white/40 p-4 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{entry.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{entry.subLabel}</p>
                    </div>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900">{entry.percent}%</p>
                    <p className="text-sm text-gray-600">{entry.value} trường hợp</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      </div>
    </>
  );
};

export default Dashboard;