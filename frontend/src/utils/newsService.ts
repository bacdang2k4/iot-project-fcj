import { BlogPost } from "@/types";

// RSS feed URLs from Vietnamese news sources
const RSS_FEEDS = {
  vnexpress: "https://vnexpress.net/rss/phap-luat.rss",
  tuoitre: "https://tuoitre.vn/rss/phap-luat.rss",
  thanhnien: "https://thanhnien.vn/rss/thoi-su/phap-luat.rss",
  dantri: "https://dantri.com.vn/phap-luat.rss",
};

// Keywords to filter traffic accident news related to alcohol
const KEYWORDS = [
  "nồng độ cồn",
  "rượu bia",
  "say rượu",
  "say xỉn",
  "uống rượu",
  "uống bia",
  "cồn vượt quá",
  "vi phạm nồng độ cồn",
  "tai nạn giao thông",
  "tai nạn do rượu",
  "tai nạn do say",
  "xử phạt hành chính",
  "xử phạt vi phạm cồn",
  "xử phạt nồng độ cồn",
  "công văn xử phạt",
  "nghị định xử phạt",
  "quy định mới",
  "mức phạt",
  "phạt tiền",
  "tước bằng lái",
  "giấy phép lái xe",
  "kiểm tra nồng độ cồn",
];

// CORS proxy to fetch RSS feeds (you can use your own proxy)
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category?: string;
  image?: string;
}

// Parse RSS XML to extract news items
const parseRSS = (xmlText: string): RSSItem[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const items = xmlDoc.querySelectorAll("item");
  
  const newsItems: RSSItem[] = [];
  
  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";
    const description = item.querySelector("description")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const category = item.querySelector("category")?.textContent || "";
    
    // Extract image from description or enclosure
    let image = "";
    const enclosure = item.querySelector("enclosure");
    if (enclosure) {
      image = enclosure.getAttribute("url") || "";
    } else {
      // Try to extract image from description HTML
      const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch) {
        image = imgMatch[1];
      }
    }
    
    newsItems.push({
      title,
      link,
      description,
      pubDate,
      category,
      image,
    });
  });
  
  return newsItems;
};

// Check if content matches keywords
const matchesKeywords = (title: string, description: string): boolean => {
  const content = (title + " " + description).toLowerCase();
  return KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
};

// Format date from RSS to Vietnamese format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

// Strip HTML tags from description
const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Calculate estimated reading time
const calculateReadTime = (text: string): string => {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút`;
};

// Fetch news from a single RSS feed
const fetchFromFeed = async (feedUrl: string, source: string): Promise<BlogPost[]> => {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(feedUrl));
    const xmlText = await response.text();
    const items = parseRSS(xmlText);
    
    // Filter items that match keywords
    const filtered = items.filter(item => 
      matchesKeywords(item.title, item.description)
    );
    
    // Convert to BlogPost format
    return filtered.map((item, index) => ({
      id: `${source}-${index}-${Date.now()}`,
      title: item.title,
      excerpt: stripHtml(item.description).substring(0, 200) + "...",
      content: stripHtml(item.description),
      author: source.charAt(0).toUpperCase() + source.slice(1),
      publishDate: formatDate(item.pubDate),
      category: item.category || "Pháp luật",
      imageUrl: item.image || `https://images.unsplash.com/photo-${1589829545856 + index}?w=800&h=400&fit=crop`,
      readTime: calculateReadTime(stripHtml(item.description)),
      externalLink: item.link,
    }));
  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    return [];
  }
};

