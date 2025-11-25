import Card from "@/components/Card";
import { Shield, Target, Users, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Giới thiệu</h1>
        <p className="text-muted-foreground mt-1">Về hệ thống giám sát vi phạm nồng độ cồn</p>
      </div>

      <Card>
        <div className="prose max-w-none">
          <p className="text-foreground leading-relaxed">
            Hệ thống giám sát và xử phạt vi phạm nồng độ cồn khi tham gia giao thông là một nền tảng
            công nghệ hiện đại, được phát triển nhằm hỗ trợ công tác quản lý, giám sát và xử lý các
            trường hợp vi phạm liên quan đến nồng độ cồn trên đường bộ.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Sứ mệnh</h3>
              <p className="text-sm text-muted-foreground">
                Góp phần nâng cao ý thức chấp hành luật giao thông, giảm thiểu tai nạn giao thông do
                rượu bia, bảo vệ tính mạng và tài sản của người dân.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Mục tiêu</h3>
              <p className="text-sm text-muted-foreground">
                Xây dựng cơ sở dữ liệu toàn diện, minh bạch về vi phạm nồng độ cồn, hỗ trợ công tác
                quản lý và xử lý hiệu quả của các cơ quan chức năng.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Đối tượng phục vụ</h3>
              <p className="text-sm text-muted-foreground">
                Cơ quan CSGT, các cơ quan quản lý nhà nước và người dân có nhu cầu tra cứu thông tin
                vi phạm giao thông.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Cam kết</h3>
              <p className="text-sm text-muted-foreground">
                Đảm bảo tính chính xác, bảo mật thông tin, tuân thủ các quy định pháp luật về bảo vệ
                dữ liệu cá nhân.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Tính năng chính">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Dashboard thống kê</p>
              <p className="text-sm text-muted-foreground">
                Theo dõi số liệu vi phạm theo tháng, năm với biểu đồ trực quan
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">Tra cứu thông tin</p>
              <p className="text-sm text-muted-foreground">
                Tìm kiếm lịch sử vi phạm theo số CCCD nhanh chóng, chính xác
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">Tin tức - Blog</p>
              <p className="text-sm text-muted-foreground">
                Cập nhật các quy định, chính sách và kiến thức về an toàn giao thông
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Liên hệ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Địa chỉ</h4>
            <p className="text-foreground">Cục CSGT - Bộ Công An</p>
            <p className="text-foreground">Hà Nội, Việt Nam</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Liên hệ</h4>
            <p className="text-foreground">Email: contact@traffic-alcohol.vn</p>
            <p className="text-foreground">Hotline: 1900 1234</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutUs;
