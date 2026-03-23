import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  GraduationCap,
  LayoutDashboard,
  TestTube,
  BookOpen,
  FileText,
  ChevronDown,
  User,
  Lock,
  LogOut,
  MessageSquareHeart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const UserNavbar = ({ activeSection, onSectionChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", profilePicture: null });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_API_URL;
  const profileRef = useRef(null);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "prediction", label: "Prediction Tester", icon: TestTube },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "tests", label: "Tests", icon: FileText },
    { id: "feedback", label: "Feedback", icon: MessageSquareHeart },
  ];

  const profileMenuItems = [
    { label: "My Account", icon: User },
    { label: "Change Password", icon: Lock },
    { label: "Logout", icon: LogOut }
  ];

  // Fetch user details
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
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CareerAI</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 transition-all duration-300 ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:text-primary hover:bg-muted"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Profile Section */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-muted transition-colors duration-300"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userDetails.name || "User"}</p>
              </div>
              <Avatar className="w-8 h-8">
                {userDetails.profilePicture ? (
                  <AvatarImage src={`${baseurl}${userDetails.profilePicture}`} alt="User" />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userDetails.name ? userDetails.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""
                  }`}
              />
            </Button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50"
                >
                  <div className="py-2">
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors duration-200"
                          onClick={() => {
                            setIsProfileOpen(false);
                            if (item.label === "My Account") {
                              onSectionChange("account");
                            } else if (item.label === "Change Password") {
                              onSectionChange("password");
                            } else if (item.label === "Logout") {
                              logout();
                              navigate("/login");
                            }
                          }}
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center space-x-2 ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:text-primary"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