// Fetch news from all sources
export const fetchTrafficNews = async (): Promise<BlogPost[]> => {
  try {
    const fetchPromises = Object.entries(RSS_FEEDS).map(([source, url]) =>
      fetchFromFeed(url, source)
    );
    
    const results = await Promise.all(fetchPromises);
    const allNews = results.flat();
    
    // Sort by date (newest first) - prioritize recent news
    allNews.sort((a, b) => {
      try {
        // Convert DD/MM/YYYY to YYYYMMDD for comparison
        const parseDate = (dateStr: string) => {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            return parts[2] + parts[1] + parts[0]; // YYYYMMDD
          }
          return dateStr;
        };
        
        const dateA = parseDate(a.publishDate);
        const dateB = parseDate(b.publishDate);
        return dateB.localeCompare(dateA);
      } catch {
        return 0;
      }
    });
    
    // Filter to remove duplicates based on title similarity
    const uniqueNews = allNews.filter((news, index, self) => 
      index === self.findIndex(n => 
        n.title.toLowerCase().trim() === news.title.toLowerCase().trim()
      )
    );
    
    // Return top 20 most recent news items
    return uniqueNews.slice(0, 20);
  } catch (error) {
    console.error("Error fetching traffic news:", error);
    // Return mock data as fallback
    return getMockNews();
  }
};

// Mock data as fallback
const getMockNews = (): BlogPost[] => {
  return [
    {
      id: "1",
      title: "Quy định mới về xử phạt vi phạm nồng độ cồn năm 2024",
      excerpt: "Chính phủ vừa ban hành nghị định mới với mức xử phạt nghiêm khắc hơn đối với người điều khiển phương tiện có nồng độ cồn. Mức phạt tối đa có thể lên tới 40 triệu đồng và tước giấy phép lái xe 24 tháng...",
      content: "",
      author: "VnExpress",
      publishDate: "20/11/2024",
      category: "Pháp luật",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
      readTime: "5 phút",
    },
    {
      id: "2",
      title: "Tai nạn giao thông nghiêm trọng do lái xe sau khi uống rượu tại TP.HCM",
      excerpt: "Một vụ tai nạn giao thông nghiêm trọng xảy ra tại quận 1, TP.HCM do tài xế điều khiển xe ô tô trong tình trạng say rượu, gây thiệt hại về người và tài sản. CSGT đã tiến hành đo nồng độ cồn và xử lý theo quy định...",
      content: "",
      author: "Tuổi Trẻ",
      publishDate: "19/11/2024",
      category: "Pháp luật",
      imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800",
      readTime: "6 phút",
    },
    {
      id: "3",
      title: "CSGT tăng cường kiểm tra nồng độ cồn dịp cuối năm",
      excerpt: "Lực lượng CSGT toàn quốc đã triển khai kế hoạch tăng cường kiểm tra, xử lý vi phạm nồng độ cồn trong dịp lễ tết cuối năm. Nhiều chốt kiểm soát được lập tại các tuyến đường trọng điểm...",
      content: "",
      author: "Thanh Niên",
      publishDate: "18/11/2024",
      category: "Pháp luật",
      imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
      readTime: "4 phút",
    },
    {
      id: "4",
      title: "Thống kê: 70% tai nạn giao thông nghiêm trọng liên quan đến rượu bia",
      excerpt: "Theo báo cáo của Ủy ban An toàn Giao thông Quốc gia, 70% các vụ tai nạn giao thông nghiêm trọng có liên quan đến việc người điều khiển phương tiện sử dụng rượu bia. Con số này cho thấy tình trạng đáng báo động...",
      content: "",
      author: "Dân Trí",
      publishDate: "17/11/2024",
      category: "Thống kê",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
      readTime: "7 phút",
    },
    {
      id: "5",
      title: "Tác hại của việc lái xe sau khi uống rượu bia",
      excerpt: "Rượu bia làm giảm khả năng phản xạ, nhận thức và khả năng xử lý tình huống của người lái xe. Ngay cả với lượng nhỏ, nồng độ cồn cũng có thể ảnh hưởng nghiêm trọng đến khả năng điều khiển phương tiện...",
      content: "",
      author: "VnExpress",
      publishDate: "16/11/2024",
      category: "Sức khỏe",
      imageUrl: "https://images.unsplash.com/photo-1532634733-cae1395e440f?w=800",
      readTime: "8 phút",
    },
  ];
};
