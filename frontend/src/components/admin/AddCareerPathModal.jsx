import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrendingUp, TrendingDown, PauseCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// TagInput component for tags (skills, companies, roles)
const TagInput = ({ label, placeholder, tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

const AddCareerPathModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    averageSalary: '',
    salaryTrend: '',
    futureScope: ''
  });

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([
    { platform: '', url: '' }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle recommended courses input change
  const handleCourseChange = (idx, field, value) => {
    setRecommendedCourses(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  // Remove a course row
  const handleRemoveCourse = (idx) => {
    setRecommendedCourses(prev => prev.filter((_, i) => i !== idx));
  };

  // Add a new course row
  const handleAddCourse = () => {
    setRecommendedCourses(prev => [...prev, { platform: '', url: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required!");
      return;
    }
    // Validate recommended courses (optional: enforce both fields filled for each)
    const filteredCourses = recommendedCourses.filter(
      c => c.platform.trim() && c.url.trim()
    );
    const token = localStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_API_URL;
    const newPath = {
      title: formData.title,
      description: formData.description,
      averageSalary: formData.averageSalary,
      salaryTrend: formData.salaryTrend,
      futureScope: formData.futureScope,
      requiredSkills,
      companies,
      jobRoles,
      recommendedCourses: filteredCourses,
      status: "Draft"
    };
    try {
      const res = await fetch(`${backendUrl}/api/admin/career-paths`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPath)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create career path");
      toast.success("Career path created successfully!");
      onSave(data.data);
      handleClose();
    } catch (err) {
      toast.error(err.message || "Career path creation failed");
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      averageSalary: '',
      salaryTrend: '',
      futureScope: ''
    });
    setRequiredSkills([]);
    setCompanies([]);
    setJobRoles([]);
    setRecommendedCourses([{ platform: '', url: '' }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Add New Career Path
          </DialogTitle>
        </DialogHeader>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Career Name */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Career Name *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Software Engineering"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full"
            />
          </div>
          {/* Career Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Career Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the career path, responsibilities, and overview..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              className="w-full min-h-[100px] resize-y"
            />
          </div>
          {/* Average Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-sm font-medium text-foreground">
              Average Salary
            </Label>
            <Input
              id="salary"
              type="text"
              placeholder="e.g., 6-12 LPA"
              value={formData.averageSalary}
              onChange={(e) => handleInputChange('averageSalary', e.target.value)}
              className="w-full"
            />
          </div>
          {/* Salary Trend and Future Scope */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Salary Trend
              </Label>
              <Select
                value={formData.salaryTrend}
                onValueChange={(value) => handleInputChange('salaryTrend', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increasing"><span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" />Increasing</span>
                  </SelectItem>
                  <SelectItem value="decreasing"><span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Decreasing</span>
                  </SelectItem>
                  <SelectItem value="stable"><span className="flex items-center gap-2"><PauseCircle className="w-4 h-4 text-gray-500" />Stable</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Future Scope Level
              </Label>
              <Select
                value={formData.futureScope}
                onValueChange={(value) => handleInputChange('futureScope', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Required Skills */}
          <TagInput
            label="Required Skills"
            placeholder="Type a skill and press Enter"
            tags={requiredSkills}
            setTags={setRequiredSkills}
          />
          {/* Companies Hiring */}
          <TagInput
            label="Companies Hiring"
            placeholder="Type a company name and press Enter"
            tags={companies}
            setTags={setCompanies}
          />
          {/* Job Roles */}
          <TagInput
            label="Job Roles"
            placeholder="Type a job role and press Enter"
            tags={jobRoles}
            setTags={setJobRoles}
          />
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
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Path
            </button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCareerPathModal;