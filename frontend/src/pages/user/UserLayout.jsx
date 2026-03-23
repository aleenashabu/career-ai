import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UserNavbar from "../../components/user/UserNavbar";
import Dashboard from "./Dashboard";
import PredictionTester from "./PredictionTester";
import Courses from "./Courses";
import Tests from "./Tests";
import MyAccount from "./MyAccount";
import ChangePassword from "./ChangePassword";
import Feedback from "./Feedback";
import { useLocation } from "react-router-dom";

const UserLayout = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderContent = () => {
    const contentVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    };

    switch (activeSection) {
      case "dashboard":
        return (
          <motion.div
            key="dashboard"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Dashboard onSectionChange={setActiveSection}/>
          </motion.div>
        );
      case "prediction":
        return (
          <motion.div
            key="prediction"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <PredictionTester />
          </motion.div>
        );
      case "feedback":
        return (
          <motion.div
            key="feedback"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Feedback />
          </motion.div>
        );
      case "courses":
        return (
          <motion.div
            key="courses"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Courses />
          </motion.div>
        );
      case "tests":
        return (
          <motion.div
            key="tests"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Tests />
          </motion.div>
        );
      case "account":
        return (
          <motion.div
            key="account"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <MyAccount />
          </motion.div>
        );
      case "password":
        return (
          <motion.div
            key="password"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ChangePassword />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="dashboard"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Dashboard />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <UserNavbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Content Area */}
      <main className="pt-16"> {/* pt-16 to account for fixed navbar height */}
        <div className="min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;