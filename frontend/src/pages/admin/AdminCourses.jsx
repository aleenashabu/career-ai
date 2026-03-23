import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import CourseModal from '../../components/admin/CourseModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import { toast } from 'react-toastify';

const AdminCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [courses, setCourses] = useState([]);
  const baseurl = import.meta.env.VITE_API_URL;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const types = ['all', 'free', 'paid'];


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseurl}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCourses(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch courses');
        }
      } catch (err) {
        toast.error('Server error: ' + err.message);
      }
    };
    fetchCourses();
  }, [baseurl]);

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || course.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleToggleStatus = async (course) => {
    const token = localStorage.getItem('token');
    const newStatus = course.status === "Active" ? "Draft" : "Active";
    const fd = new FormData();

    // For update, send only status (and thumbnail if needed for backend)
    fd.append("status", newStatus);
    // If thumbnail is required by backend, you may need to send it as well:
    // fd.append("thumbnail", course.thumbnail);

    try {
      const res = await fetch(`${baseurl}/api/courses/${course._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses((prev) =>
          prev.map((c) => (c._id === course._id ? { ...c, status: newStatus } : c))
        );
        toast.success(`Status changed to ${newStatus}`);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };
  // Modal handlers
  const handleAddCourse = () => {
    setModalMode('add');
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setModalMode('edit');
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCourse = async (courseData) => {
    const token = localStorage.getItem('token');
    const fd = new FormData();

    fd.append("title", courseData.title);
    fd.append("type", courseData.type);
    fd.append("platform", courseData.platform);
    fd.append("url", courseData.url);
    fd.append("status", courseData.status || "Active");

    if (courseData.thumbnail instanceof File) {
      fd.append("thumbnail", courseData.thumbnail);
    } else {
      fd.append("thumbnail", courseData.thumbnail);
    }

    const endpoint = modalMode === 'edit'
      ? `${baseurl}/api/courses/${courseData._id}`
      : `${baseurl}/api/courses`;

    const method = modalMode === 'edit' ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (modalMode === 'edit') {
          setCourses(prev => prev.map(c => c._id === data.course._id ? data.course : c));
          toast.success("Course updated successfully!");
        } else {
          setCourses(prev => [data.course, ...prev]);
          toast.success("Course added successfully!");
        }
      } else {
        toast.error(data.message || "Failed to save course");
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseurl}/api/courses/${courseToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseToDelete._id));
        toast.success("Course deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete course");
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses Management</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage all courses in the platform
          </p>
        </div>
        <button
          onClick={handleAddCourse}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {types.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Course</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <motion.tr
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 rounded border border-border overflow-hidden">
                          <img
                            src={course.thumbnail.startsWith("http")
                              ? course.thumbnail
                              : `${baseurl}${course.thumbnail}`}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />

                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-foreground">{course.title}</h3>
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {course.platform} • {course.type === 'free' ? 'Free' : 'Paid'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        onClick={() => handleToggleStatus(course)}
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors duration-200 ${course.status === 'Active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        title="Click to toggle status"
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-6 text-muted-foreground">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground">{courses.length}</h3>
          <p className="text-muted-foreground">Total Courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground">
            {courses.filter(c => c.status === 'Active').length}
          </h3>
          <p className="text-muted-foreground">Active Courses</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground">
            {courses.filter(c => c.status === 'Draft').length}
          </h3>
          <p className="text-muted-foreground">Draft Courses</p>
        </div>
      </div>

      {/* Modals */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        course={selectedCourse}
        mode={modalMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={courseToDelete?.title}
      />
    </motion.div>
  );
};

export default AdminCourses;
