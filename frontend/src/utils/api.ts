import { CitizenInfo, ViolationStats, BlogPost } from "@/types";

// Mock data for demonstration
export const fetchViolationStats = async (): Promise<ViolationStats[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { month: "Tháng 1", violations: 45, year: 2024 },
        { month: "Tháng 2", violations: 52, year: 2024 },
        { month: "Tháng 3", violations: 38, year: 2024 },
        { month: "Tháng 4", violations: 61, year: 2024 },
        { month: "Tháng 5", violations: 48, year: 2024 },
        { month: "Tháng 6", violations: 55, year: 2024 },
        { month: "Tháng 7", violations: 70, year: 2024 },
        { month: "Tháng 8", violations: 63, year: 2024 },
        { month: "Tháng 9", violations: 58, year: 2024 },
        { month: "Tháng 10", violations: 67, year: 2024 },
        { month: "Tháng 11", violations: 72, year: 2024 },
        { month: "Tháng 12", violations: 80, year: 2024 },
      ]);
    }, 500);
  });
};

export const searchByCCCD = async (cccd: string): Promise<CitizenInfo | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      if (cccd === "001234567890") {
        resolve({
          cccd: "001234567890",
          name: "Nguyễn Văn A",
          birthDate: "15/03/1985",
          address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
          violations: [
            {
              id: "V001",
              date: "15/11/2024",
              location: "Đường Nguyễn Huệ, Quận 1",
              alcoholLevel: 0.45,
              fine: 8000000,
              status: "unpaid",
            },
            {
              id: "V002",
              date: "03/08/2024",
              location: "Xa lộ Hà Nội, Quận 9",
              alcoholLevel: 0.32,
              fine: 7000000,
              status: "paid",
            },
          ],
        });
      } else {
        resolve(null);
      }
    }, 800);
  });
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Quy định mới về xử phạt vi phạm nồng độ cồn năm 2024",
          excerpt: "Chính phủ vừa ban hành nghị định mới với mức xử phạt nghiêm khắc hơn đối với người điều khiển phương tiện có nồng độ cồn...",
          content: "",
          author: "Ban Biên Tập",
          publishDate: "20/11/2024",
          category: "Chính sách",
          imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
          readTime: "5 phút",
        },
        {
          id: "2",
          title: "Tác hại của việc lái xe sau khi uống rượu bia",
          excerpt: "Rượu bia làm giảm khả năng phản xạ, nhận thức và khả năng xử lý tình huống của người lái xe, gây nguy hiểm cho bản thân và người khác...",
          content: "",
          author: "TS. Trần Văn B",
          publishDate: "18/11/2024",
          category: "Sức khỏe",
          imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800",
          readTime: "7 phút",
        },
        {
          id: "3",
          title: "Thống kê tai nạn giao thông do rượu bia 6 tháng đầu năm",
          excerpt: "Trong 6 tháng đầu năm 2024, cả nước ghi nhận 1.234 vụ tai nạn giao thông liên quan đến nồng độ cồn, làm 456 người tử vong...",
          content: "",
          author: "Cục CSGT",
          publishDate: "15/11/2024",
          category: "Thống kê",
          imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
          readTime: "4 phút",
        },
      ]);
    }, 500);
  });
};
