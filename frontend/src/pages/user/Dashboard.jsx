import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (minutes < 60) return `${minutes} min ago`;
  else if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  else return `${days} day${days > 1 ? "s" : ""} ago`;
};

const Dashboard = ({ onSectionChange }) => {
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [userDetails, setUserDetails] = useState({ name: "" });
  const baseurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseurl}/api/user/basedetails`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserDetails({
            name: data.data.fullname || "",
            profilePicture: data.data.profilePic || null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
    fetchUserDetails();
  }, [baseurl]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats([
          {
            title: "Completed Assessments",
            value: data.data.completedAssessmentsCount,
            total: data.data.totalAssessmentsCount,
            icon: Target,
            color: "text-blue-600"
          },
          // {
          //   title: "Courses Available",
          //   value: data.data.totalCoursesCount,
          //   total: data.data.totalCoursesCount,
          //   icon: BookOpen,
          //   color: "text-green-600",
          //   note: "Upcoming courses in the future"
          // },
          // {
          //   title: "Next Assessment",
          //   value: data.data.nextAssessment ? data.data.nextAssessment.title : "No upcoming assessment",
          //   total: "",
          //   icon: Calendar,
          //   color: "text-gray-400",
          //   disabled: !data.data.nextAssessment
          // },
          {
            title: "Latest Career Prediction",
            value: data.data.latestPrediction || "No prediction yet",
            total: "",
            icon: TrendingUp,
            color: "text-purple-600",
            disabled: !data.data.latestPrediction
          }
        ]);
      }
    };
    fetchStats();
  }, [baseurl]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseurl}/api/user/recent-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentActivities(data.data);
      }
    };
    fetchRecentActivities();
  }, [baseurl]);

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-primary rounded-lg p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userDetails.name.split(" ")[0]}!
        </h1>
        <p className="text-white/90 text-lg">
          Continue your learning journey and discover new career opportunities.
        </p>
        {/* <div className="mt-6">
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Continue Learning
          </Button>
        </div> */}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const progress = stat.total
            ? Math.min((parseInt(stat.value) / parseInt(stat.total)) * 100, 100)
            : 0;
          return (
            <Card
              key={stat.title}
              className={`hover:shadow-lg transition-shadow duration-300 ${stat.disabled ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.total ? `/${stat.total}` : ""}
                </div>
                {stat.total && (
                  <>
                    <Progress value={progress} className="mt-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {progress.toFixed(0)}% complete
                    </p>
                  </>
                )}
                {stat.note && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {stat.note}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground">No recent activities found.</p>
              ) : (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button  onClick={() => onSectionChange("courses")} className="w-full justify-start" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
              <Button onClick={() => onSectionChange("tests")} className="w-full justify-start" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Take Assessment
              </Button>
              <Button onClick={() => onSectionChange("prediction")} className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Career Predictions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;