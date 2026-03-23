import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Brain, TrendingUp, Activity, Award, Target, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const backendUrl = import.meta.env.VITE_API_URL;
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${backendUrl}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          // Map raw backend stats -> frontend display objects
          const mappedStats = [
            {
              label: "Total Users",
              value: data.data.totalUsers,
              icon: Users,
              color: "from-blue-500 to-blue-600"
            },
            {
              label: "Active Courses",
              value: data.data.activeCourses,
              icon: BookOpen,
              color: "from-green-500 to-green-600"
            },
            // {
            //   label: "Predictions Made",
            //   value: data.data.predictions,   // currently not counting
            //   icon: Brain,
            //   color: "from-purple-500 to-purple-600"
            // },
            {
              label: "Success Rate",
              value: data.data.successRate + "%",
              icon: TrendingUp,
              color: "from-orange-500 to-orange-600"
            }
          ];

          setStats(mappedStats);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };

    fetchStats();
  }, [backendUrl]);

  useEffect(() => {
    const fetchActivity = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${backendUrl}/api/admin/recent-activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRecentActivity(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch activity", err);
      }
    };

    fetchActivity();
  }, [backendUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity.time)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
            <Target className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/admin/courses")}
              className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center hover:bg-primary/20 transition-colors"
            >
              <Award className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="text-sm font-medium text-primary">Add Course</span>
            </button>
            <button
              onClick={() => navigate("/admin/users-feedback")}
              className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center hover:bg-green-500/20 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-600">View Users</span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
