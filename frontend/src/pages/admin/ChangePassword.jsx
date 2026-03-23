import { useState } from "react";
import { Eye, EyeOff, Lock, Shield, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const { logout } = useAuth();
  const backendUrl = import.meta.env.VITE_API_URL;
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = [
    { text: "At least 8 characters long", met: formData.newPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(formData.newPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(formData.newPassword) },
    { text: "Contains number", met: /\d/.test(formData.newPassword) },
    { text: "Contains special character", met: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.newPassword) },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordRequirements.every((req) => req.met)) {
      newErrors.newPassword = "Password does not meet all requirements";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    setIsSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to change password");

      toast.success("Password changed! Please log in again.");
      logout(); // logout after success
    } catch (err) {
      toast.error(err.message || "Password update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Change Password</h1>
        <p className="text-muted-foreground">Update your password to keep your account secure</p>
      </div>

      {/* Security Tips */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-foreground mb-2">Security Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a unique password you haven't used before</li>
              <li>• At least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Don't share your password with anyone</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            value={formData.currentPassword}
            onChange={(val) => handleInputChange("currentPassword", val)}
            show={showPassword.current}
            onToggle={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
            error={errors.currentPassword}
          />

          {/* New Password */}
          <PasswordInput
            label="New Password"
            value={formData.newPassword}
            onChange={(val) => handleInputChange("newPassword", val)}
            show={showPassword.new}
            onToggle={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
            error={errors.newPassword}
          />

          {formData.newPassword && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Password Requirements:</p>
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${req.met ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className={`text-sm ${req.met ? "text-green-700" : "text-muted-foreground"}`}>{req.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={(val) => handleInputChange("confirmPassword", val)}
            show={showPassword.confirm}
            onToggle={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

const PasswordInput = ({ label, value, onChange, show, onToggle, error }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      <Lock className="w-4 h-4 inline mr-2" /> {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {error && <p className="text-destructive text-sm mt-1">{error}</p>}
  </div>
);

export default ChangePassword;
