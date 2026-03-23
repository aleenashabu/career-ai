import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ClipboardList,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";
import AptitudeTestModal from "./AptitudeTestModal";
import DeleteConfirmModal from "../../components/admin/DeleteConfirmModal";
import { toast } from "react-toastify";

const AptitudeTests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tests, setTests] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedTest, setSelectedTest] = useState(null);
  const [testToDelete, setTestToDelete] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/aptitude-tests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTests(data.data);
        } else {
          toast.error(data.message || "Failed to fetch tests");
        }
      } catch (err) {
        console.error("Error fetching tests:", err);
        toast.error("Server error while fetching tests");
      }
    };
    fetchTests();
  }, []);

  const categories = [
    "all",
    "Numerical Ability",
    "Verbal Ability",
    "Logical Ability",
  ];

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Handle Save Test - Only update local state, API call handled by modal
  const handleSaveTest = (savedTest) => {
    if (modalMode === "add") {
      setTests((prev) => [...prev, savedTest]);
    } else {
      setTests((prev) =>
        prev.map((t) => (t._id === savedTest._id ? savedTest : t))
      );
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${backendUrl}/api/aptitude-tests/${testToDelete._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t._id !== testToDelete._id));
        toast.success("Test deleted successfully!");
      } else {
        toast.error("Failed to delete test");
      }
      setIsDeleteModalOpen(false);
      setTestToDelete(null);
    } catch (err) {
      console.error("Error deleting test:", err);
      toast.error("Server error while deleting test");
    }
  };

  // ✅ Modal handlers
  const handleAddTest = () => {
    setModalMode("add");
    setSelectedTest(null);
    setIsModalOpen(true);
  };

  const handleEditTest = (test) => {
    setModalMode("edit");
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleDeleteTest = (test) => {
    setTestToDelete(test);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (test) => {
    try {
      const newStatus = test.status === 'Active' ? 'Draft' : 'Active';

      const res = await fetch(`${backendUrl}/api/aptitude-tests/${test._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      // Update local state so UI updates immediately
      setTests(prev =>
        prev.map(t => (t._id === test._id ? { ...t, status: newStatus } : t))
      );

      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to change status');
    }
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
          <h1 className="text-3xl font-bold text-foreground">
            Manage Aptitude Tests
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage aptitude tests for career assessment
          </p>
        </div>
        <button
          onClick={handleAddTest}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Test</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTests.map((test, index) => (
          <motion.div
            key={test._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ClipboardList className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {test.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {test.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                        test.difficulty
                      )}`}
                    >
                      {test.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEditTest(test)}
                  className="p-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTest(test)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ClipboardList className="w-4 h-4" />
                <span>{test.questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{test.duration} min</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{test.participants} taken</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span>{(test.averageScore || 0).toFixed(2)}% avg score</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(test)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${test.status === 'Active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
              >
                {test.status}
              </button>
              {/* <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                  View Results
                </button>
                <button className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-accent transition-colors">
                  Preview
                </button>
              </div> */}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AptitudeTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTest}
        test={selectedTest}
        mode={modalMode}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={testToDelete?.title}
      />
    </motion.div>
  );
};

export default AptitudeTests;
