import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "@/components/Card";
import { fetchViolationStats } from "@/utils/api";
import { ViolationStats } from "@/types";
import { TrendingUp, AlertCircle, Users } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState<ViolationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchViolationStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const totalViolations = stats.reduce((sum, item) => sum + item.violations, 0);
  const avgViolations = Math.round(totalViolations / stats.length);

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
              <p className="text-sm md:text-base text-gray-600 mt-2 drop-shadow-sm">Năm 2024</p>
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
              <p className="text-sm md:text-base text-green-600 mt-2 drop-shadow-sm font-medium">↓ 12% so với năm trước</p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-300/30 ml-4">
              <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-blue-600 drop-shadow-lg" />
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-base md:text-lg font-semibold text-gray-700 drop-shadow-sm">Người vi phạm</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 drop-shadow-md">{totalViolations - 87}</p>
              <p className="text-sm md:text-base text-gray-600 mt-2 drop-shadow-sm">Người duy nhất</p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center border border-yellow-300/30 ml-4">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-yellow-600 drop-shadow-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card title="Thống kê theo tháng" description="Số lượng vi phạm theo từng tháng trong năm 2024" className="py-2">
        {loading ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-lg text-gray-600 drop-shadow-sm">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis dataKey="month" stroke="rgba(0,0,0,0.6)" fontSize={14} />
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

      {/* Yearly Summary */}
      <Card title="Phân tích năm 2024" description="Tổng quan về tình hình vi phạm" className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-base md:text-lg text-gray-700 mb-4 drop-shadow-sm">Mức độ nghiêm trọng</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg text-gray-800 drop-shadow-sm">Rất cao (&gt;0.8 mg/l)</span>
                <span className="text-lg md:text-xl font-bold text-red-600 drop-shadow-sm">23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg text-gray-800 drop-shadow-sm">Cao (0.5-0.8 mg/l)</span>
                <span className="text-lg md:text-xl font-bold text-yellow-600 drop-shadow-sm">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg text-gray-800 drop-shadow-sm">Trung bình (&lt;0.5 mg/l)</span>
                <span className="text-lg md:text-xl font-bold text-blue-600 drop-shadow-sm">42%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-base md:text-lg text-gray-700 mb-4 drop-shadow-sm">Thời gian vi phạm</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg text-gray-800 drop-shadow-sm">Cuối tuần</span>
                <span className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">58%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base md:text-lg text-gray-800 drop-shadow-sm">Ngày thường</span>
                <span className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">42%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
};

export default Dashboard;
