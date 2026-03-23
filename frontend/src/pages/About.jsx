import { motion } from "framer-motion";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Users, Target, Award, Heart } from "lucide-react";
import { use, useEffect } from "react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower individuals with AI-driven career guidance that transforms uncertainty into clear, actionable pathways to success."
    },
    {
      icon: Heart,
      title: "Our Vision",
      description: "A world where everyone has access to personalized career guidance, regardless of their background or starting point."
    },
    {
      icon: Award,
      title: "Our Values",
      description: "Innovation, inclusivity, and integrity guide everything we do. We believe in making career development accessible to all."
    },
    {
      icon: Users,
      title: "Our Community",
      description: "Building a supportive ecosystem where professionals, students, and career changers can thrive together."
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      bio: "Former career counselor with 15+ years of experience in talent development and AI innovation."
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      bio: "AI researcher and engineer passionate about applying machine learning to solve real-world problems."
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Research",
      bio: "Career psychology expert with PhD in organizational behavior and workforce development."
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-primary">CareerAI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing career development with AI-powered guidance that helps 
              millions of professionals discover their ideal career paths and achieve their goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                CareerAI was born from a simple observation: too many talented individuals 
                struggle to find their ideal career path, not from lack of ability, but from 
                lack of personalized guidance and clear direction.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Founded in 2025, we set out to democratize career counseling by combining 
                the expertise of seasoned career professionals with the power of artificial 
                intelligence. Our platform analyzes your unique strengths, interests, and 
                goals to provide tailored recommendations that evolve with your journey.
              </p>
              <p className="text-lg leading-relaxed">
                Today, we're proud to serve professionals at every stage of their careers, 
                from recent graduates exploring their options to experienced professionals 
                seeking new challenges and growth opportunities.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What Drives Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values shape every decision we make and every feature we build.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-elegant transition-all duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate experts dedicated to transforming career development through technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 + index * 0.1 }}
              >
                <Card className="text-center p-6 hover:shadow-elegant transition-all duration-300">
                  <CardContent className="space-y-4">
                    <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;