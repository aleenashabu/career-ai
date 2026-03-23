import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Brain, BookOpen, TrendingUp, Users, Award, Lightbulb, Target, BarChart3, GraduationCap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Career Prediction",
      description: "Advanced machine learning algorithms analyze your interests, skills, and personality to predict the most suitable career paths.",
      color: "text-primary"
    },
    {
      icon: Target,
      title: "Aptitude-Based Suggestions",
      description: "Get personalized recommendations based on comprehensive aptitude assessments and skill evaluations.",
      color: "text-secondary"
    },
    {
      icon: BookOpen,
      title: "Curated Learning Paths",
      description: "Access tailored educational resources, courses, and certifications to build the skills needed for your chosen career.",
      color: "text-accent-blue"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Stay informed about industry trends, salary expectations, and job market demands in your field of interest.",
      color: "text-accent-green"
    },
    {
      icon: Users,
      title: "Expert Mentorship",
      description: "Connect with industry professionals and mentors who can guide you through your career journey.",
      color: "text-primary"
    },
    {
      icon: Award,
      title: "Skill Certification",
      description: "Earn recognized certifications and build a portfolio that showcases your expertise to potential employers.",
      color: "text-secondary"
    }
  ];

  const steps = [
    {
      icon: Lightbulb,
      title: "Assessment",
      description: "Complete our comprehensive career assessment questionnaire"
    },
    {
      icon: BarChart3,
      title: "Analysis",
      description: "Our AI analyzes your responses and compares them with career data"
    },
    {
      icon: GraduationCap,
      title: "Recommendations",
      description: "Receive personalized career suggestions and learning paths"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">Career Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the comprehensive tools and resources designed to guide you towards your ideal career path
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full bg-gradient-card hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started on your career journey in just three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative text-center"
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-8"></div>
              )}

              {/* Step Number */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;