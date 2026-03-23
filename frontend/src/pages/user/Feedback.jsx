import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Send, MessageSquareHeart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from 'react-toastify'

const Feedback = () => {
    const [category, setCategory] = useState("overall");
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem("token");


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!feedback.trim()) {
            toast.error("Please provide your feedback before submitting.");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a rating before submitting.");
            return;
        }

        setIsSubmitting(true);

        // API call to backend
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // If your backend uses JWT
                },
                body: JSON.stringify({ category, rating, feedback }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to submit feedback");
            }
            toast.success("Feedback submitted successfully!");

            // Reset form
            setCategory("overall");
            setRating(0);
            setFeedback("");
        } catch (err) {
            toast.error(err.message || "Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = [
        { value: "overall", label: "Overall Experience" },
        { value: "courses", label: "Courses" },
        { value: "prediction", label: "Career Prediction" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                    >
                        <MessageSquareHeart className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                        Share Your Feedback
                    </h1>
                    <p className="text-muted-foreground">
                        We value your opinion and would love to hear from you
                    </p>
                </div>

                {/* Feedback Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Card className="shadow-lg border-primary/10">
                        <CardHeader>
                            <CardTitle>Your Feedback Matters</CardTitle>
                            <CardDescription>
                                Help us improve by sharing your thoughts and experiences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Category Selection */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Category</Label>
                                    <RadioGroup value={category} onValueChange={setCategory}>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {categories.map((cat) => (
                                                <motion.div
                                                    key={cat.value}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Label
                                                        htmlFor={cat.value}
                                                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${category === cat.value
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                            }`}
                                                    >
                                                        <RadioGroupItem value={cat.value} id={cat.value} />
                                                        <span className="font-medium">{cat.label}</span>
                                                    </Label>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Star Rating */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Rating</Label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredStar(star)}
                                                onMouseLeave={() => setHoveredStar(0)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-10 h-10 transition-all ${star <= (hoveredStar || rating)
                                                        ? "fill-primary text-primary"
                                                        : "text-muted-foreground"
                                                        }`}
                                                />
                                            </motion.button>
                                        ))}
                                        {rating > 0 && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="ml-4 text-lg font-semibold text-primary"
                                            >
                                                {rating} / 5
                                            </motion.span>
                                        )}
                                    </div>
                                </div>

                                {/* Feedback Textarea */}
                                <div className="space-y-3">
                                    <Label htmlFor="feedback" className="text-base font-semibold">
                                        Your Feedback
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Share your thoughts, suggestions, or concerns..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="min-h-[150px] resize-none"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {feedback.length} / 1000 characters
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="w-4 h-4" />
                                                Submit Feedback
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Thank You Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-center"
                >
                    <p className="text-sm text-muted-foreground">
                        Your feedback helps us create a better experience for everyone
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Feedback;