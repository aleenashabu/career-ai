import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import User from "../models/user.js"; // Add this import
import CareerPath from "../models/careerPath.js"; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const predictCareer = async (req, res) => {
  try {
    const { skills } = req.body;

    // Validate input
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills array is required"
      });
    }

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    console.log("Received skills data:", skills);

    const payload = {
      skills,
      model_path: path.resolve(__dirname, "../../ml/career_prediction_model.pkl"),
      top_predictions: 3,
    };

    // Correct paths for Python environment
    const pythonPath = path.resolve(__dirname, "../../ml/venv/Scripts/python.exe");
    const scriptPath = path.resolve(__dirname, "../../ml/predict_career.py");

    console.log("Using Python:", pythonPath);
    console.log("Running Script:", scriptPath);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Check if files exist
    const fs = await import('fs');
    if (!fs.existsSync(pythonPath)) {
      return res.status(500).json({
        success: false,
        message: "Python environment not found. Please ensure virtual environment is set up."
      });
    }

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({
        success: false,
        message: "Python prediction script not found."
      });
    }

    const python = spawn(pythonPath, [scriptPath]);

    // Send data to Python script via stdin
    python.stdin.write(JSON.stringify(payload));
    python.stdin.end();

    let output = "";
    let errorOutput = "";

    // Collect stdout data
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    // Collect stderr data
    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("Python stderr:", data.toString());
    });

    // Handle process completion
    python.on("close", async (code) => {
      try {
        console.log(`Python process exited with code: ${code}`);
        console.log("Python output:", output);

        if (code !== 0) {
          console.error("Python process failed with error:", errorOutput);
          return res.status(500).json({
            success: false,
            message: "Prediction process failed",
            error: errorOutput
          });
        }

        if (!output.trim()) {
          return res.status(500).json({
            success: false,
            message: "No output received from prediction script"
          });
        }

        // Parse the JSON result
        const result = JSON.parse(output);

        if (result.status !== "success") {
          return res.status(500).json({
            success: false,
            message: result.message || "Prediction failed"
          });
        }

        // Extract career names from predictions
        const careerNames = result.predictions.map((p) => p.career);

        const careers = await CareerPath.find({
          title: { $in: careerNames.map(name => new RegExp("^" + name + "$", "i")) }
        });

        // Map predictions → add careerId
        const predictionsWithId = result.predictions.map((pred) => {
          const careerDoc = careers.find((c) => c.title === pred.career);
          return {
            ...pred,
            careerId: careerDoc ? careerDoc._id : null,
          };
        });

        // Update user's predicted careers (optional)
        try {
          await User.findByIdAndUpdate(req.user._id, {
            predictedCareers: careerNames,
            lastPredictionDate: new Date()
          });
        } catch (dbError) {
          console.log("Warning: Could not update user predicted careers:", dbError.message);
          // Continue without updating user record
        }

        // Return successful response
        res.status(200).json({
          success: true,
          predictions: predictionsWithId,  // now includes careerId
          skills_summary: result.skills_summary,
          total_skills_evaluated: result.total_skills_evaluated
        });


      } catch (parseError) {
        console.error("Error parsing Python output:", parseError);
        console.error("Raw output:", output);
        res.status(500).json({
          success: false,
          message: "Failed to parse prediction results",
          error: parseError.message
        });
      }
    });

    // Handle Python process errors
    python.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start prediction process",
        error: error.message
      });
    });

  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};


export const getCareerById = async (req, res) => {
  try {
    const careerId = req.params.id;
    const career = await CareerPath.findById(careerId);
    if (!career) {
      return res.status(404).json({ success: false, message: "Career not found" });
    }
    res.status(200).json(career);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
