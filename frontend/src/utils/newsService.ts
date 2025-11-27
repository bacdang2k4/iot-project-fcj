import { BlogPost } from "@/types";

const TRAFFIC_NEWS_FEED_URL = "https://iot2.namisme2k7.workers.dev/";

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const FEED_TIMEOUT_MS = 6000;
const MAX_ITEMS = 200;
const BLOG_ITEMS_LIMIT = 3;

let cachedNews: {
  data: BlogPost[];
  timestamp: number;
} | null = null;

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

export const fetchTrafficNews = async (): Promise<BlogPost[]> => {
  const now = Date.now();
  if (cachedNews && now - cachedNews.timestamp < CACHE_DURATION_MS) {
    return cachedNews.data;
  }

  try {
    const response = await fetchWithTimeout(
      TRAFFIC_NEWS_FEED_URL,
      FEED_TIMEOUT_MS
    );

    if (!response.ok) {
      throw new Error(`Traffic feed error: ${response.status}`);
    }

    const xmlText = await response.text();
    const items = parseRSS(xmlText);

    const filtered = items.filter((item) =>
      matchesKeywords(item.title, item.description)
    );

    const sourceItems =
      filtered.length >= BLOG_ITEMS_LIMIT
        ? filtered
        : items.slice(0, MAX_ITEMS);

    const allNews = sourceItems.map((item, index) => {
      const plainDescription = stripHtml(item.description);
      return {
        id: `traffic-${index}-${Date.now()}`,
        title: item.title,
        excerpt: plainDescription.substring(0, 200) + "...",
        content: plainDescription,
        author: "VnExpress",
        publishDate: formatDate(item.pubDate),
        category: item.category || "Giao thông",
        imageUrl:
          item.image ||
          `https://images.unsplash.com/photo-${1589829545856 + index}?w=800&h=400&fit=crop`,
        readTime: calculateReadTime(plainDescription),
        externalLink: item.link,
      };
    });

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
    
    const topNews = uniqueNews.slice(0, BLOG_ITEMS_LIMIT);
    cachedNews = {
      data: topNews,
      timestamp: now,
    };
    return topNews;
  } catch (error) {
    console.error("Error fetching traffic news:", error);
    cachedNews = null;
    return [];
  }
};
