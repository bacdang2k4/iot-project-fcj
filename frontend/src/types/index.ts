export interface ViolationStats {
  month: string;
  violations: number;
  year: number;
}

export interface CitizenInfo {
  cccd: string;
  name: string;
  birthDate: string;
  address: string;
  violations: ViolationRecord[];
}

export interface ViolationRecord {
  id: string;
  date: string;
  location: string;
  alcoholLevel: number;
  fine: number;
  status: "paid" | "unpaid" | "processing";
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  imageUrl: string;
  readTime: string;
  externalLink?: string;
}
