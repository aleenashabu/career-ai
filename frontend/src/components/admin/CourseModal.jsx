import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link, AlertCircle } from 'lucide-react';

const CourseModal = ({
  isOpen,
  onClose,
  onSave,
  course = null,
  mode = 'add' // 'add' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    type: 'free',
    platform: '',
    url: ''
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [inputMode, setInputMode] = useState('url'); // 'url' or 'upload'

  // Pre-fill form when editing
  useEffect(() => {
    if (course && mode === 'edit') {
      setFormData({
        title: course.title || '',
        thumbnail: course.thumbnail || '',
        type: course.type || 'free',
        platform: course.platform || '',
        url: course.url || ''
      });
      setImagePreview(course.thumbnail || '');
      setInputMode(typeof course.thumbnail === "string" ? 'url' : 'upload');
    } else {
      setFormData({ title: '', thumbnail: '', type: 'free', platform: '', url: '' });
      setImagePreview('');
      setInputMode('url');
    }
  }, [course, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    // Thumbnail validation for both URL & File
    if (!formData.thumbnail) {
      newErrors.thumbnail = 'Course thumbnail is required';
    } else if (typeof formData.thumbnail === "string" && !formData.thumbnail.trim()) {
      newErrors.thumbnail = 'Course thumbnail URL cannot be empty';
    }

    // Platform validation
    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform name is required';
    }

    // Course URL validation
    if (!formData.url.trim()) {
      newErrors.url = 'Course URL is required';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update preview for thumbnail URL
    if (field === 'thumbnail' && inputMode === 'url') {
      setImagePreview(value);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file })); // store the file
      setImagePreview(URL.createObjectURL(file)); // preview for UI
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...formData,
        _id: course?._id, // keep original id for PUT
      });

      onClose();
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {mode === 'edit' ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.title ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.title}</span>
                  </div>
                )}
              </div>

              {/* Course Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course Thumbnail *
                </label>

                {/* Toggle between URL and Upload */}
                <div className="flex space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('url');
                      setFormData(prev => ({ ...prev, thumbnail: '' })); // reset value
                      setImagePreview('');
                    }}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${inputMode === 'url'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Link className="w-4 h-4 inline mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('upload');
                      setFormData(prev => ({ ...prev, thumbnail: '' })); // reset value
                      setImagePreview('');
                    }}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${inputMode === 'upload'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload
                  </button>
                </div>

                {inputMode === 'url' ? (
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.thumbnail ? 'border-destructive' : 'border-border'
                      }`}
                    placeholder="Enter image URL"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.thumbnail ? 'border-destructive' : 'border-border'
                      }`}
                  />
                )}

                {errors.thumbnail && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.thumbnail}</span>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Platform Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Platform Name *
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.platform ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="e.g., Coursera, Udemy, LinkedIn"
                />
                {errors.platform && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.platform}</span>
                  </div>
                )}
              </div>

              {/* Course URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Official Course URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.url ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="https://example.com/course"
                />
                {errors.url && (
                  <div className="flex items-center space-x-1 mt-1 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.url}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {mode === 'edit' ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseModal;