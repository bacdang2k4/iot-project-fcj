import { useMemo, useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";
import { searchByCCCD } from "@/utils/api";
import { DashboardReading } from "@/types";
import { AlertCircle, CalendarClock, UserCheck } from "lucide-react";

const Infomation = () => {
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DashboardReading[]>([]);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!cccd.trim()) return;

    setLoading(true);
    setNotFound(false);
    setResults([]);

    try {
      const data = await searchByCCCD(cccd.trim());
      if (data.length > 0) {
        setResults(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(
    () =>
      [...results].sort((a, b) => {
        if (Number.isFinite(a.timestamp) && Number.isFinite(b.timestamp)) {
          return b.timestamp - a.timestamp;
        }
        return (b.timestamp_human || "").localeCompare(a.timestamp_human || "");
      }),
    [results]
  );

  const latestRecord = sortedResults[0];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">Tra cứu thông tin</h1>
        <p className="text-lg md:text-xl text-gray-700 mt-3 drop-shadow-md">Tìm kiếm vi phạm theo số CCCD</p>
      </div>

      <Card className="py-2">
        <div className="space-y-4">
          <SearchInput
            value={cccd}
            onChange={setCccd}
            onSearch={handleSearch}
            placeholder="Nhập số CCCD (VD: 001234567890)"
            isLoading={loading}
          />
          <p className="text-sm md:text-base text-gray-700 drop-shadow-sm">
            * Nhập số CCCD 12 chữ số để tra cứu thông tin vi phạm
          </p>
        </div>
      </Card>

      {loading && (
        <Card className="py-4">
          <div className="text-center py-8">
            <p className="text-lg md:text-xl text-gray-700 drop-shadow-sm">Đang tìm kiếm...</p>
          </div>
        </Card>
      )}

      {notFound && !loading && (
        <Card className="py-4">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 md:h-20 md:w-20 text-gray-600 mx-auto mb-4 drop-shadow-lg" />
            <p className="text-xl md:text-2xl text-gray-900 font-bold drop-shadow-md">Không tìm thấy thông tin</p>
            <p className="text-base md:text-lg text-gray-700 mt-3 drop-shadow-sm">
              Không có dữ liệu vi phạm với số CCCD này
            </p>
          </div>
        </Card>
      )}

      {sortedResults.length > 0 && !loading && (
        <div className="space-y-8">
          <Card title="Kết quả tra cứu" className="py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <UserCheck className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Số CCCD đã nhập</p>
                  <p className="text-xl font-bold text-gray-900">{cccd.trim()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Số lần vi phạm</p>
                  <p className="text-xl font-bold text-gray-900">{sortedResults.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarClock className="h-10 w-10 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Lần ghi nhận gần nhất</p>
                  <p className="text-xl font-bold text-gray-900">
                    {latestRecord?.timestamp_human || "—"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Chi tiết các lần vi phạm"
            description="Dữ liệu được lấy trực tiếp từ API tìm kiếm"
            className="py-2"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-900">
                <thead>
                  <tr className="text-left text-xs md:text-sm uppercase tracking-wider text-gray-500">
                    <th className="py-3 pr-6">Thời gian</th>
                    <th className="py-3 pr-6">Nồng độ cồn</th>
                    <th className="py-3 pr-6">Thiết bị</th>
                    <th className="py-3 pr-6">Cán bộ</th>
                    <th className="py-3 pr-6">Mã cán bộ</th>
                    <th className="py-3 pr-6">Nhịp tim</th>
                    <th className="py-3 pr-6">SpO₂</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((reading) => (
                    <tr
                      key={`${reading.cccd}-${reading.timestamp}-${reading.device_id}`}
                      className="border-t border-gray-200 text-xs md:text-sm"
                    >
                      <td className="py-3 pr-6 font-medium">
                        {reading.timestamp_human || reading.timestamp}
                      </td>
                      <td className="py-3 pr-6 text-red-600 font-semibold">
                        {typeof reading.alcohol_level === "number"
                          ? `${reading.alcohol_level.toFixed(3)} mg/l`
                          : "—"}
                      </td>
                      <td className="py-3 pr-6">{reading.device_id}</td>
                      <td className="py-3 pr-6">{reading.officer_name || "—"}</td>
                      <td className="py-3 pr-6">{reading.officer_id}</td>
                      <td className="py-3 pr-6">{reading.heart_rate}</td>
                      <td className="py-3 pr-6">{reading.spo2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Infomation;
