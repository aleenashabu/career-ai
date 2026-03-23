import { Link, useLocation, useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", type: "route" },
    { name: "About", href: "/about", type: "route" },
    { name: "Features", href: "features", type: "scroll" },
    { name: "Contact", href: "contact", type: "scroll" }
  ];

  const location = useLocation();
  const navigate = useNavigate();

const handleNavClick = (item) => {
  if (item.name === "Home") {
    if (location.pathname === "/") {
      // Already on home, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to home
      navigate("/");
    }
  } else if (item.type === "route") {
    navigate(item.href);
  } else if (item.type === "scroll") {
    if (location.pathname !== "/") {
      // Navigate to home first
      navigate("/");
      // Scroll after a short delay to allow Landing page to render
      setTimeout(() => {
        scroller.scrollTo(item.href, {
          smooth: true,
          duration: 600,
          offset: -80,
        });
      }, 100);
    } else {
      // Already on landing page — scroll directly
      scroller.scrollTo(item.href, {
        smooth: true,
        duration: 600,
        offset: -80,
      });
    }
  }
};


  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CareerAI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => {
                  handleNavClick(item);
                  setIsMenuOpen(false); // for mobile menu
                }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-foreground hover:text-primary transition-colors duration-300 font-medium relative group bg-transparent"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </motion.button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button variant="ghost" className="text-foreground hover:text-primary">
                <Link to="/login">Login</Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="hero"><Link to="/register">Get Started</Link></Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-300 font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="text-foreground hover:text-primary justify-start" onClick={() => {
                  navigate("/login");
                  setIsMenuOpen(false);
                }}>
                  Login
                </Button>
                <Button variant="hero" className="justify-start" onClick={() => {
                  navigate("/register");
                  setIsMenuOpen(false);
                }}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;