import { NavLink } from "@/components/NavLink";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/information", label: "Tra cứu" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/blogs", label: "Tin tức" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center flex-shrink-0">
            <img 
              src="/Logo.png" 
              alt="Logo" 
              className="h-full w-full object-contain drop-shadow-lg"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">Vi phạm nồng độ cồn</h1>
            <p className="text-xs text-muted-foreground">Hệ thống giám sát giao thông</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-muted-foreground transition-all hover:bg-white/20 hover:text-primary border border-white/20"
              activeClassName="bg-primary/20 text-primary border-primary/50 font-semibold"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className="text-base font-medium text-muted-foreground transition-colors hover:text-primary py-2"
                  activeClassName="text-primary font-semibold"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
