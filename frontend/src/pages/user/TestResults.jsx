import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { CheckCircle, XCircle, Target, Award, Home } from "lucide-react";

const TestResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_API_URL;

  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // 1. Prefer result from navigate state (immediate after submit)
  // 2. Otherwise fetch from backend (on refresh)
  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    } else {
      const fetchResult = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${backendUrl}/api/aptitude-tests/completed-tests?testId=${testId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (res.ok && data?.data) {
            // assume API returns list → pick latest attempt
            const latest = Array.isArray(data.data) ? data.data[0] : data.data;
            setResult(latest);
          }
        } catch (err) {
          console.error("Failed to fetch test result", err);
        }
      };
      fetchResult();
    }
  }, [location.state, testId, backendUrl]);

  // Animate score counter
  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      const increment = result.score / 30;
      const interval = setInterval(() => {
        setAnimatedScore((prev) => {
          if (prev >= result.score) {
            clearInterval(interval);
            return result.score;
          }
          return Math.min(prev + increment, result.score);
        });
      }, 50);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [result]);

  if (!result) {
    return <div className="p-6 text-center">Loading results...</div>;
  }

  // Map backend result into UI structure
  const testData = {
    id: result.test,
    name: result.test?.title || "Test",
    totalQuestions: result.maxScore,
    correctAnswers: result.score,
    wrongAnswers: result.maxScore - result.score,
    totalMarks: result.maxScore,
    obtainedMarks: result.score,
    percentage: Math.round((result.score / result.maxScore) * 100),
  };

const getPerformanceLevel = (percentage) => {
  if (percentage >= 90) return { level: "Excellent", color: "bg-secondary" };
  if (percentage >= 75) return { level: "Very Good", color: "bg-primary" };
  if (percentage >= 60) return { level: "Good", color: "bg-accent-blue" };
  if (percentage >= 50) return { level: "Average", color: "bg-yellow-500" };
  if (percentage >= 30) return { level: "Pass - Needs Improvement", color: "bg-orange-500" };
  return { level: "Failed", color: "bg-destructive" };
};

  const performance = getPerformanceLevel(testData.percentage);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Test Results
          </h1>
          <p className="text-xl text-muted-foreground">{testData.name}</p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 relative">
                  <svg className="transform -rotate-90 w-full h-full">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 45 * (1 - testData.percentage / 100),
                      }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="text-center"
                    >
                      <div className="text-3xl md:text-4xl font-bold text-primary">
                        {Math.round(animatedScore)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        /{testData.totalMarks}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-2xl md:text-3xl font-bold text-primary mb-2"
                >
                  {testData.percentage}%
                </motion.div>
                <Badge
                  className={`${performance.color} text-white px-4 py-2 text-lg`}
                >
                  {performance.level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Statistics Column */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-5 h-5 text-primary" />
                Test Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-semibold">
                  {testData.totalQuestions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  Correct Answers:
                </span>
                <span className="font-semibold text-secondary">
                  {testData.correctAnswers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Wrong Answers:
                </span>
                <span className="font-semibold text-destructive">
                  {testData.wrongAnswers}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Column */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="w-5 h-5 text-primary" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {performance.level}
                </div>
<p className="text-muted-foreground">
  {testData.percentage >= 90 &&
    "Outstanding performance! You have excellent understanding of the concepts."}
  {testData.percentage >= 75 &&
    testData.percentage < 90 &&
    "Good work! You have a solid grasp of most concepts."}
  {testData.percentage >= 60 &&
    testData.percentage < 75 &&
    "Average performance. Consider reviewing the material."}
  {testData.percentage >= 30 &&
    testData.percentage < 60 &&
    "You passed, but there is room for improvement. Focus on weak areas."}
  {testData.percentage < 30 &&
    "Unfortunately, you did not pass. Keep practicing and focus on fundamentals."}
</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Accuracy Rate</span>
                  <span>
                    {Math.round(
                      (testData.correctAnswers / testData.totalQuestions) * 100
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={(testData.correctAnswers / testData.totalQuestions) * 100}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Return Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Button
            onClick={() => navigate("/home", { state: { section: "tests" } })}
            size="lg"
            className="hover:scale-105 transition-transform duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TestResults;
