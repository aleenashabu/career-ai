import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Code,
  Globe,
  Brain,
  Database,
  Shield,
} from "lucide-react";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { useNavigate } from "react-router-dom";

const SkillRating = ({ skill, value = 0, onChange }) => {
  const [currentValue, setCurrentValue] = useState(value);

  const ratingLabels = [
    "Not Interested",
    "Beginner",
    "Basic",
    "Intermediate",
    "Advanced",
    "Excellent",
  ];

  const ratingDescriptions = [
    "No interest in learning this skill",
    "Just started learning or have minimal knowledge",
    "Can perform basic tasks with guidance",
    "Comfortable with most common tasks",
    "Can handle complex tasks independently",
    "Expert level - can teach and mentor others",
  ];

  const colorSchemes = [
    {
      bg: "bg-gray-200",
      track: "bg-gray-400",
      thumb: "border-gray-500",
      text: "text-gray-600",
    }, // Not Interested
    {
      bg: "bg-red-200",
      track: "bg-red-400",
      thumb: "border-red-500",
      text: "text-red-600",
    }, // Beginner
    {
      bg: "bg-orange-200",
      track: "bg-orange-400",
      thumb: "border-orange-500",
      text: "text-orange-600",
    }, // Basic
    {
      bg: "bg-yellow-200",
      track: "bg-yellow-400",
      thumb: "border-yellow-500",
      text: "text-yellow-600",
    }, // Intermediate
    {
      bg: "bg-blue-200",
      track: "bg-blue-400",
      thumb: "border-blue-500",
      text: "text-blue-600",
    }, // Advanced
    {
      bg: "bg-green-200",
      track: "bg-green-400",
      thumb: "border-green-500",
      text: "text-green-600",
    }, // Excellent
  ];

  const handleValueChange = (newValue) => {
    setCurrentValue(newValue);
    onChange(skill, newValue);
  };

  const currentRating = Math.round(currentValue);
  const currentLabel = ratingLabels[currentRating];
  const currentDescription = ratingDescriptions[currentRating];
  const currentColors = colorSchemes[currentRating];

  return (
    <div className="space-y-4 p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">
            {skill}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            {currentDescription}
          </p>
        </div>
        <div className="text-left sm:text-right flex-shrink-0">
          <div
            className={`text-base sm:text-lg font-semibold ${currentColors.text}`}
          >
            {currentLabel}
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {currentRating}/5
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Custom Slider */}
        <div className="relative px-2 py-4">
          <div
            className={`h-2 w-full rounded-full ${currentColors.bg} relative`}
          >
            {/* Progress Track */}
            <div
              className={`h-2 rounded-full ${currentColors.track} transition-all duration-300 ease-out`}
              style={{ width: `${(currentValue / 5) * 100}%` }}
            />
            {/* Slider Thumb */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 ${currentColors.thumb} shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95`}
              style={{
                left: `calc(${(currentValue / 5) * 100}% - ${
                  currentValue === 0
                    ? "10px"
                    : currentValue === 5
                    ? "10px"
                    : "12px"
                })`,
                zIndex: 10,
              }}
            />
            {/* Invisible input for interaction */}
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={currentValue}
              onChange={(e) => handleValueChange(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
          </div>
        </div>

        {/* Labels */}
        <div className="grid grid-cols-2 sm:flex sm:justify-between gap-1 text-xs text-gray-600">
          {ratingLabels.map((label, index) => (
            <span
              key={index}
              className={`text-center sm:text-left transition-all duration-200 px-1 py-1 rounded ${
                currentRating === index
                  ? `${currentColors.text} font-medium bg-gray-50`
                  : "hover:text-gray-800"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CareerAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coreProgramming: {},
    webDevelopment: {},
    aiMachineLearning: {},
    dataCloud: {},
    csFundamentals: {},
  });

  const updateSkillData = (category, skill, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const skillOrder = [
        "C Programming",
        "C++ Programming",
        "Java",
        "Python",
        "JavaScript",
        "Data Structures & Algorithms",
        "HTML/CSS",
        "React.js",
        "Node.js / Express.js",
        "Mobile App Development (Flutter/React Native)",
        "Database Management (SQL)",
        "Database Management (MongoDB)",
        "Machine Learning Fundamentals",
        "Deep Learning",
        "Natural Language Processing",
        "Large Language Models (ChatGPT/LLaMA)",
        "Chatbot Development",
        "Computer Vision",
        "Data Analysis (Pandas, NumPy, Excel)",
        "Data Visualization (Matplotlib, Seaborn, Power BI)",
        "Statistics & Probability",
        "Cloud Computing (AWS/Azure/GCP)",
        "Big Data Tools (Hadoop, Spark)",
        "Operating Systems",
        "Computer Networks",
        "Cybersecurity",
        "Software Engineering & Project Management",
        "DevOps & CI/CD (Docker, Kubernetes)",
      ];

      // Convert to [{skill: value}, ...]
      const skillsPayload = skillOrder.map((skill) => {
        let value = 0;
        for (const category in formData) {
          if (formData[category][skill] !== undefined) {
            value = formData[category][skill];
            break;
          }
        }
        return { [skill]: value };
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/predict-career`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ skills: skillsPayload }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        console.log("Predicted careers:", data);
        navigate("/predicted-careers", { state: { predictions: data.predictions } });
        // Show results in modal or navigate to results page
      } else {
        console.error("Prediction failed:", data.message);
      }
    } catch (err) {
      console.error("Error submitting:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Core Programming Skills",
      icon: <Code className="w-5 h-5" />,
      skills: [
        "C Programming",
        "C++ Programming",
        "Java",
        "Python",
        "JavaScript",
        "Data Structures & Algorithms",
      ],
      category: "coreProgramming",
    },
    {
      title: "Web & App Development",
      icon: <Globe className="w-5 h-5" />,
      skills: [
        "HTML/CSS",
        "React.js",
        "Node.js / Express.js",
        "Mobile App Development (Flutter/React Native)",
        "Database Management (SQL)",
        "Database Management (MongoDB)",
      ],
      category: "webDevelopment",
    },
    {
      title: "AI & Machine Learning",
      icon: <Brain className="w-5 h-5" />,
      skills: [
        "Machine Learning Fundamentals",
        "Deep Learning",
        "Natural Language Processing",
        "Large Language Models (ChatGPT/LLaMA)",
        "Chatbot Development",
        "Computer Vision",
      ],
      category: "aiMachineLearning",
    },
    {
      title: "Data & Cloud Technologies",
      icon: <Database className="w-5 h-5" />,
      skills: [
        "Data Analysis (Pandas, NumPy, Excel)",
        "Data Visualization (Matplotlib, Seaborn, Power BI)",
        "Statistics & Probability",
        "Cloud Computing (AWS/Azure/GCP)",
        "Big Data Tools (Hadoop, Spark)",
      ],
      category: "dataCloud",
    },
    {
      title: "Computer Science Fundamentals",
      icon: <Shield className="w-5 h-5" />,
      skills: [
        "Operating Systems",
        "Computer Networks",
        "Cybersecurity",
        "Software Engineering & Project Management",
        "DevOps & CI/CD (Docker, Kubernetes)",
      ],
      category: "csFundamentals",
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <LoadingOverlay
        loading={loading}
        message="Analyzing your skills… Please wait."
      />
      <div className="bg-transparent shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Smart Career Assessment
              </h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Rate your skills to get personalized career guidance
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center space-x-3 text-white">
              {currentStepData.icon}
              <h2 className="text-lg sm:text-xl font-semibold">
                {currentStepData.title}
              </h2>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {currentStepData.skills.map((skill) => (
              <SkillRating
                key={skill}
                skill={skill}
                value={formData[currentStepData.category][skill] || 0}
                onChange={(skill, value) =>
                  updateSkillData(currentStepData.category, skill, value)
                }
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start ${
                currentStep === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2 order-1 sm:order-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? "bg-blue-600 w-6"
                      : index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors duration-200 order-3 w-full sm:w-auto shadow-sm"
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 order-3 w-full sm:w-auto justify-center sm:justify-end shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm">
        <p>
          Complete all sections to get your personalized career recommendations
        </p>
      </footer>
    </div>
  );
};

export default CareerAssessment;
