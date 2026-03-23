import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Search, ExternalLink } from "lucide-react";

const Courses = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const baseurl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // ⬅ Get token from storage
        const res = await fetch(`${baseurl}/api/courses/user`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ⬅ Add token here
          },
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setCourses(data.data);
        } else {
          console.error("Failed to fetch courses:", data.message);
        }
      } catch (err) {
        console.error("Server error:", err);
      }
    };

    fetchCourses();
  }, [baseurl]);


  // Filter courses dynamically
  const filteredCourses = courses.filter(course => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "free" && course.type === "free") ||
      (activeFilter === "paid" && course.type === "paid");

    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.platform.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
        <p className="text-muted-foreground text-lg">
          Discover and learn from the best courses across different platforms
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center sm:justify-between justify-center gap-4"
      >
        {/* Glassy Toggle Bar */}
        <div className="flex items-center justify-center">
          <div className="relative backdrop-blur-lg bg-background/80 border border-border/50 rounded-xl p-1 shadow-lg">
            <div className="flex items-center">
              <button
                onClick={() => setActiveFilter("free")}
                className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === "free"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Free
              </button>

              {/* Glowing Divider */}
              <div className="w-px h-6 bg-gradient-to-b from-primary/20 via-primary/60 to-primary/20 mx-2" />

              <button
                onClick={() => setActiveFilter("paid")}
                className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === "paid"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
          />
        </div>
      </motion.div>

      {/* Courses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${searchTerm}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail.startsWith("http") ? course.thumbnail : `${baseurl}${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevents parent click if added in future
                        window.open(course.url, "_blank");
                      }}
                      className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={course.type.toLowerCase() === "free" ? "secondary" : "default"}
                        className={course.type.toLowerCase() === "free" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}
                      >
                        {course.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {course.platform}
                      </span>
                      <button
                        onClick={() => window.open(course.url, "_blank")}
                        className="hover:text-primary transition-colors duration-300"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </button>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">No courses found matching your criteria.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Courses;