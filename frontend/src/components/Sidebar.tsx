import { Home, Search, Info, FileText } from "lucide-react";
import { NavLink } from "./NavLink";

const Sidebar = () => {
  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col">
      <div className="p-6">
        <h2 className="text-lg font-bold text-foreground">Menu</h2>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        <NavLink 
          to="/" 
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-muted text-foreground font-medium"
        >
          <Home className="h-5 w-5" />
          Dashboard
        </NavLink>
        <NavLink 
          to="/information" 
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-muted text-foreground font-medium"
        >
          <Search className="h-5 w-5" />
          Tra cứu
        </NavLink>
        <NavLink 
          to="/about" 
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-muted text-foreground font-medium"
        >
          <Info className="h-5 w-5" />
          Giới thiệu
        </NavLink>
        <NavLink 
          to="/blogs" 
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-muted text-foreground font-medium"
        >
          <FileText className="h-5 w-5" />
          Tin tức
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
