import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, MapPin, BookOpen, Brain, ClipboardList, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ activeSection, onSectionChange, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'career-paths', label: 'Career Paths', path: '/admin/career-paths', icon: MapPin },
    { id: 'courses', label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { id: 'aptitude-tests', label: 'Aptitude Tests', path: '/admin/aptitude-tests', icon: ClipboardList },
    { id: 'users-feedback', label: 'Users & Feedback', path: '/admin/users-feedback', icon: Users },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-hidden z-40"
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2 border-b border-border">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  activeSection === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                title={collapsed ? item.label : ''}
              >
                <item.icon 
                  className={`w-5 h-5 flex-shrink-0 ${
                    activeSection === item.id 
                      ? 'text-primary-foreground' 
                      : 'group-hover:text-foreground'
                  }`} 
                />
                <motion.span
                  initial={false}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className={`font-medium whitespace-nowrap ${
                    collapsed ? 'w-0 overflow-hidden' : 'w-auto'
                  }`}
                >
                  {item.label}
                </motion.span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-4 left-4 right-4"
        >
        </motion.div>
      )}
    </motion.aside>
  );
};

export default AdminSidebar;