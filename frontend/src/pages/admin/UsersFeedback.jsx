import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, TrendingUp, MessageSquare, Star } from 'lucide-react';

const UsersFeedback = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Fetch users from backend
  useEffect(() => {
    if (activeTab !== 'users') return;
    setLoadingUsers(true);
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [activeTab]);

  // Fetch feedbacks from backend
  useEffect(() => {
    if (activeTab !== 'feedback') return;
    setLoadingFeedbacks(true);
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/feedbacks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setFeedbacks(data.data);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    fetchFeedbacks();
  }, [activeTab]);

  // Filter logic for users tab
  const filteredUsers = users.filter(user =>
    user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter logic for feedback tab
  const filteredFeedbacks = feedbacks.filter(feedback =>
    feedback.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feedback.feedback?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeAgo = (date) => {
    if (!date) return 'N/A';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) {
        return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const renderStars = (rating) => (
    <span className="flex space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </span>
  );

  // Stats for feedback tab
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users & Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Manage users and monitor platform feedback
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Users */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>
        {/* Active Users */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">
                {users.filter(u => u.lastLogin && (new Date() - new Date(u.lastLogin)) / (1000 * 60 * 60 * 24) <= 2).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        {/* Total Feedback */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold text-foreground">{feedbacks.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        {/* Average Rating */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
        {['users', 'feedback'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {loadingUsers ? (
                  <div className="p-6 text-center text-muted-foreground">Loading users...</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">User</th>
                        <th className="text-left p-4 font-medium text-foreground">Join Date</th>
                        <th className="text-left p-4 font-medium text-foreground">Last Active</th>
                        <th className="text-left p-4 font-medium text-foreground">Last Logged in</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">{user.fullname}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : 'N/A'}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {timeAgo(user.lastLogin)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${user.lastLogin && (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24) <= 2
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {user.lastLogin && (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24) <= 2
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {loadingFeedbacks ? (
              <div className="p-6 text-center text-muted-foreground">Loading feedbacks...</div>
            ) : (
              filteredFeedbacks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No feedbacks found.</div>
              ) : (
                filteredFeedbacks.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {item.user?.fullname?.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{item.user?.fullname}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{item.feedback}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{item.user?.email}</span>
                      <span>{new Date(item.submittedAt).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UsersFeedback;