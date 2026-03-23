import { motion } from "framer-motion";
import { Trophy, Calendar, TrendingUp, Award, Medal, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const CareerPredictionResults = ({ predictions }) => {
    const currentPredictions = predictions.map((prediction, index) => {
        let config;
        if (index === 0) {
            config = {
                icon: Crown,
                glassStyle: "bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border-yellow-500/30 shadow-amber-500/10",
            };
        } else if (index === 1) {
            config = {
                icon: Award,
                glassStyle: "bg-gradient-to-br from-gray-300/20 to-slate-500/20 border-gray-400/30 shadow-slate-500/10",
            };
        } else if (index === 2) {
            config = {
                icon: Medal,
                glassStyle: "bg-gradient-to-br from-orange-400/20 to-amber-700/20 border-orange-500/30 shadow-orange-500/10",
            };
        }
        // Pass through all prediction fields
        return {
            ...prediction,
            rank: index + 1,
            icon: config?.icon,
            glassStyle: config?.glassStyle,
        };
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                duration: 0.5
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const hoverVariants = {
        hover: {
            scale: 1.05,
            y: -8,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Your Career Predictions
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Based on your assessment, here are your top career paths
                    </p>
                </motion.div>

                {/* Current Predictions - Trophy Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                >
                    {currentPredictions.map((prediction, index) => {
                        const IconComponent = prediction.icon;
                        return (
                            <motion.div
                                key={prediction.rank}
                                variants={cardVariants}
                                whileHover="hover"
                                className="relative"
                            >
                                <motion.div variants={hoverVariants}>
                                    <Card className={`relative overflow-hidden backdrop-blur-sm ${prediction.glassStyle} shadow-2xl border-2`}>
                                        <CardHeader className="text-center pb-4">
                                            <div className="relative mb-4">
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                                                    className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center backdrop-blur-sm border border-primary/30"
                                                >
                                                    {IconComponent && <IconComponent className="w-8 h-8 text-primary" />}
                                                </motion.div>
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute -top-2 -right-2 text-xs font-bold"
                                                >
                                                    #{prediction.rank}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl font-bold text-foreground">
                                                {prediction.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center">
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {prediction.description}
                                            </p>
                                            {prediction.recommendedCourses && prediction.recommendedCourses.length > 0 && (
                                                <div className="mt-4 text-sm text-left">
                                                    <div className="font-semibold mb-1">Recommended Courses:</div>
                                                    <ul className="list-disc ml-6 space-y-1">
                                                        {prediction.recommendedCourses.map((course, idx) => (
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
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default CareerPredictionResults;