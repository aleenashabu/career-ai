import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Register from "./pages/Register";
import Login from "./pages/Login";

import CareerAssessment from "./pages/user/CareerAssessment";
import ProfileCompletion from "./pages/user/ProfileCompletion";
import UserLayout from "./pages/user/UserLayout";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminPass from "./pages/admin/ChangePassword";
import CareerPaths from "./pages/admin/CareerPaths";
import AdminCourses from "./pages/admin/AdminCourses";
import AptitudeTests from "./pages/admin/AptitudeTests";
import UsersFeedback from "./pages/admin/UsersFeedback";

import LoadingOverlay from "./components/ui/LoadingOverlay";
import Loading2 from "./components/ui/StunningLoader";
import PredictedCareers from "./pages/user/PredictedCareers";

import FullScreenTest from "./pages/user/FullScreenTest";
import TestResults from "./pages/user/TestResults";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/loading" element={<LoadingOverlay />} />
        <Route path="/loading2" element={<Loading2 />} />
        <Route path="/predicted-careers" element={<PredictedCareers />} />

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/career-assessment" element={<CareerAssessment />} />
          <Route path="/profile-completion" element={<ProfileCompletion />} />
          <Route path="/home" element={<UserLayout />} />
          <Route path="/test/:testId" element={<FullScreenTest />} />
          <Route path="/results/:testId" element={<TestResults />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="career-paths" element={<CareerPaths />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="aptitude-tests" element={<AptitudeTests />} />
            <Route path="users-feedback" element={<UsersFeedback />} />
            <Route path="change-password" element={<AdminPass />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer />
    </>
  );
};

export default App;
