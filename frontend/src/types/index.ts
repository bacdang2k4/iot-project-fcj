export interface ViolationStats {
  month: string;
  violations: number;
  year: number;
}

export interface DashboardReading {
  timestamp: number;
  timestamp_human: string;
  officer_id: string;
  officer_name?: string;
  device_id: string;
  alcohol_level: number;
  heart_rate: number;
  spo2: number;
  cccd: string;
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
