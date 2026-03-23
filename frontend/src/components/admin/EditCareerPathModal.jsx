import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TrendingUp, TrendingDown, PauseCircle } from "lucide-react";
import { toast } from "react-toastify";

// TagInput for skills, companies, job roles
const TagInput = ({ label, placeholder, tags, setTags }) => {
    const [inputValue, setInputValue] = useState("");
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                setTags([...tags, inputValue.trim()]);
            }
            setInputValue("");
        }
    };
    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">{label}</Label>
            <div className="space-y-2">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                />
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.span>
                        ))}
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
        </div>
    );
};

const EditCareerPathModal = ({ isOpen, onClose, initialData, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        averageSalary: "",
        salaryTrend: "",
        futureScope: "",
        status: "Draft",
    });

    const [requiredSkills, setRequiredSkills] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([{ platform: "", url: "" }]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                averageSalary: initialData.averageSalary || "",
                salaryTrend: initialData.salaryTrend || "",
                futureScope: initialData.futureScope || "",
                status: initialData.status || "Draft",
            });
            setRequiredSkills(initialData.requiredSkills || []);
            setCompanies(initialData.companies || []);
            setJobRoles(initialData.jobRoles || []);
            setRecommendedCourses(
                initialData.recommendedCourses && initialData.recommendedCourses.length > 0
                    ? initialData.recommendedCourses
                    : [{ platform: "", url: "" }]
            );
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCourseChange = (idx, field, value) => {
        setRecommendedCourses(prev => {
            const updated = [...prev];
            updated[idx][field] = value;
            return updated;
        });
    };

    const handleRemoveCourse = (idx) => {
        setRecommendedCourses(prev => prev.filter((_, i) => i !== idx));
    };

    const handleAddCourse = () => {
        setRecommendedCourses(prev => [...prev, { platform: "", url: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error("Title and description are required!");
            return;
        }
        const filteredCourses = recommendedCourses.filter(
            c => c.platform.trim() && c.url.trim()
        );
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_API_URL;
        try {
            const res = await fetch(`${backendUrl}/api/admin/career-paths/${initialData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    requiredSkills,
                    companies,
                    jobRoles,
                    recommendedCourses: filteredCourses,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update career path");
            toast.success("Career path updated successfully!");
            onUpdate(data.data);
            handleClose();
        } catch (err) {
            toast.error(err.message || "Update failed");
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Edit Career Path</DialogTitle>
                </DialogHeader>
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Title */}
                    <div className="space-y-2">
                        <Label>Career Name *</Label>
                        <Input value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Career Description *</Label>
                        <Textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
                    </div>
                    {/* Average Salary */}
                    <div className="space-y-2">
                        <Label>Average Salary</Label>
                        <Input value={formData.averageSalary} onChange={(e) => handleInputChange("averageSalary", e.target.value)} />
                    </div>
                    {/* Salary Trend, Future Scope, Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Salary Trend</Label>
                            <Select value={formData.salaryTrend} onValueChange={(v) => handleInputChange("salaryTrend", v)}>
                                <SelectTrigger><SelectValue placeholder="Select trend" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="increasing"><span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" />Increasing</span></SelectItem>
                                    <SelectItem value="decreasing"><span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Decreasing</span></SelectItem>
                                    <SelectItem value="stable"><span className="flex items-center gap-2"><PauseCircle className="w-4 h-4 text-gray-500" />Stable</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Future Scope</Label>
                            <Select value={formData.futureScope} onValueChange={(v) => handleInputChange("futureScope", v)}>
                                <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleInputChange("status", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status">
                                        {formData.status === "Active" ? (
                                            <span className="text-green-600">Active</span>
                                        ) : formData.status === "Draft" ? (
                                            <span className="text-yellow-600">Draft</span>
                                        ) : (
                                            "Select status"
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active"><span className="text-green-600">Active</span></SelectItem>
                                    <SelectItem value="Draft"><span className="text-yellow-600">Draft</span></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Tags */}
                    <TagInput label="Required Skills" placeholder="Add skill and press Enter" tags={requiredSkills} setTags={setRequiredSkills} />
                    <TagInput label="Companies Hiring" placeholder="Add company and press Enter" tags={companies} setTags={setCompanies} />
                    <TagInput label="Job Roles" placeholder="Add role and press Enter" tags={jobRoles} setTags={setJobRoles} />
                    {/* Recommended Courses */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Recommended Courses</Label>
                        {recommendedCourses.map((course, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <Input
                                    type="text"
                                    placeholder="Platform (e.g. Coursera)"
                                    value={course.platform}
                                    onChange={e => handleCourseChange(idx, 'platform', e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="text"
                                    placeholder="Course URL"
                                    value={course.url}
                                    onChange={e => handleCourseChange(idx, 'url', e.target.value)}
                                    className="flex-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCourse(idx)}
                                    className="text-destructive hover:text-red-700"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddCourse}
                            className="flex items-center gap-1 text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                        </button>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            <div className="flex items-center space-x-2">
                                <Save className="w-4 h-4" /> <span>Save Changes</span>
                            </div>
                        </button>
                    </div>
                </motion.form>
            </DialogContent>
        </Dialog>
    );
};

export default EditCareerPathModal;