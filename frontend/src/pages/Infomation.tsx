import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import Card from "@/components/Card";
import { searchByCCCD } from "@/utils/api";
import { CitizenInfo } from "@/types";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Infomation = () => {
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CitizenInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!cccd.trim()) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const data = await searchByCCCD(cccd.trim());
      if (data) {
        setResult(data);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "unpaid":
        return <AlertCircle className="h-4 w-4 text-accent" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã nộp";
      case "unpaid":
        return "Chưa nộp";
      case "processing":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tra cứu thông tin</h1>
        <p className="text-muted-foreground mt-1">Tìm kiếm vi phạm theo số CCCD</p>
      </div>

      <Card>
        <div className="space-y-4">
          <SearchInput
            value={cccd}
            onChange={setCccd}
            onSearch={handleSearch}
            placeholder="Nhập số CCCD (VD: 001234567890)"
            isLoading={loading}
          />
          <p className="text-xs text-muted-foreground">
            * Nhập số CCCD 12 chữ số để tra cứu thông tin vi phạm
          </p>
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Đang tìm kiếm...</p>
          </div>
        </Card>
      )}

      {notFound && !loading && (
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Không tìm thấy thông tin</p>
            <p className="text-sm text-muted-foreground mt-1">
              Không có dữ liệu vi phạm với số CCCD này
            </p>
          </div>
        </Card>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <Card title="Thông tin cá nhân">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Số CCCD</p>
                <p className="font-medium text-foreground mt-1">{result.cccd}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium text-foreground mt-1">{result.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-medium text-foreground mt-1">{result.birthDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium text-foreground mt-1">{result.address}</p>
              </div>
            </div>
          </Card>

          <Card title="Lịch sử vi phạm" description={`Tổng ${result.violations.length} vi phạm`}>
            <div className="space-y-4">
              {result.violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">Mã vi phạm: {violation.id}</p>
                      <p className="text-sm text-muted-foreground mt-1">{violation.date}</p>
                    </div>
                    <Badge
                      variant={
                        violation.status === "paid"
                          ? "default"
                          : violation.status === "unpaid"
                          ? "destructive"
                          : "secondary"
                      }
                      className="gap-1"
                    >
                      {getStatusIcon(violation.status)}
                      {getStatusText(violation.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Địa điểm</p>
                      <p className="font-medium text-foreground mt-1">{violation.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nồng độ cồn</p>
                      <p className="font-medium text-accent mt-1">{violation.alcoholLevel} mg/l</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Số tiền phạt</p>
                      <p className="font-medium text-foreground mt-1">
                        {violation.fine.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Infomation;
