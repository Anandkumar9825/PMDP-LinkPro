import React, { useState, useEffect } from "react";
import Card from "../../components/Card/card";
import ProfileCard from "../../components/ProfileCard/profileCard";
import TopCourses from "../../components/TopCourses/topCourses";
import Footer from "../../components/Footer/footer";
import { Link } from "react-router-dom";
import axios from "axios";
import socket from "../../../socket";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Users,
  UserCheck,
  UserPlus,
  Send,
  Check,
  X,
  UserX,
  Compass,
  Clock,
  Sparkles,
  Undo2,
  MessageSquare,
  MapPin,
  RefreshCw,
} from "lucide-react";

const MyNetwork = () => {
  const { currentUser, refreshUser } = useAuth();

  // =========================================================
  // THEME
  // IMPORTANT:
  // Get isDark directly from ThemeContext.
  // This makes the component automatically re-render
  // whenever the global theme changes.
  // =========================================================

  const { isDark } = useTheme();

  const textColor = isDark ? "#FFFFFF" : "#0A0A0A";

  const secondaryTextColor = isDark
    ? "#9CA3AF"
    : "#6B7280";

  // =========================================================
  // STATES
  // =========================================================

  const [activeTab, setActiveTab] =
    useState("connections");

  const [connections, setConnections] =
    useState([]);

  const [pendingRequests, setPendingRequests] =
    useState([]);

  const [sentRequests, setSentRequests] =
    useState([]);

  const [discoverUsers, setDiscoverUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [connectingMap, setConnectingMap] =
    useState({});

  // =========================================================
  // FETCH NETWORK DATA
  // =========================================================

  const fetchNetworkData = async () => {
    setLoading(true);

    try {
      const [
        connRes,
        pendRes,
        sentRes,
        discoverRes,
      ] = await Promise.allSettled([
        axios.get(
          "http://localhost:4000/api/auth/friendsList",
          {
            withCredentials: true,
          }
        ),

        axios.get(
          "http://localhost:4000/api/auth/pendingFriendsList",
          {
            withCredentials: true,
          }
        ),

        axios.get(
          "http://localhost:4000/api/auth/sentFriendsList",
          {
            withCredentials: true,
          }
        ),

        axios.get(
          "http://localhost:4000/api/auth/discover",
          {
            withCredentials: true,
          }
        ),
      ]);

      // =====================================================
      // CONNECTIONS
      // =====================================================

      if (
        connRes.status === "fulfilled" &&
        Array.isArray(
          connRes.value.data?.friends
        )
      ) {
        setConnections(
          connRes.value.data.friends
        );
      }

      // =====================================================
      // PENDING REQUESTS
      // =====================================================

      if (
        pendRes.status === "fulfilled" &&
        Array.isArray(
          pendRes.value.data?.pendingFriends
        )
      ) {
        setPendingRequests(
          pendRes.value.data.pendingFriends
        );
      }

      // =====================================================
      // SENT REQUESTS
      // =====================================================

      if (
        sentRes.status === "fulfilled" &&
        Array.isArray(
          sentRes.value.data?.sentRequests
        )
      ) {
        setSentRequests(
          sentRes.value.data.sentRequests
        );
      }

      // =====================================================
      // DISCOVER USERS
      // =====================================================

      if (
        discoverRes.status === "fulfilled" &&
        Array.isArray(
          discoverRes.value.data?.users
        )
      ) {
        setDiscoverUsers(
          discoverRes.value.data.users
        );
      } else {
        // Fallback
        const fallbackRes = await axios.get(
          "http://localhost:4000/api/auth/findUser?query=",
          {
            withCredentials: true,
          }
        );

        if (
          Array.isArray(
            fallbackRes.data?.users
          )
        ) {
          setDiscoverUsers(
            fallbackRes.data.users
          );
        }
      }
    } catch (err) {
      console.error(
        "Network fetch error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + SOCKET
  // =========================================================

  useEffect(() => {
    fetchNetworkData();

    const handleRequestRevoked = ({
      senderId,
    }) => {
      setPendingRequests((prev) =>
        prev.filter(
          (u) => u._id !== senderId
        )
      );

      toast.info(
        "A pending invitation was withdrawn"
      );
    };

    socket.on(
      "friendRequestRevoked",
      handleRequestRevoked
    );

    return () => {
      socket.off(
        "friendRequestRevoked",
        handleRequestRevoked
      );
    };
  }, [currentUser]);

  // =========================================================
  // ACCEPT INCOMING REQUEST
  // =========================================================

  const handleAcceptRequest = async (
    friendId
  ) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/acceptFriendRequest",
        { friendId },
        {
          withCredentials: true,
        }
      );

      toast.success(
        res.data?.message ||
          "Connection accepted!"
      );

      const acceptedUser =
        pendingRequests.find(
          (u) => u._id === friendId
        );

      setPendingRequests((prev) =>
        prev.filter(
          (u) => u._id !== friendId
        )
      );

      if (acceptedUser) {
        setConnections((prev) => [
          ...prev,
          acceptedUser,
        ]);
      }

      refreshUser();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          "Failed to accept connection"
      );
    }
  };

  // =========================================================
  // DECLINE / IGNORE REQUEST
  // =========================================================

  const handleDeclineRequest = async (
    friendId
  ) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/declineFriendRequest",
        { friendId },
        {
          withCredentials: true,
        }
      );

      toast.info(
        res.data?.message ||
          "Invitation ignored"
      );

      setPendingRequests((prev) =>
        prev.filter(
          (u) => u._id !== friendId
        )
      );

      refreshUser();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          "Failed to decline connection"
      );
    }
  };

  // =========================================================
  // REVOKE / WITHDRAW SENT REQUEST
  // =========================================================

  const handleRevokeRequest = async (
    targetId
  ) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/revokeFriendRequest",
        { targetId },
        {
          withCredentials: true,
        }
      );

      socket.emit(
        "revokeFriendRequest",
        {
          targetId,
          senderId: currentUser?._id,
        }
      );

      toast.success(
        res.data?.message ||
          "Invitation withdrawn"
      );

      const revokedUser =
        sentRequests.find(
          (u) => u._id === targetId
        );

      setSentRequests((prev) =>
        prev.filter(
          (u) => u._id !== targetId
        )
      );

      if (revokedUser) {
        setDiscoverUsers((prev) => [
          revokedUser,
          ...prev,
        ]);
      }

      refreshUser();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          "Failed to revoke invitation"
      );
    }
  };

  // =========================================================
  // SEND CONNECTION REQUEST
  // =========================================================

  const handleConnect = async (
    targetUser
  ) => {
    const targetId = targetUser._id;

    if (connectingMap[targetId]) {
      return;
    }

    // Optimistic loading state
    setConnectingMap((prev) => ({
      ...prev,
      [targetId]: "loading",
    }));

    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/sendFriendReq",
        {
          reciever: targetId,
        },
        {
          withCredentials: true,
        }
      );

      setConnectingMap((prev) => ({
        ...prev,
        [targetId]: "sent",
      }));

      toast.success(
        res.data?.message ||
          `Invitation sent to ${targetUser.f_name}!`
      );

      setSentRequests((prev) => [
        ...prev,
        targetUser,
      ]);

      setTimeout(() => {
        setDiscoverUsers((prev) =>
          prev.filter(
            (u) => u._id !== targetId
          )
        );
      }, 1200);

      refreshUser();
    } catch (err) {
      setConnectingMap((prev) => {
        const next = {
          ...prev,
        };

        delete next[targetId];

        return next;
      });

      toast.error(
        err?.response?.data?.error ||
          "Failed to send connection request"
      );
    }
  };

  // =========================================================
  // REMOVE EXISTING FRIEND
  // =========================================================

  const handleRemoveFriend = async (
    friendId
  ) => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect?"
      )
    ) {
      return;
    }

    try {
      const res = await axios.delete(
        `http://localhost:4000/api/auth/removeFromFriendList/${friendId}`,
        {
          withCredentials: true,
        }
      );

      toast.info(
        res.data?.message ||
          "Disconnected successfully"
      );

      setConnections((prev) =>
        prev.filter(
          (u) => u._id !== friendId
        )
      );

      refreshUser();
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          "Failed to disconnect"
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main
      className="min-h-screen px-3 sm:px-6 lg:px-12 xl:px-24 py-6 flex justify-center transition-colors duration-300"
      style={{
        color: textColor,
      }}
    >
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row gap-6 items-start">

        {/* =====================================================
            LEFT SIDEBAR
        ===================================================== */}

        <aside className="w-full md:w-[28%] lg:w-[24%] flex-shrink-0 flex flex-col gap-4">
          <ProfileCard data={currentUser} />
          <TopCourses />
          <Footer />
        </aside>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="flex-1 w-full flex flex-col gap-4">

          {/* ===================================================
              TAB BAR
          =================================================== */}

          <Card
            padding={false}
            className="shadow-sm overflow-hidden p-2"
          >
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">

              {/* CONNECTIONS */}

              <button
                onClick={() =>
                  setActiveTab("connections")
                }
                className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "connections"
                    ? "bg-[#0a66c2] text-white shadow-xs"
                    : "hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={
                  activeTab !== "connections"
                    ? {
                        color: textColor,
                      }
                    : {}
                }
              >
                <UserCheck size={16} />

                <span>
                  Connections
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "connections"
                      ? "bg-white text-[#0a66c2]"
                      : ""
                  }`}
                  style={
                    activeTab !== "connections"
                      ? {
                          backgroundColor:
                            isDark
                              ? "rgba(255,255,255,0.10)"
                              : "rgba(0,0,0,0.10)",
                          color: textColor,
                        }
                      : {}
                  }
                >
                  {connections.length}
                </span>
              </button>

              {/* INVITATIONS */}

              <button
                onClick={() =>
                  setActiveTab("received")
                }
                className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "received"
                    ? "bg-[#0a66c2] text-white shadow-xs"
                    : "hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={
                  activeTab !== "received"
                    ? {
                        color: textColor,
                      }
                    : {}
                }
              >
                <UserPlus size={16} />

                <span>
                  Invitations
                </span>

                {pendingRequests.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "received"
                        ? "bg-white text-[#0a66c2]"
                        : "bg-[#cc1016] text-white animate-pulse"
                    }`}
                  >
                    {pendingRequests.length}
                  </span>
                )}
              </button>

              {/* SENT */}

              <button
                onClick={() =>
                  setActiveTab("sent")
                }
                className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "sent"
                    ? "bg-[#0a66c2] text-white shadow-xs"
                    : "hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={
                  activeTab !== "sent"
                    ? {
                        color: textColor,
                      }
                    : {}
                }
              >
                <Send size={15} />

                <span>
                  Pending Sent
                </span>

                {sentRequests.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "sent"
                        ? "bg-white text-[#0a66c2]"
                        : "bg-[#0a66c2]/10 text-[#0a66c2]"
                    }`}
                  >
                    {sentRequests.length}
                  </span>
                )}
              </button>

              {/* DISCOVER */}

              <button
                onClick={() =>
                  setActiveTab("discover")
                }
                className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === "discover"
                    ? "bg-[#0a66c2] text-white shadow-xs"
                    : "hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                style={
                  activeTab !== "discover"
                    ? {
                        color: textColor,
                      }
                    : {}
                }
              >
                <Compass size={16} />

                <span>
                  Discover
                </span>

                {discoverUsers.length > 0 && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#0a66c2]/10 text-[#0a66c2]"
                  >
                    {discoverUsers.length}
                  </span>
                )}
              </button>
            </div>
          </Card>

          {/* ===================================================
              DISCOVER TAB
          =================================================== */}

          {activeTab === "discover" && (
            <Card
              padding={false}
              className="shadow-sm overflow-hidden p-5"
            >
              <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-[#0a66c2]"
                  />

                  <h1
                    className="text-sm font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    People you may know (
                    {discoverUsers.length})
                  </h1>
                </div>

                <button
                  onClick={fetchNetworkData}
                  disabled={loading}
                  className="p-1.5 rounded-full hover:text-[#0a66c2] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  style={{
                    color:
                      secondaryTextColor,
                  }}
                  title="Refresh suggestions"
                >
                  <RefreshCw
                    size={15}
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]" />
                </div>
              ) : discoverUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {discoverUsers.map(
                    (user) => {
                      const status =
                        connectingMap[
                          user._id
                        ];

                      return (
                        <div
                          key={user._id}
                          className="rounded-2xl border overflow-hidden flex flex-col items-center text-center transition-all hover:shadow-md bg-[var(--bg-card)] group"
                          style={{
                            borderColor:
                              "var(--border-color)",
                          }}
                        >

                          {/* COVER */}

                          <div className="h-16 w-full relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
                            <img
                              src={
                                user.cover_pic ||
                                "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
                              }
                              alt="Cover"
                              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* AVATAR */}

                          <div className="relative -mt-9 mb-2">
                            <Link
                              to={`/profile/${user._id}`}
                            >
                              <img
                                src={
                                  user.profilePic ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                                }
                                alt={user.f_name}
                                className={`w-16 h-16 rounded-full object-cover ring-2 ${
                                  isDark
                                    ? "ring-gray-800"
                                    : "ring-white"
                                } shadow-sm hover:scale-105 transition-transform`}
                                referrerPolicy="no-referrer"
                              />
                            </Link>
                          </div>

                          {/* DETAILS */}

                          <div className="px-4 pb-4 w-full flex-1 flex flex-col justify-between">

                            <div>

                              <Link
                                to={`/profile/${user._id}`}
                                className="text-xs font-bold hover:underline block truncate"
                                style={{
                                  color:
                                    textColor,
                                }}
                              >
                                {user.f_name}
                              </Link>

                              <div
                                className="text-[11px] line-clamp-2 mt-0.5 h-8"
                                style={{
                                  color:
                                    secondaryTextColor,
                                }}
                              >
                                {user.headline ||
                                  "Member on LinkPro"}
                              </div>

                              {/* MUTUAL / LOCATION */}

                              <div
                                className="mt-2 text-[10px] flex items-center justify-center gap-1"
                                style={{
                                  color:
                                    secondaryTextColor,
                                }}
                              >
                                {user.mutualConnectionsCount >
                                0 ? (
                                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                                    {
                                      user.mutualConnectionsCount
                                    }{" "}
                                    mutual connection
                                    {user.mutualConnectionsCount >
                                    1
                                      ? "s"
                                      : ""}
                                  </span>
                                ) : user.curr_location ? (
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin
                                      size={10}
                                    />

                                    <span>
                                      {
                                        user.curr_location
                                      }
                                    </span>
                                  </span>
                                ) : (
                                  <span>
                                    Active on LinkPro
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* CONNECT BUTTON */}

                            <button
                              onClick={() =>
                                handleConnect(
                                  user
                                )
                              }
                              disabled={
                                status ===
                                  "loading" ||
                                status ===
                                  "sent"
                              }
                              className={`mt-3 w-full py-1.5 px-3 rounded-full border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                                status === "sent"
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 cursor-default"
                                  : status ===
                                    "loading"
                                  ? "border-[#0a66c2] text-[#0a66c2] opacity-70"
                                  : "border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white"
                              }`}
                            >
                              {status ===
                              "loading" ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#0a66c2]" />
                              ) : status ===
                                "sent" ? (
                                <>
                                  <Check
                                    size={13}
                                  />

                                  <span>
                                    Pending
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserPlus
                                    size={13}
                                  />

                                  <span>
                                    Connect
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="py-16 text-center p-6">

                  <Compass
                    size={40}
                    className="mx-auto text-gray-400 mb-2"
                  />

                  <h3
                    className="text-xs font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    No new people to discover right now
                  </h3>

                  <p
                    className="text-[11px] mt-1 max-w-sm mx-auto"
                    style={{
                      color:
                        secondaryTextColor,
                    }}
                  >
                    You are connected or have
                    invited all available members!
                    Check back soon as new
                    professionals join.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* ===================================================
              CONNECTIONS TAB
          =================================================== */}

          {activeTab === "connections" && (
            <Card
              padding={false}
              className="shadow-sm overflow-hidden"
            >
              <div
                className="p-4 px-5 border-b flex items-center justify-between"
                style={{
                  borderColor:
                    "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2">

                  <UserCheck
                    size={18}
                    className="text-[#0a66c2]"
                  />

                  <h1
                    className="text-sm font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    Your Connections (
                    {connections.length})
                  </h1>
                </div>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]" />
                </div>
              ) : connections.length > 0 ? (
                <div
                  className="divide-y"
                  style={{
                    borderColor:
                      "var(--border-color)",
                  }}
                >
                  {connections.map(
                    (user) => (
                      <div
                        key={user._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Link
                          to={`/profile/${user._id}`}
                          className="flex items-center gap-3.5 group"
                        >
                          <img
                            src={
                              user.profilePic ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                            }
                            alt={user.f_name}
                            className="w-12 h-12 rounded-full object-cover ring-1 ring-sky-500/40"
                            referrerPolicy="no-referrer"
                          />

                          <div>

                            <div
                              className="text-xs font-bold group-hover:underline"
                              style={{
                                color:
                                  textColor,
                              }}
                            >
                              {user.f_name}
                            </div>

                            <div
                              className="text-[11px] line-clamp-1"
                              style={{
                                color:
                                  secondaryTextColor,
                              }}
                            >
                              {user.headline ||
                                "LinkedIn Member"}
                            </div>

                          </div>
                        </Link>

                        <div className="flex items-center gap-2 self-end sm:self-auto">

                          <Link
                            to="/messages"
                            className="px-4 py-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <MessageSquare
                              size={13}
                            />

                            <span>
                              Message
                            </span>
                          </Link>

                          <button
                            onClick={() =>
                              handleRemoveFriend(
                                user._id
                              )
                            }
                            className="p-2 rounded-full hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            style={{
                              color:
                                secondaryTextColor,
                            }}
                            title="Remove connection"
                          >
                            <UserX
                              size={15}
                            />
                          </button>

                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-16 text-center p-6">

                  <Users
                    size={36}
                    className="mx-auto text-gray-400 mb-2"
                  />

                  <h3
                    className="text-xs font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    No connections yet
                  </h3>

                  <p
                    className="text-[11px] mt-1"
                    style={{
                      color:
                        secondaryTextColor,
                    }}
                  >
                    Discover people in your
                    industry to grow your
                    professional network.
                  </p>

                </div>
              )}
            </Card>
          )}

          {/* ===================================================
              RECEIVED INVITATIONS
          =================================================== */}

          {activeTab === "received" && (
            <Card
              padding={false}
              className="shadow-sm overflow-hidden"
            >
              <div
                className="p-4 px-5 border-b flex items-center justify-between"
                style={{
                  borderColor:
                    "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2">

                  <UserPlus
                    size={18}
                    className="text-[#0a66c2]"
                  />

                  <h1
                    className="text-sm font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    Invitations (
                    {pendingRequests.length})
                  </h1>

                </div>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]" />
                </div>
              ) : pendingRequests.length > 0 ? (
                <div
                  className="divide-y"
                  style={{
                    borderColor:
                      "var(--border-color)",
                  }}
                >
                  {pendingRequests.map(
                    (user) => (
                      <div
                        key={user._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >

                        <Link
                          to={`/profile/${user._id}`}
                          className="flex items-center gap-3.5 group"
                        >
                          <img
                            src={
                              user.profilePic ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                            }
                            alt={user.f_name}
                            className="w-12 h-12 rounded-full object-cover ring-1 ring-sky-500/40"
                            referrerPolicy="no-referrer"
                          />

                          <div>

                            <div
                              className="text-xs font-bold group-hover:underline"
                              style={{
                                color:
                                  textColor,
                              }}
                            >
                              {user.f_name}
                            </div>

                            <div
                              className="text-[11px] line-clamp-1"
                              style={{
                                color:
                                  secondaryTextColor,
                              }}
                            >
                              {user.headline ||
                                "LinkedIn Member"}
                            </div>

                          </div>
                        </Link>

                        <div className="flex items-center gap-2 self-end sm:self-auto">

                          <button
                            onClick={() =>
                              handleDeclineRequest(
                                user._id
                              )
                            }
                            className="px-3.5 py-1.5 rounded-full border border-gray-400/40 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                            style={{
                              color:
                                secondaryTextColor,
                            }}
                          >
                            <X size={13} />

                            <span>
                              Ignore
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              handleAcceptRequest(
                                user._id
                              )
                            }
                            className="px-4 py-1.5 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <Check size={13} />

                            <span>
                              Accept
                            </span>
                          </button>

                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-16 text-center p-6">

                  <UserCheck
                    size={36}
                    className="mx-auto text-gray-400 mb-2"
                  />

                  <h3
                    className="text-xs font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    No pending invitations
                  </h3>

                  <p
                    className="text-[11px] mt-1"
                    style={{
                      color:
                        secondaryTextColor,
                    }}
                  >
                    When someone sends you a
                    connection request, you'll
                    see it here.
                  </p>

                </div>
              )}
            </Card>
          )}

          {/* ===================================================
              SENT / PENDING INVITATIONS
          =================================================== */}

          {activeTab === "sent" && (
            <Card
              padding={false}
              className="shadow-sm overflow-hidden"
            >
              <div
                className="p-4 px-5 border-b flex items-center justify-between"
                style={{
                  borderColor:
                    "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-2">

                  <Send
                    size={17}
                    className="text-[#0a66c2]"
                  />

                  <h1
                    className="text-sm font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    Pending Sent Invitations (
                    {sentRequests.length})
                  </h1>

                </div>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]" />
                </div>
              ) : sentRequests.length > 0 ? (
                <div
                  className="divide-y"
                  style={{
                    borderColor:
                      "var(--border-color)",
                  }}
                >
                  {sentRequests.map(
                    (user) => (
                      <div
                        key={user._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >

                        <Link
                          to={`/profile/${user._id}`}
                          className="flex items-center gap-3.5 group"
                        >
                          <img
                            src={
                              user.profilePic ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                            }
                            alt={user.f_name}
                            className="w-12 h-12 rounded-full object-cover ring-1 ring-sky-500/40"
                            referrerPolicy="no-referrer"
                          />

                          <div>

                            <div
                              className="text-xs font-bold group-hover:underline"
                              style={{
                                color:
                                  textColor,
                              }}
                            >
                              {user.f_name}
                            </div>

                            <div
                              className="text-[11px] line-clamp-1"
                              style={{
                                color:
                                  secondaryTextColor,
                              }}
                            >
                              {user.headline ||
                                "LinkedIn Member"}
                            </div>

                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                              <Clock size={10} />

                              <span>
                                Pending Response
                              </span>
                            </div>

                          </div>
                        </Link>

                        {/* WITHDRAW */}

                        <button
                          onClick={() =>
                            handleRevokeRequest(
                              user._id
                            )
                          }
                          className="self-end sm:self-auto px-4 py-1.5 rounded-full border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Undo2 size={13} />

                          <span>
                            Withdraw
                          </span>
                        </button>

                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-16 text-center p-6">

                  <Send
                    size={36}
                    className="mx-auto text-gray-400 mb-2"
                  />

                  <h3
                    className="text-xs font-bold"
                    style={{
                      color: textColor,
                    }}
                  >
                    No pending sent invitations
                  </h3>

                  <p
                    className="text-[11px] mt-1"
                    style={{
                      color:
                        secondaryTextColor,
                    }}
                  >
                    Invitations you have sent
                    to others will appear here
                    until they accept or decline.
                  </p>

                </div>
              )}
            </Card>
          )}

        </section>
      </div>

      {/* =====================================================
          TOAST
          Automatically follows global theme
      ===================================================== */}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme={isDark ? "dark" : "light"}
      />
    </main>
  );
};

export default MyNetwork;