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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Thống kê vi phạm nồng độ cồn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng vi phạm</p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalViolations}</p>
              <p className="text-xs text-muted-foreground mt-1">Năm 2024</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trung bình/tháng</p>
              <p className="text-2xl font-bold text-foreground mt-2">{avgViolations}</p>
              <p className="text-xs text-success mt-1">↓ 12% so với năm trước</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Người vi phạm</p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalViolations - 87}</p>
              <p className="text-xs text-muted-foreground mt-1">Người duy nhất</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card title="Thống kê theo tháng" description="Số lượng vi phạm theo từng tháng trong năm 2024">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="violations" name="Số vi phạm" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Yearly Summary */}
      <Card title="Phân tích năm 2024" description="Tổng quan về tình hình vi phạm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Mức độ nghiêm trọng</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Rất cao (&gt;0.8 mg/l)</span>
                <span className="text-sm font-medium text-accent">23%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cao (0.5-0.8 mg/l)</span>
                <span className="text-sm font-medium text-warning">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Trung bình (&lt;0.5 mg/l)</span>
                <span className="text-sm font-medium text-primary">42%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Thời gian vi phạm</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cuối tuần</span>
                <span className="text-sm font-medium">58%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Ngày thường</span>
                <span className="text-sm font-medium">42%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
