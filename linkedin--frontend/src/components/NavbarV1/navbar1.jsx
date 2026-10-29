import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const Navbar1 = () => {
  const { isDark, toggleTheme } = useTheme();

  // Theme based text colors
  const textColor = isDark ? "#FFFFFF" : "#0A0A0A";

  return (
    <nav
      className="sticky top-0 z-50 w-full h-[64px] border-b transition-colors duration-300 flex items-center justify-between px-4 sm:px-8 lg:px-16"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Left: Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
          in
        </div>

        <span
          className="font-extrabold text-xl tracking-tight transition-colors duration-300"
          style={{ color: textColor }}
        >
          Link<span className="text-[#0a66c2]">Pro</span>
        </span>
      </Link>

      {/* Right: Actions & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:text-[#0A66C2] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          style={{ color: textColor }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-800" />
          )}
        </button>

        {/* Join Now */}
        <Link
          to="/signUp"
          className="px-4 py-1.5 rounded-full text-xs font-bold hover:text-[#0A66C2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          style={{ color: textColor }}
        >
          Join now
        </Link>

        {/* Sign In */}
        <Link
          to="/login"
          className="px-5 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
};

export default Navbar1;