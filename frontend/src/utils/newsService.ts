import { BlogPost } from "@/types";

// RSS feed URLs from Vietnamese news sources
const RSS_FEEDS = {
  vnexpress: "https://vnexpress.net/rss/phap-luat.rss",
  tuoitre: "https://tuoitre.vn/rss/phap-luat.rss",
};

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const FEED_TIMEOUT_MS = 6000; // Reduced from 6000ms
const MAX_ITEMS_PER_FEED = 200; // Reduced from 8

let cachedNews: {
  data: BlogPost[];
  timestamp: number;
} | null = null;

// Fallback data when no news can be fetched
const FALLBACK_NEWS: BlogPost[] = [
  {
    id: "fallback-1",
    title: "Tăng cường xử phạt vi phạm nồng độ cồn trong dịp Tết Nguyên Đán 2025",
    excerpt: "Cảnh sát giao thông toàn quốc đã triển khai kế hoạch tăng cường kiểm tra và xử phạt nghiêm các trường hợp vi phạm nồng độ cồn, đặc biệt trong dịp Tết Nguyên Đán 2025...",
    content: "Cảnh sát giao thông toàn quốc đã triển khai kế hoạch tăng cường kiểm tra và xử phạt nghiêm các trường hợp vi phạm nồng độ cồn, đặc biệt trong dịp Tết Nguyên Đán 2025. Theo thống kê, số vụ tai nạn giao thông liên quan đến rượu bia tăng cao trong các dịp lễ.",
    author: "Hệ thống",
    publishDate: "27/11/2025",
    category: "Pháp luật",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=400&fit=crop",
    readTime: "3 phút",
  },
  {
    id: "fallback-2",
    title: "Quy định mới về mức phạt vi phạm nồng độ cồn năm 2025",
    excerpt: "Nghị định mới về xử phạt vi phạm hành chính trong lĩnh vực giao thông đường bộ có hiệu lực từ đầu năm 2025, với mức phạt tăng mạnh đối với các trường hợp vi phạm nồng độ cồn...",
    content: "Nghị định mới về xử phạt vi phạm hành chính trong lĩnh vực giao thông đường bộ có hiệu lực từ đầu năm 2025, với mức phạt tăng mạnh đối với các trường hợp vi phạm nồng độ cồn. Người điều khiển xe có thể bị phạt tiền và tước giấy phép lái xe từ 16-24 tháng.",
    author: "Hệ thống",
    publishDate: "26/11/2025",
    category: "Pháp luật",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    readTime: "4 phút",
  },
  {
    id: "fallback-3",
    title: "Cảnh báo: Tai nạn giao thông do rượu bia gia tăng vào cuối tuần",
    excerpt: "Theo báo cáo từ Cục Cảnh sát Giao thông, số vụ tai nạn giao thông liên quan đến rượu bia vào các ngày cuối tuần đã tăng 35% so với các ngày trong tuần...",
    content: "Theo báo cáo từ Cục Cảnh sát Giao thông, số vụ tai nạn giao thông liên quan đến rượu bia vào các ngày cuối tuần đã tăng 35% so với các ngày trong tuần. Cơ quan chức năng khuyến cáo người dân không lái xe sau khi uống rượu bia.",
    author: "Hệ thống",
    publishDate: "25/11/2025",
    category: "An toàn giao thông",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop",
    readTime: "3 phút",
  },
];

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

const fetchWithTimeout = async (
  url: string,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

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
const fetchFromFeed = async (
  feedUrl: string,
  source: string
): Promise<BlogPost[]> => {
  try {
    const response = await fetchWithTimeout(
      CORS_PROXY + encodeURIComponent(feedUrl),
      FEED_TIMEOUT_MS
    );
    const xmlText = await response.text();
    const items = parseRSS(xmlText);

    // Filter items that match keywords
    const filtered = items.filter((item) =>
      matchesKeywords(item.title, item.description)
    );

    // Convert to BlogPost format
    return filtered.slice(0, MAX_ITEMS_PER_FEED).map((item, index) => {
      const plainDescription = stripHtml(item.description);
      return {
        id: `${source}-${index}-${Date.now()}`,
        title: item.title,
        excerpt: plainDescription.substring(0, 200) + "...",
        content: plainDescription,
        author: source.charAt(0).toUpperCase() + source.slice(1),
        publishDate: formatDate(item.pubDate),
        category: item.category || "Pháp luật",
        imageUrl:
          item.image ||
          `https://images.unsplash.com/photo-${1589829545856 + index}?w=800&h=400&fit=crop`,
        readTime: calculateReadTime(plainDescription),
        externalLink: item.link,
      };
    });
  } catch (error) {
    console.error(`Error fetching from ${source}:`, error);
    return [];
  }
};

// Fetch news from all sources
export const fetchTrafficNews = async (): Promise<BlogPost[]> => {
  const now = Date.now();
  if (cachedNews && now - cachedNews.timestamp < CACHE_DURATION_MS) {
    return cachedNews.data;
  }

  try {
    const fetchPromises = Object.entries(RSS_FEEDS).map(([source, url]) =>
      fetchFromFeed(url, source)
    );

    const results = await Promise.allSettled(fetchPromises);
    const allNews = results
      .filter((result): result is PromiseFulfilledResult<BlogPost[]> => result.status === "fulfilled")
      .flatMap((result) => result.value);

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
    const topNews = uniqueNews.slice(0, 3);
    
    // If no news found, use fallback data
    if (topNews.length === 0) {
      console.warn("No news fetched from RSS feeds, using fallback data");
      cachedNews = {
        data: FALLBACK_NEWS,
        timestamp: now,
      };
      return FALLBACK_NEWS;
    }
    
    cachedNews = {
      data: topNews,
      timestamp: now,
    };
    return topNews;
  } catch (error) {
    console.error("Error fetching traffic news:", error);
    cachedNews = null;
    // Return fallback data instead of empty array
    return FALLBACK_NEWS;
  }
};
