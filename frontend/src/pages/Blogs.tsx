import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { fetchTrafficNews } from "@/utils/newsService";
import { BlogPost } from "@/types";
import { Calendar, Clock, User, ExternalLink, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await fetchTrafficNews();
      setPosts(data);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">Tin tức</h1>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-48 bg-white/20 rounded-lg"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">Tin tức</h1>
          <p className="text-lg md:text-xl text-gray-700 mt-3 drop-shadow-md">
            Tin tức về tai nạn giao thông và vi phạm nồng độ cồn
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 backdrop-blur-md bg-blue-600/90 hover:bg-blue-700/90 text-white"
          size="lg"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Đang tải..." : "Làm mới"}
        </Button>
      </div>

      {/* Featured Post */}
      {posts[0] && (
        <a
          href={posts[0].externalLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block no-underline"
        >
          <Card className="overflow-hidden p-2 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 md:h-full rounded-lg overflow-hidden relative">
                <img
                  src={posts[0].imageUrl}
                  alt={posts[0].title}
                  className="w-full h-full object-cover"
                />
                {posts[0].externalLink && (
                  <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-2 shadow-lg">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <Badge className="w-fit mb-4 text-sm md:text-base px-3 py-1">{posts[0].category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 drop-shadow-md hover:text-blue-600 transition-colors">{posts[0].title}</h2>
                <p className="text-base md:text-lg text-gray-800 mb-6 line-clamp-3 drop-shadow-sm">{posts[0].excerpt}</p>
                <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="drop-shadow-sm">{posts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="drop-shadow-sm">{posts[0].publishDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="drop-shadow-sm">{posts[0].readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </a>
      )}

      {/* Other Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.slice(1).map((post) => (
          <a
            key={post.id}
            href={post.externalLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline"
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer">
              <div className="h-48 md:h-56 overflow-hidden rounded-t-lg relative">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {post.externalLink && (
                  <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-2 shadow-lg">
                    <ExternalLink className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <Badge className="mb-3 text-sm md:text-base px-3 py-1">{post.category}</Badge>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 drop-shadow-sm hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-base md:text-lg text-gray-800 mb-4 line-clamp-2 drop-shadow-sm">{post.excerpt}</p>
                <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-700">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="drop-shadow-sm">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="drop-shadow-sm">{post.publishDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="drop-shadow-sm">{post.readTime}</span>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <p className="text-xl md:text-2xl text-gray-700 drop-shadow-sm">
              Không tìm thấy tin tức. Vui lòng thử lại sau.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Blogs;
