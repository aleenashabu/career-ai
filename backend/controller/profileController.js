import User from "../models/user.js";

export const completeProfile = async (req, res) => {
  try {
    const userId = req.user._id; // added by verifyToken

    const { mobile, graduationYear,  } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        mobile,
        graduationYear,
        profileCompleted: true
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Profile update failed", error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};
