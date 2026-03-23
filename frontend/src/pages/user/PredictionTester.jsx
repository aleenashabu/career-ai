import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CareerPredictionResults from "./CareerPredictionResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { TestTube, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StunningLoader from "../../components/ui/StunningLoader";

const PredictionTester = () => {
  const navigate = useNavigate();
  const [userPredictions, setUserPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseurl}/api/user/myprofile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserPredictions(data.data.predictedCareers || []);
        } else {
          setUserPredictions([]);
        }
      } catch (err) {
        console.error(err);
        setUserPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <StunningLoader />;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 space-y-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Prediction Tester</h1>
        <p className="text-muted-foreground text-lg">
          Test our AI-powered career prediction models with your profile data.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <TestTube className="w-6 h-6 text-blue-600" />
                <span>Career Path Predictor</span>
              </CardTitle>
              <CardDescription className="text-center">
                Discover your ideal career paths based on skills and interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">User Data</span>
                  <span className="text-sm text-green-600">✓ Complete</span>
                </div>
                {userPredictions.length > 0 ? (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Skills Assessment</span>
                    <span className="text-sm text-green-600">✓ Complete</span>
                  </div>) : (
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="font-medium">Career Prediction</span>
                    <span className="text-sm text-blue-600">-- Pending</span>
                  </div>
                )}
                {/* <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Interest Profile</span>
                  <span className="text-sm text-orange-600">⚠ Partial</span>
                </div> */}
              </div>
              <Button className="w-full" onClick={() => navigate("/career-assessment")}>
                <Brain className="w-4 h-4 mr-2" />
                Run Prediction
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {userPredictions.length > 0 ? (
        <CareerPredictionResults predictions={userPredictions} />
      ) : (
        <p>No career predictions available yet.</p>
      )}
    </div>
  );
};

export default PredictionTester;
