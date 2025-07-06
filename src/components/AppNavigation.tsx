(with proper icon   
import { Link, useLocation } from "wouter";
import { HomeIcon, Search, Heart, Map, User, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

export function AppNavigation() {
  const [location] = useLocation();
  const { user } = useUser();
  
  // Define navigation items
  const navItems = [
    {
      name: "Home",
      icon: <HomeIcon size={20} />,
      path: "/",
    },
    {
      name: "Explore",
      icon: <Map size={20} />,
      path: "/explore",
    },
    {
      name: "Search",
      icon: <Search size={20} />,
      path: "/search",
    },
    {
      name: "Saved",
      icon: <Heart size={20} />,
      path: "/saved",
    },
    {
      name: "Profile",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  return (
    <nav className="app-navigation">
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
                location === item.path
                  ? "text-primary dark:text-primary"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <Link href="/add-property">
        <button className="fixed right-4 bottom-20 z-50 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-600">
          <Plus size={24} />
        </button>
      </Link>
    </nav>
  );
}