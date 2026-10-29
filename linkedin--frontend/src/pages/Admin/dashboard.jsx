import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Users, ShieldCheck, UserX, Search, LogOut, RefreshCcw,
  LayoutDashboard, Settings, Menu, X, Mail, MapPin,
  Building2, Briefcase, Bell, ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:4000/api/admin/users', { withCredentials: true });
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Connection lost. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/auth/logout', {}, { withCredentials: true });
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) { alert('Logout failed'); }
  };

  const handleBlockUser = async (userId, currentlyBlocked) => {
    if (!window.confirm(`Update status for this professional?`)) return;

    try {
      setUpdatingUserId(userId);

      await axios.patch(
        `http://localhost:4000/api/admin/users/${userId}/block`,
        { blocked: !currentlyBlocked },
        { withCredentials: true }
      );

      // update table
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, blocked: !currentlyBlocked } : u
        )
      );

      // update modal also
      if (selectedUser?._id === userId) {
        setSelectedUser((prev) => ({
          ...prev,
          blocked: !currentlyBlocked
        }));
      }

    } catch (err) {
      alert('Action failed');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase();
      const matchesSearch = [user.f_name, user.email, user.curr_company]
        .some(f => (f || '').toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all'
        ? true
        : (user.role || 'user') === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = [
    { title: 'Total Professionals', value: users.length, icon: <Users size={20} />, color: 'bg-blue-100 text-blue-700' },
    { title: 'System Admins', value: users.filter(u => u.role === 'admin').length, icon: <ShieldCheck size={20} />, color: 'bg-purple-100 text-purple-700' },
    { title: 'Active Listings', value: users.filter(u => !u.blocked).length, icon: <Briefcase size={20} />, color: 'bg-green-100 text-green-700' },
    { title: 'Flagged Accounts', value: users.filter(u => u.blocked).length, icon: <UserX size={20} />, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-slate-900 font-sans">
      <div className="flex">
        {/* Sidebar - LinkedIn Themed */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-2 border-b border-gray-100">
              <div className="bg-[#0A66C2] p-1.5 rounded text-white font-bold text-xl">In</div>
              <span className="text-xl font-bold text-[#0A66C2]">LinkPro <span className="text-gray-500 font-medium">Admin</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {[
                { id: 'home', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                { id: 'manage', label: 'User Directory', icon: <Users size={18} /> },
                // { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all ${activeTab === item.id ? 'bg-gray-100 text-[#0A66C2] font-semibold border-l-4 border-[#0A66C2]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            <button onClick={handleLogout} className="p-6 flex items-center gap-3 text-gray-500 hover:text-red-600 border-t border-gray-100 transition-colors">
              <LogOut size={18} /> <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-12">
          {/* Top Bar */}
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1"><Menu size={20} /></button>
              <h1 className="text-md font-semibold text-gray-700">LinkPro Management Center</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex bg-gray-100 rounded px-3 py-1 items-center gap-2 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input type="text" placeholder="Search Global Index" className="bg-transparent text-sm outline-none w-48" />
              </div>
              <Bell size={20} className="text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" />
              <button onClick={fetchUsers} className={`p-1.5 rounded-full hover:bg-gray-100 ${loading ? 'animate-spin' : ''}`}><RefreshCcw size={18} /></button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-tight">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Welcome to LinkPro Admin</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage network growth and ensure professional integrity across the platform.</p>
                  </div>
                  <button onClick={() => setActiveTab('manage')} className="mt-4 md:mt-0 px-6 py-1.5 bg-[#0A66C2] text-white rounded-full font-bold hover:bg-[#004182] transition-colors">
                    Review Professionals
                  </button>
                </div>
              </>
            )}

            {activeTab === 'manage' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2">
                    {['all', 'admin', 'user'].map((role) => (
                      <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 py-1 rounded-full text-xs font-bold border transition-all ${roleFilter === role ? 'bg-[#0A66C2] text-white border-[#0A66C2]' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-500'}`}>
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name/email..." className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Professional</th>
                        <th className="px-6 py-3">Organization</th>
                        <th className="px-6 py-3">Security Level</th>
                        <th className="px-6 py-3">Account State</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-300">
                                {user.f_name?.[0] || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                  {user.f_name}
                                  <ExternalLink
                                    size={12}
                                    className="text-blue-500 cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                  />
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-600">
                            <div className="flex items-center gap-1.5"><Building2 size={12} />{user.curr_company || 'Independent'}</div>
                            <div className="text-gray-400 flex items-center gap-1.5 mt-0.5"><MapPin size={10} />{user.curr_location || 'Global'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${user.blocked ? 'text-red-500' : 'text-green-600'}`}>
                              <span className={`h-2 w-2 rounded-full ${user.blocked ? 'bg-red-500' : 'bg-green-600'}`} />
                              {user.blocked ? 'Restricted' : 'Verified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleBlockUser(user._id, user.blocked)}
                              disabled={updatingUserId === user._id}
                              className={`text-xs font-bold px-3 py-1 rounded transition-colors ${user.blocked ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            >
                              {updatingUserId === user._id ? 'Updating...' : user.blocked ? 'Reactivate' : 'Restrict'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-[500px] rounded-lg p-6 overflow-y-auto max-h-[80vh]">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">User Details</h2>
              <button onClick={() => setSelectedUser(null)}>
                <X size={18} />
              </button>
            </div>

            {/* PROFILE */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 border border-gray-300">
                {selectedUser.f_name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-bold">{selectedUser.f_name}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* INFO */}
            <div className="mt-3 text-sm space-y-1">
              <p><b>Company:</b> {selectedUser.curr_company || 'N/A'}</p>
              <p><b>Location:</b> {selectedUser.curr_location || 'N/A'}</p>
              <p><b>About:</b> {selectedUser.about || 'N/A'}</p>
            </div>

            {/* SKILLS */}
            <div className="mt-3">
              <h3 className="font-bold text-sm">Skills</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedUser.skills?.length > 0 ? (
                  selectedUser.skills.map((s, i) => (
                    <span key={i} className="bg-blue-100 px-2 py-1 text-xs rounded">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-xs">No skills</p>
                )}
              </div>
            </div>

            {/* POSTS */}
            <div className="mt-4">
              <h3 className="font-bold text-sm mb-1">Posts</h3>

              {selectedUser.posts?.length > 0 ? (
                selectedUser.posts.map((post, i) => (
                  <div key={i} className="border p-2 rounded mb-2 text-sm">
                    {post.desc}

                    {post.imageLink && (
                      <img src={post.imageLink} className="mt-2 rounded" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-xs">No posts</p>
              )}
            </div>

            {/* BLOCK BUTTON */}
            <div className="mt-4 text-right">
              <button
                onClick={() => handleBlockUser(selectedUser._id, selectedUser.blocked)}
                className={`text-xs font-bold px-3 py-1 rounded ${selectedUser.blocked
                  ? 'text-blue-600 hover:bg-blue-100'
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
              >
                {selectedUser.blocked ? 'Reactivate' : 'Restrict'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;