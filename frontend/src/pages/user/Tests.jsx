import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Clock, Target, PlayCircle, CheckCircle, AlertCircle, Trophy, Lock } from "lucide-react";

const backendUrl = import.meta.env.VITE_API_URL;

const Tests = () => {
  const navigate = useNavigate();
  const [availableTests, setAvailableTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleStartTest = (testId) => {
    navigate(`/test/${testId}`);
  };
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());

      // cleanup expired lockout keys automatically
      availableTests.forEach((test) => {
        const lockoutKey = `lockout_${test._id}`;
        const lockoutTime = sessionStorage.getItem(lockoutKey);
        if (lockoutTime && Date.now() >= parseInt(lockoutTime)) {
          sessionStorage.removeItem(lockoutKey);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [availableTests]);


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Trophy className="w-5 h-5 text-yellow-600" />;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        // Active tests for user
        const r1 = await fetch(`${backendUrl}/api/aptitude-tests/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d1 = await r1.json();
        if (r1.ok && d1?.data) setAvailableTests(d1.data);

        // Completed tests for user
        const r2 = await fetch(`${backendUrl}/api/aptitude-tests/completed-tests/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d2 = await r2.json();
        if (r2.ok && d2?.data) setCompletedTests(d2.data);
      } catch {
        // no-op; could show toast if desired
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Skill Tests</h1>
        <p className="text-muted-foreground text-lg">
          Test your knowledge and track your progress with our comprehensive assessments.
        </p>
      </motion.div>

      {/* Available Tests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-foreground">Available Tests</h2>

        {loading ? (
          <div className="text-muted-foreground">Loading tests...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableTests.map((test, index) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">{test.category}</Badge>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{test.duration} mins</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{test.questions?.length ?? 0} questions</span>
                      </div>
                    </div>

                    {(() => {
                      const lockoutKey = `lockout_${test._id}`;
                      const lockoutTime = sessionStorage.getItem(lockoutKey);
                      const isLocked = lockoutTime && now < parseInt(lockoutTime);

                      let remainingText = "";
                      if (isLocked) {
                        const remainingMs = parseInt(lockoutTime) - now;
                        const mins = Math.floor(remainingMs / 60000);
                        const secs = Math.floor((remainingMs % 60000) / 1000);
                        remainingText = `Unlocks in ${mins}m ${secs}s`;
                      }

                      return (
                        <div className="space-y-2">
                          <Button
                            className={`w-full ${isLocked ? "bg-red-600 hover:bg-red-700" : ""}`}
                            onClick={() => {
                              if (!isLocked) handleStartTest(test._id);
                            }}
                            disabled={isLocked}
                          >
                            {isLocked ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Locked
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Start Test
                              </>
                            )}
                          </Button>

                          {isLocked && (
                            <p className="text-sm text-center text-muted-foreground">{remainingText}</p>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Test Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-foreground">Test Results</h2>
        <Card>
          <CardHeader>
            <CardTitle>Recent Test History</CardTitle>
            <CardDescription>Your completed tests and performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Completed: {test.completedAt}</span>
                        <span>Duration: {test.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${test.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                      {test.score}/{test.maxScore}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((test.score / test.maxScore) * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}

              {completedTests.length === 0 && !loading && (
                <div className="text-muted-foreground">No test history yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Tests;