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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "unpaid":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

      {result && !loading && (
        <div className="space-y-8">
          <Card title="Thông tin cá nhân" className="py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-base md:text-lg text-gray-700 drop-shadow-sm">Số CCCD</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 mt-2 drop-shadow-sm">{result.cccd}</p>
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-700 drop-shadow-sm">Họ và tên</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 mt-2 drop-shadow-sm">{result.name}</p>
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-700 drop-shadow-sm">Ngày sinh</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 mt-2 drop-shadow-sm">{result.birthDate}</p>
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-700 drop-shadow-sm">Địa chỉ</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 mt-2 drop-shadow-sm">{result.address}</p>
              </div>
            </div>
          </Card>

          <Card title="Lịch sử vi phạm" description={`Tổng ${result.violations.length} vi phạm`} className="py-2">
            <div className="space-y-4">
              {result.violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border border-white/30 rounded-xl p-5 md:p-6 hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">Mã vi phạm: {violation.id}</p>
                      <p className="text-base md:text-lg text-gray-700 mt-2 drop-shadow-sm">{violation.date}</p>
                    </div>
                    <Badge
                      variant={
                        violation.status === "paid"
                          ? "default"
                          : violation.status === "unpaid"
                          ? "destructive"
                          : "secondary"
                      }
                      className="gap-2 text-sm md:text-base px-3 py-1"
                    >
                      {getStatusIcon(violation.status)}
                      {getStatusText(violation.status)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base md:text-lg">
                    <div>
                      <p className="text-gray-700 drop-shadow-sm">Địa điểm</p>
                      <p className="font-bold text-gray-900 mt-2 drop-shadow-sm">{violation.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 drop-shadow-sm">Nồng độ cồn</p>
                      <p className="font-bold text-red-600 mt-2 drop-shadow-sm">{violation.alcoholLevel} mg/l</p>
                    </div>
                    <div>
                      <p className="text-gray-700 drop-shadow-sm">Số tiền phạt</p>
                      <p className="font-bold text-gray-900 mt-2 drop-shadow-sm">
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
