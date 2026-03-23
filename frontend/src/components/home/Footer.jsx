import { useLocation, useNavigate } from "react-router-dom";
import { scroller } from "react-scroll";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Phone, MapPin, Facebook, Github, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "Platform": [
      { name: "Features", href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Pricing", href: "#pricing" },
      { name: "Success Stories", href: "#success" }
    ],
    "Resources": [
      { name: "Career Guide", href: "#guide" },
      { name: "Blog", href: "#blog" },
      { name: "Help Center", href: "#help" },
      { name: "API Documentation", href: "#api" }
    ],
    "Company": [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#careers" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" }
    ]
  };
  const location = useLocation();
  const navigate = useNavigate();

  const handleFooterLinkClick = (href) => {
    const id = href.replace("#", "");

    if (location.pathname === "/") {
      // Already on home, scroll directly
      scroller.scrollTo(id, {
        smooth: true,
        duration: 600,
        offset: -80
      });
    } else {
      // Navigate to home first
      navigate("/");
      setTimeout(() => {
        scroller.scrollTo(id, {
          smooth: true,
          duration: 600,
          offset: -80
        });
      }, 100);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: "", label: "Facebook" },
    { icon: Github, href: "https://github.com/jerryjames2001/jerryjames2001", label: "Github" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/jerry-james-/", label: "LinkedIn" },
    { icon: Instagram, href: "", label: "Instagram" }
  ];

  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CareerAI</span>
            </div>
            <p className="text-background/80 mb-6 leading-relaxed">
              Empowering students and professionals to discover their ideal career paths through
              AI-powered guidance and personalized recommendations.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/80">aleena@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-background/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-background/80">Kottayam</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      onClick={() => handleFooterLinkClick(link.href)}
                      className="text-left w-full text-background/80 hover:text-primary transition-colors duration-300 block py-1 bg-transparent"
                    >
                      {link.name}
                    </a>

                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-background/20 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-background/60 text-sm">
              © 2025 CareerAI. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-background/80 group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;