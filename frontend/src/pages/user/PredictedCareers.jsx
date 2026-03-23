import { use, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { TrendingUp, Building2, Users, Target, DollarSign, Star, CheckCircle, AlertCircle, Clock, Home } from "lucide-react";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { Button } from "../../components/ui/button";

const PredictedCareers = () => {
    const location = useLocation();
    const predictions = location.state?.predictions || [];
    const [careerDetails, setCareerDetails] = useState([]);
    const [careerData, setCareerData] = useState([]);
    const [loadingCareers, setLoadingCareers] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!predictions || predictions.length === 0) return;

        const fetchCareerDetails = async () => {
            setLoadingCareers(true);
            try {
                const detailedData = await Promise.all(
                    predictions.map(async (pred) => {
                        // Wait for ML API to provide the ID
                        if (!pred.careerId) return null;

                        const res = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/user/career/${pred.careerId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );
                        if (!res.ok) return null;
                        const career = await res.json();

                        return {
                            ...career,
                            career_readiness: pred.career_readiness,
                            confidence: pred.confidence,
                            confidence_percentage: pred.confidence_percentage,
                            preference: `${pred.rank}st Preference`,
                        };
                    })
                );

                // Filter out any nulls (just in case)
                setCareerData(detailedData.filter(Boolean));
            } catch (err) {
                console.error("Error fetching career details:", err);
            } finally {
                setLoadingCareers(false);
            }
        };

        fetchCareerDetails();
    }, [predictions]);


    const getPreferenceColor = (preference) => {
        switch (preference) {
            case "1st Preference":
                return "bg-green-100 text-green-800 border-green-200";
            case "2nd Preference":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "3rd Preference":
                return "bg-purple-100 text-purple-800 border-purple-200";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getReadinessColor = (level) => {
        if (level >= 80) return "bg-green-100 text-green-800";
        if (level >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const getCardStyleByRank = (preference) => {
        switch (preference) {
            case "1st Preference": // Gold
                return "border-yellow-400 bg-yellow-50 shadow-lg hover:shadow-2xl";
            case "2nd Preference": // Platinum
                return "border-gray-400 bg-gray-100 shadow-md hover:shadow-xl";
            case "3rd Preference": // Silver
                return "border-gray-300 bg-gray-50 shadow-sm hover:shadow-lg";
            default:
                return "border-border bg-card shadow";
        }
    };

    const getScopeIcon = (scope) => {
        switch (scope.toLowerCase()) {
            case "very high":
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case "high":
                return <TrendingUp className="w-4 h-4 text-blue-600" />;
            default:
                return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    if (loadingCareers) {
        return <LoadingOverlay />;
    }

    return (
        <div className="p-6 space-y-8">
            <div className="text-center mt-4 mb-8">
                <Button
                    onClick={() => navigate("/home", { state: { section: "prediction" } })}
                    size="lg"
                    className="hover:scale-105 transition-transform duration-200"
                >
                    <Home className="w-5 h-5 mr-2" />
                    Return to Home
                </Button>
            </div>
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    Your Career Recommendations
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Based on your assessment, here are your top career paths tailored to your skills and interests
                </p>
            </motion.div>

            {/* Career Cards Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {careerData.map((career, index) => (
                    <motion.div
                        key={index}
                        variants={cardVariants}
                        whileHover={{
                            y: -5,
                            transition: { duration: 0.2 }
                        }}
                    >
                        <Card className={`h-full transition-shadow duration-300 ${getCardStyleByRank(career.preference)}`}>
                            <CardHeader className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant="outline"
                                        className={`${getPreferenceColor(career.preference)} font-medium`}
                                    >
                                        {career.preference}
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {career.confidence_percentage ?? 0}%
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">
                                    {career.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {career.description}
                                </p>
                                {career.recommendedCourses && career.recommendedCourses.length > 0 && (
                                    <div className="mt-4 text-sm text-left">
                                        <div className="font-semibold mb-1">Recommended Courses:</div>
                                        <ul className="list-disc ml-6 space-y-1">
                                            {career.recommendedCourses.map((course, idx) => (
                                                <li key={idx}>
                                                    <a
                                                        href={
                                                            course.url.startsWith("http://") || course.url.startsWith("https://")
                                                                ? course.url
                                                                : `https://${course.url}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary underline hover:text-blue-600 transition"
                                                    >
                                                        {course.platform}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Key Highlights */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-foreground flex items-center">
                                        <Target className="w-4 h-4 mr-2 text-primary" />
                                        Key Highlights
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center text-muted-foreground">
                                                {getScopeIcon(career.futureScope)}
                                                <span className="ml-2">Future Scope</span>
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {career.futureScope}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center text-muted-foreground">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="ml-2">Average Salary</span>
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {career.averageSalary}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center text-sm text-muted-foreground">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                Top Companies
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {career.companies.slice(0, 3).map((company, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {company}
                                                    </Badge>
                                                ))}
                                                {career.companies.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{career.companies.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="flex items-center text-sm text-muted-foreground">
                                                <Users className="w-4 h-4 mr-2" />
                                                Job Roles
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {career.jobRoles.slice(0, 2).map((role, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                                {career.jobRoles.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{career.jobRoles.length - 2} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skill Insights */}
                                <div className="space-y-3 pt-3 border-t border-border">
                                    <h4 className="font-semibold text-foreground">Skill Insights</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Readiness Level</span>
                                                <Badge className={`text-xs ${getReadinessColor(career.readinessLevel)}`}>
                                                    {career.confidence_percentage ?? 0}%
                                                </Badge>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${career.confidence_percentage ?? 0}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="bg-primary h-2 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="flex items-center text-sm text-muted-foreground mb-1">
                                                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                                                Strong Skills
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {career.requiredSkills.map((skill, idx) => (
                                                    <Badge key={idx} className="text-xs bg-green-100 text-green-800 hover:bg-green-200">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="flex items-center text-sm text-muted-foreground mb-1">
                                                <AlertCircle className="w-3 h-3 mr-1 text-orange-600" />
                                                Growth Areas
                                            </span>
                                            {/* <div className="flex flex-wrap gap-1">
                                                {career.growthAreas.map((area, idx) => (
                                                    <Badge key={idx} className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Coming Soon Section
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <Card className="border-dashed border-2 border-muted">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                            <Clock className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground">
                                Recommended Courses
                            </h3>
                            <p className="text-muted-foreground max-w-sm">
                                Personalized course recommendations based on your career goals – Coming Soon
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div> */}
        </div>
    );
};

export default PredictedCareers;