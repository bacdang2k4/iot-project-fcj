import { useEffect, useState } from "react";
import Card from "@/components/Card";
import { fetchBlogPosts } from "@/utils/api";
import { BlogPost } from "@/types";
import { Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Tin tức</h1>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tin tức</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin về an toàn giao thông và xử lý vi phạm
        </p>
      </div>

      {/* Featured Post */}
      {posts[0] && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 md:h-full">
              <img
                src={posts[0].imageUrl}
                alt={posts[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="w-fit mb-3">{posts[0].category}</Badge>
              <h2 className="text-2xl font-bold text-foreground mb-3">{posts[0].title}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{posts[0].excerpt}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{posts[0].author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{posts[0].publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{posts[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Other Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.slice(1).map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-48 overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <Badge className="mb-3">{post.category}</Badge>
              <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{post.publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
