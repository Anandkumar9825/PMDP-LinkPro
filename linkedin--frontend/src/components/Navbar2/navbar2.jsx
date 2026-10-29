import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

import {
  Search,
  Home,
  Users,
  Briefcase,
  Bell,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Sun,
  Moon,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

const Navbar2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { toggleTheme, isDark } = useTheme();

  const {
    currentUser,
    unreadNotifCount,
    unreadMessageCount,
    logout,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // =========================================================
  // THEME COLORS
  // =========================================================

  const textColor = isDark ? "#FFFFFF" : "#0A0A0A";

  const secondaryTextColor = isDark
    ? "#9CA3AF"
    : "#6B7280";

  const hoverBackground = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.05)";

  // =========================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // DEBOUNCE SEARCH
  // =========================================================

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // =========================================================
  // SEARCH API
  // =========================================================

  useEffect(() => {
    if (debouncedTerm.trim()) {
      searchAPICall();
    } else {
      setSearchUser([]);
      setIsSearching(false);
    }
  }, [debouncedTerm]);

  const searchAPICall = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/auth/findUser?query=${debouncedTerm}`,
        {
          withCredentials: true,
        }
      );

      if (res.data?.users) {
        setSearchUser(res.data.users);
      }

      setIsSearching(true);
    } catch (err) {
      console.error("Search error:", err);
      setIsSearching(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    toast.success("Logged out successfully");
    await logout();
  };

  // =========================================================
  // USER DATA
  // =========================================================

  const avatarUrl =
    currentUser?.profilePic ||
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  const userName = currentUser?.f_name || "My Profile";

  const userHeadline =
    currentUser?.headline || "LinkedIn Member";

  const myProfileId = currentUser?._id || (() => {
    try {
      const u = localStorage.getItem('userInfo');
      return u ? JSON.parse(u)?._id : null;
    } catch (e) {
      return null;
    }
  })() || 'me';

  // =========================================================
  // ACTIVE PATH HELPERS
  // =========================================================

  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNavClick = (e, path) => {
    if (location.pathname === path || (path === '/feeds' && location.pathname === '/')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHome =
    location.pathname === "/feeds" ||
    location.pathname === "/";

  const isNetwork =
    location.pathname === "/myNetwork";

  const isResume =
    location.pathname === "/resume";

  const isMessages =
    location.pathname === "/messages";

  const isNotifications =
    location.pathname === "/notification";

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-300 py-2.5 px-4 sm:px-8 xl:px-24 flex justify-between items-center"
      style={{
        backgroundColor: isDark
          ? "rgba(20, 23, 30, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {/* =====================================================
          LEFT SIDE: LOGO + SEARCH
      ===================================================== */}

      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">

        {/* LinkedIn Logo */}

        <Link to="/feeds" onClick={(e) => handleNavClick(e, "/feeds")}
          className="flex-shrink-0 group flex items-center justify-center"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0a66c2] flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-xl tracking-tighter select-none font-sans">
              in
            </span>
          </div>
        </Link>

        {/* History Back / Forward Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
            className="p-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              color: secondaryTextColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBackground}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            title="Go Forward"
            className="p-1.5 rounded-full transition-colors cursor-pointer"
            style={{
              color: secondaryTextColor,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBackground}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <div
          ref={searchRef}
          className="relative flex-1 max-w-xs sm:max-w-sm"
        >
          <div
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-color)",
            }}
          >
            <Search
              size={16}
              className="flex-shrink-0"
              style={{
                color: secondaryTextColor,
              }}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim()) {
                  setIsSearching(true);
                }
              }}
              placeholder="Search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
              style={{
                color: textColor,
              }}
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs cursor-pointer transition-colors"
                style={{
                  color: secondaryTextColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = textColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    secondaryTextColor;
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* =================================================
              SEARCH DROPDOWN
          ================================================= */}

          {isSearching && searchUser.length > 0 && (
            <div
              className="absolute left-0 top-11 w-full sm:w-80 rounded-2xl p-2 shadow-2xl border backdrop-blur-lg z-50 max-h-72 overflow-y-auto"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="text-xs font-semibold px-3 py-1 uppercase tracking-wider"
                style={{
                  color: secondaryTextColor,
                }}
              >
                People
              </div>

              {searchUser.map((user, idx) => (
                <Link
                  key={user._id || idx}
                  to={`/profile/${user._id}`}
                  onClick={() => {
                    setIsSearching(false);
                    setSearchTerm("");
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-blue-500/10"
                >
                  <img
                    src={
                      user.profilePic ||
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                    alt={user.f_name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-600/30"
                  />

                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{
                        color: textColor,
                      }}
                    >
                      {user.f_name}
                    </div>

                    <div
                      className="text-xs line-clamp-1"
                      style={{
                        color: secondaryTextColor,
                      }}
                    >
                      {user.headline || "LinkPro Member"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          DESKTOP NAVIGATION
      ===================================================== */}

      <div className="hidden md:flex items-center gap-1 lg:gap-3">

        {/* =================================================
            HOME
        ================================================= */}

        <Link to="/feeds" onClick={(e) => handleNavClick(e, "/feeds")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            isHome
              ? "bg-[#0a66c2] text-white shadow-md"
              : "hover:text-[#0a66c2]"
          }`}
          style={
            !isHome
              ? {
                  color: textColor,
                }
              : {}
          }
        >
          <Home
            size={17}
            className={isHome ? "text-white fill-white" : ""}
          />

          <span>Home</span>
        </Link>

        {/* =================================================
            MY NETWORK
        ================================================= */}

        <Link to="/myNetwork" onClick={(e) => handleNavClick(e, "/myNetwork")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            isNetwork
              ? "bg-[#0a66c2] text-white shadow-md"
              : "hover:text-[#0a66c2]"
          }`}
          style={
            !isNetwork
              ? {
                  color: textColor,
                }
              : {}
          }
        >
          <Users size={17} />

          <span className="hidden lg:inline">
            My Network
          </span>
        </Link>

        {/* =================================================
            JOBS
        ================================================= */}

        <Link to="/resume" onClick={(e) => handleNavClick(e, "/resume")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            isResume
              ? "bg-[#0a66c2] text-white shadow-md"
              : "hover:text-[#0a66c2]"
          }`}
          style={
            !isResume
              ? {
                  color: textColor,
                }
              : {}
          }
        >
          <Briefcase size={17} />

          <div className="flex items-center gap-1.5">
            <span>Resume & AI</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">AI</span>
          </div>
        </Link>

        {/* =================================================
            MESSAGES
        ================================================= */}

        <Link to="/messages" onClick={(e) => handleNavClick(e, "/messages")}
          className={`relative p-2 rounded-full transition-all ${
            isMessages
              ? "text-[#0a66c2] bg-blue-500/10"
              : "hover:text-[#0a66c2]"
          }`}
          style={
            !isMessages
              ? {
                  color: textColor,
                }
              : {}
          }
          title="Messaging"
        >
          <MessageSquare size={18} />

          {unreadMessageCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#0a66c2] text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-card)] animate-pulse">
              {unreadMessageCount > 99
                ? "99+"
                : unreadMessageCount}
            </span>
          )}
        </Link>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <Link to="/notification" onClick={(e) => handleNavClick(e, "/notification")}
          className={`relative p-2 rounded-full transition-all ${
            isNotifications
              ? "text-[#0a66c2] bg-blue-500/10"
              : "hover:text-[#0a66c2]"
          }`}
          style={
            !isNotifications
              ? {
                  color: textColor,
                }
              : {}
          }
          title="Notifications"
        >
          <Bell size={18} />

          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-card)]">
              {unreadNotifCount > 99
                ? "99+"
                : unreadNotifCount}
            </span>
          )}
        </Link>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          className="h-5 w-[1px] mx-1 lg:mx-2"
          style={{
            backgroundColor: isDark
              ? "#374151"
              : "#D1D5DB",
          }}
        />

        {/* =================================================
            PROFILE DROPDOWN
        ================================================= */}

        <div
          ref={profileRef}
          className="relative"
        >
          <button
            onClick={() =>
              setIsProfileOpen(!isProfileOpen)
            }
            className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full hover:text-[#0a66c2] transition-all cursor-pointer"
            style={{
              color: textColor,
            }}
          >
            <img
              src={avatarUrl}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-400/40"
            />

            <span className="text-xs font-bold hidden sm:inline">
              Me
            </span>

            <ChevronDown
              size={14}
              className="opacity-80"
            />
          </button>

          {/* =================================================
              PROFILE POPUP
          ================================================= */}

          {isProfileOpen && (
            <div
              className="absolute right-0 top-11 w-56 rounded-2xl p-2 shadow-2xl border backdrop-blur-lg z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* User Info */}

              <div
                className="p-3 border-b flex items-center gap-3"
                style={{
                  borderColor: "var(--border-color)",
                }}
              >
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    {userName}
                  </div>

                  <div
                    className="text-xs line-clamp-1"
                    style={{
                      color: secondaryTextColor,
                    }}
                  >
                    {userHeadline}
                  </div>
                </div>
              </div>

              {/* Menu */}

              <div className="py-1">
                <Link
                  to={`/profile/${myProfileId}`}
                  onClick={() =>
                    setIsProfileOpen(false)
                  }
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                  style={{
                    color: textColor,
                  }}
                >
                  <User
                    size={15}
                    className="text-gray-400"
                  />

                  View Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut size={15} />

                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            WORK
        ================================================= */}

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:text-[#0a66c2] transition-all cursor-pointer font-semibold"
          style={{
            color: textColor,
          }}
          title="Work Applications"
        >
          <Grid3X3 size={17} />

          <span className="text-sm">
            Work
          </span>
        </button>

        {/* =================================================
            THEME TOGGLE
        ================================================= */}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:text-[#0a66c2] transition-all cursor-pointer"
          style={{
            color: textColor,
          }}
          title={
            isDark
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
        >
          {isDark ? (
            <Sun
              size={18}
              className="text-amber-400"
            />
          ) : (
            <Moon
              size={18}
              className="text-slate-800"
            />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() =>
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }
          className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          style={{
            color: textColor,
          }}
        >
          {isMobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 w-full p-4 border-b shadow-2xl flex flex-col gap-2 z-50 backdrop-blur-xl"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Home */}

          <Link to="/feeds" onClick={(e) => { handleNavClick(e, "/feeds"); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0a66c2] text-white font-medium"
          >
            <Home size={18} />

            <span>Home</span>
          </Link>

          {/* My Network */}

          <Link to="/myNetwork" onClick={(e) => { handleNavClick(e, "/myNetwork"); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium"
            style={{
              color: textColor,
            }}
          >
            <Users size={18} />

            <span>My Network</span>
          </Link>

          {/* Jobs */}

          <Link to="/resume" onClick={(e) => { handleNavClick(e, "/resume"); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium"
            style={{
              color: textColor,
            }}
          >
            <Briefcase size={18} />

            <span>Jobs</span>
          </Link>

          {/* Messages */}

          <Link to="/messages" onClick={(e) => { handleNavClick(e, "/messages"); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium"
            style={{
              color: textColor,
            }}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} />

              <span>Messages</span>
            </div>

            {unreadMessageCount > 0 && (
              <span className="bg-[#0a66c2] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadMessageCount}
              </span>
            )}
          </Link>

          {/* Notifications */}

          <Link to="/notification" onClick={(e) => { handleNavClick(e, "/notification"); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium"
            style={{
              color: textColor,
            }}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />

              <span>Notifications</span>
            </div>

            {unreadNotifCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadNotifCount}
              </span>
            )}
          </Link>

          {/* Profile + Logout */}

          <div
            className="pt-2 border-t flex justify-between items-center"
            style={{
              borderColor: "var(--border-color)",
            }}
          >
            <Link
              to={`/profile/${myProfileId}`}
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="flex items-center gap-2 text-sm font-semibold"
              style={{
                color: textColor,
              }}
            >
              <img
                src={avatarUrl}
                alt={userName}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-400/40"
              />

              <span>View Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Theme Toggle */}

          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 font-medium"
            style={{
              color: textColor,
            }}
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Sun
                  size={18}
                  className="text-amber-400"
                />
              ) : (
                <Moon
                  size={18}
                  className="text-slate-800"
                />
              )}

              <span>
                {isDark
                  ? "Light Mode"
                  : "Dark Mode"}
              </span>
            </div>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar2;
