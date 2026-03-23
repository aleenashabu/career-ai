import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Edit, Trash2, MapPin } from "lucide-react";
import AddCareerPathModal from "../../components/admin/AddCareerPathModal";
import EditCareerPathModal from "../../components/admin/EditCareerPathModal";
import { toast } from "react-toastify";

const CareerPaths = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [careerPaths, setCareerPaths] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // Fetch all career paths from backend
  const fetchCareerPaths = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/career-paths`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCareerPaths(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch career paths:", err.message);
    }
  };

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const handleAddCareerPath = (newPath) => {
    setCareerPaths((prev) => [...prev, newPath]);
    fetchCareerPaths();
  };

  const handleToggleStatus = async (path) => {
    const newStatus = path.status === "Active" ? "Draft" : "Active";
    try {
      const res = await fetch(`${backendUrl}/api/admin/career-paths/${path._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCareerPaths((prev) =>
          prev.map((p) =>
            p._id === path._id ? { ...p, status: newStatus } : p
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err.message);
    }
  };

  const handleEdit = (path) => {
    setSelectedPath(path);
    setIsEditModalOpen(true);
  };

  const handleUpdateCareerPath = (updatedPath) => {
    setCareerPaths((prev) =>
      prev.map((p) => (p._id === updatedPath._id ? updatedPath : p))
    );
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this career path?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/career-paths/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCareerPaths((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  const filteredPaths = careerPaths.filter(
    (path) =>
      path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-foreground">Career Paths</h1>
          <p className="text-muted-foreground mt-2">
            Manage and organize career guidance paths for students
          </p>
        </div>
        {/* <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Path</span>
        </button> */}
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search career paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Career Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path, index) => (
          <motion.div
            key={path._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span
                  onClick={() => handleToggleStatus(path)}
                  className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors duration-200 ${path.status === "Active"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  title={`Click to toggle status`}
                >
                  {path.status}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(path)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(path._id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {path.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Career Path Modal */}
      <AddCareerPathModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCareerPath}
      />
      {/* Edit Career Path Modal */}
      <EditCareerPathModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={selectedPath}
        onUpdate={handleUpdateCareerPath}
      />
    </motion.div>
  );
};

export default CareerPaths;
