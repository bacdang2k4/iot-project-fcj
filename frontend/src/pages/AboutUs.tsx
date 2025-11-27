import Card from "@/components/Card";
import { Shield, Target, Users, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">Giới thiệu</h1>
        <p className="text-lg md:text-xl text-gray-700 mt-3 drop-shadow-md">Về hệ thống giám sát vi phạm nồng độ cồn</p>
      </div>

      <Card className="py-2">
        <div className="prose max-w-none">
          <p className="text-base md:text-lg text-gray-800 leading-relaxed drop-shadow-sm">
            Hệ thống giám sát và xử lý vi phạm nồng độ cồn là một nền tảng công nghệ được xây dựng để hỗ trợ việc phát hiện, ghi nhận và xử lý các trường hợp vi phạm nồng độ cồn khi tham gia giao thông.
Hệ thống được triển khai trên nền tảng máy chủ đám mây hiện đại của AWS , đảm bảo hoạt động ổn định và có thể mở rộng khi cần thiết. Quá trình cập nhật và vận hành hệ thống được tự động hóa để đảm bảo tính sẵn sàng và hiệu quả.
Hệ thống giúp lực lượng chức năng dễ dàng theo dõi, ghi nhận và xử lý các trường hợp vi phạm nồng độ cồn một cách nhanh chóng và chính xác, từ đó nâng cao hiệu quả công tác kiểm tra và xử lý vi phạm trên các tuyến đường.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-2">
          <div className="flex gap-4">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-blue-300/30">
              <Shield className="h-8 w-8 md:h-10 md:w-10 text-blue-600 drop-shadow-lg" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 drop-shadow-sm">Sứ mệnh</h3>
              <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">
                Góp phần nâng cao ý thức chấp hành luật giao thông, giảm thiểu tai nạn giao thông do
                rượu bia, bảo vệ tính mạng và tài sản của người dân.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex gap-4">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-red-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-red-300/30">
              <Target className="h-8 w-8 md:h-10 md:w-10 text-red-600 drop-shadow-lg" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 drop-shadow-sm">Mục tiêu</h3>
              <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">
                Xây dựng cơ sở dữ liệu toàn diện, minh bạch về vi phạm nồng độ cồn, hỗ trợ công tác
                quản lý và xử lý hiệu quả của các cơ quan chức năng.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex gap-4">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-yellow-300/30">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-yellow-600 drop-shadow-lg" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 drop-shadow-sm">Đối tượng phục vụ</h3>
              <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">
                Cơ quan CSGT, các cơ quan quản lý nhà nước và người dân có nhu cầu tra cứu thông tin
                vi phạm giao thông.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2">
          <div className="flex gap-4">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-green-500/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-green-300/30">
              <Award className="h-8 w-8 md:h-10 md:w-10 text-green-600 drop-shadow-lg" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 drop-shadow-sm">Cam kết</h3>
              <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">
                Đảm bảo tính chính xác, bảo mật thông tin, tuân thủ các quy định pháp luật về bảo vệ
                dữ liệu cá nhân.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Tính năng chính" className="py-2">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-base md:text-lg font-bold shadow-lg">
              1
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">Dashboard thống kê</p>
              <p className="text-base md:text-lg text-gray-800 mt-1 drop-shadow-sm">
                Theo dõi số liệu vi phạm theo tháng, năm với biểu đồ trực quan
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-base md:text-lg font-bold shadow-lg">
              2
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">Tra cứu thông tin</p>
              <p className="text-base md:text-lg text-gray-800 mt-1 drop-shadow-sm">
                Tìm kiếm lịch sử vi phạm theo số CCCD nhanh chóng, chính xác
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-base md:text-lg font-bold shadow-lg">
              3
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-gray-900 drop-shadow-sm">Tin tức - Blog</p>
              <p className="text-base md:text-lg text-gray-800 mt-1 drop-shadow-sm">
                Cập nhật các quy định, chính sách và kiến thức về an toàn giao thông
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Liên hệ" className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-base md:text-lg text-gray-700 mb-3 drop-shadow-sm">Địa chỉ</h4>
            <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">Spica AWS First Cloud Journey</p>
            <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">Hồ CHí Minh, Việt Nam</p>
          </div>
          <div>
            <h4 className="font-semibold text-base md:text-lg text-gray-700 mb-3 drop-shadow-sm">Liên hệ</h4>
            <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">Email: namdhse180349@fpt.edu.vn</p>
            <p className="text-base md:text-lg text-gray-800 drop-shadow-sm">Hotline: 0911293401</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutUs;
