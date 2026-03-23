#!/usr/bin/env python3
"""
Career Prediction Script for Node.js Integration
Reads JSON input from stdin, makes predictions, outputs JSON result
"""

import joblib
import numpy as np
import json
import sys
import os
import traceback

class NodeJSCareerPredictor:
    def __init__(self):
        self.model_data = None
        self.skills = [
            "C Programming", "C++ Programming", "Java", "Python", "JavaScript", 
            "Data Structures & Algorithms", "HTML/CSS", "React.js", "Node.js / Express.js",
            "Mobile App Development (Flutter/React Native)", "Database Management (SQL)",
            "Database Management (MongoDB)", "Machine Learning Fundamentals", "Deep Learning",
            "Natural Language Processing", "Large Language Models (ChatGPT/LLaMA)",
            "Chatbot Development", "Computer Vision", "Data Analysis (Pandas, NumPy, Excel)",
            "Data Visualization (Matplotlib, Seaborn, Power BI)", "Statistics & Probability",
            "Cloud Computing (AWS/Azure/GCP)", "Big Data Tools (Hadoop, Spark)",
            "Operating Systems", "Computer Networks", "Cybersecurity",
            "Software Engineering & Project Management", "DevOps & CI/CD (Docker, Kubernetes)"
        ]

    def log_error(self, message):
        """Log error messages to stderr"""
        print(f"ERROR: {message}", file=sys.stderr)

    def log_debug(self, message):
        """Log debug messages to stderr"""
        print(f"DEBUG: {message}", file=sys.stderr)

    def load_model(self, model_path="career_prediction_model.pkl"):
        """Load the trained model from disk"""
        try:
            if not os.path.exists(model_path):
                self.log_error(f"Model file not found: {model_path}")
                return False
            
            self.log_debug(f"Loading model from: {model_path}")
            self.model_data = joblib.load(model_path)
            
            # Verify model components
            required_keys = ['rf_model', 'xgb_model', 'label_encoder', 'skills']
            for key in required_keys:
                if key not in self.model_data:
                    self.log_error(f"Model missing required component: {key}")
                    return False
            
            # Use skills from model if available, otherwise use default
            if 'skills' in self.model_data:
                self.skills = self.model_data['skills']
            
            self.log_debug(f"Model loaded successfully with {len(self.skills)} skills")
            return True
            
        except Exception as e:
            self.log_error(f"Model loading failed: {str(e)}")
            self.log_error(traceback.format_exc())
            return False

    def predict_career_from_nodejs(self, skills_data, top_n=3):
        """Main function for prediction from Node.js"""
        try:
            self.log_debug(f"Processing {len(skills_data)} skill entries")
            
            skills_array = self.convert_nodejs_format(skills_data)
            if skills_array is None:
                return {"status": "error", "message": "Invalid skills data format"}

            self.log_debug(f"Converted to skills array: {skills_array[:5]}...")
            
            predictions = self.predict_career(skills_array, top_n)
            
            return {
                "status": "success",
                "predictions": predictions,
                "total_skills_evaluated": int(len(skills_array)),
                "skills_summary": self.get_skills_summary(skills_array),
            }
            
        except Exception as e:
            self.log_error(f"Prediction failed: {str(e)}")
            self.log_error(traceback.format_exc())
            return {"status": "error", "message": str(e)}

    def convert_nodejs_format(self, skills_data):
        """Convert [{skillName: value}, ...] to ordered array"""
        try:
            skill_values = {}
            
            # Parse skills data
            for skill_dict in skills_data:
                if not isinstance(skill_dict, dict):
                    self.log_error(f"Invalid skill entry format: {skill_dict}")
                    continue
                    
                for skill_name, value in skill_dict.items():
                    try:
                        skill_values[skill_name] = max(0, min(5, int(value)))
                    except (ValueError, TypeError):
                        self.log_error(f"Invalid skill value for {skill_name}: {value}")
                        skill_values[skill_name] = 0

            self.log_debug(f"Parsed {len(skill_values)} skills from input")
            
            # Create ordered array based on model training order
            skills_array = []
            missing_skills = []
            
            for skill in self.skills:
                if skill in skill_values:
                    skills_array.append(skill_values[skill])
                else:
                    skills_array.append(0)  # Default to 0 if skill not provided
                    missing_skills.append(skill)
            
            if missing_skills:
                self.log_debug(f"Skills not provided (defaulted to 0): {missing_skills[:5]}...")
            
            return skills_array
            
        except Exception as e:
            self.log_error(f"Error converting skills format: {str(e)}")
            return None

    def predict_career(self, skills_array, top_n=3):
        """Predict top N careers"""
        try:
            skills_array = np.array(skills_array).reshape(1, -1)
            
            rf_model = self.model_data["rf_model"]
            xgb_model = self.model_data["xgb_model"]
            label_encoder = self.model_data["label_encoder"]

            # Get probabilities from both models
            rf_proba = rf_model.predict_proba(skills_array)[0]
            xgb_proba = xgb_model.predict_proba(skills_array)[0]

            # Weighted ensemble (Random Forest gets more weight)
            ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba

            # Get top N predictions
            top_indices = ensemble_proba.argsort()[-top_n:][::-1]
            predictions = []

            for rank, idx in enumerate(top_indices, 1):
                career_name = label_encoder.inverse_transform([idx])[0]
                confidence = ensemble_proba[idx]
                skill_analysis = self.analyze_skills(skills_array[0])

                predictions.append({
                    "rank": int(rank),
                    "career": str(career_name),
                    "confidence": float(round(confidence, 4)),
                    "confidence_percentage": float(round(confidence * 100, 1)),
                    "matching_skills": skill_analysis["strong"],
                    "growth_areas": skill_analysis["weak"],
                    "skill_gaps": skill_analysis["missing"],
                    "career_readiness": self.calculate_readiness(skills_array[0])
                })

            return predictions
            
        except Exception as e:
            self.log_error(f"Prediction calculation failed: {str(e)}")
            raise

    def analyze_skills(self, skills_array):
        """Analyze strong, weak, and missing skills"""
        try:
            skill_scores = dict(zip(self.skills, skills_array))
            strong, weak, missing = [], [], []

            for skill, score in skill_scores.items():
                score = int(score)
                if score >= 4:
                    strong.append({"skill": skill, "level": score})
                elif score == 1:
                    weak.append({"skill": skill, "level": score})
                elif score == 0:
                    missing.append({"skill": skill, "level": score})

            return {
                "strong": strong[:5],
                "weak": weak[:5],
                "missing": missing[:5]
            }
            
        except Exception as e:
            self.log_error(f"Skill analysis failed: {str(e)}")
            return {"strong": [], "weak": [], "missing": []}

    def calculate_readiness(self, skills_array):
        """Calculate career readiness score"""
        try:
            total = len(skills_array)
            skilled_count = sum(1 for s in skills_array if s >= 3)
            readiness = (skilled_count / total) * 100 if total > 0 else 0

            if readiness >= 70:
                level = "High"
            elif readiness >= 50:
                level = "Medium"
            elif readiness >= 30:
                level = "Basic"
            else:
                level = "Beginner"

            return {
                "percentage": float(round(readiness, 1)),
                "level": level,
                "skilled_areas": int(skilled_count),
                "total_areas": int(total)
            }
            
        except Exception as e:
            self.log_error(f"Readiness calculation failed: {str(e)}")
            return {"percentage": 0.0, "level": "Beginner", "skilled_areas": 0, "total_areas": 28}

    def get_skills_summary(self, skills_array):
        """Return skill levels distribution"""
        try:
            total = len(skills_array)
            return {
                "total_skills": int(total),
                "expert": int(sum(1 for s in skills_array if s == 5)),
                "advanced": int(sum(1 for s in skills_array if s == 4)),
                "intermediate": int(sum(1 for s in skills_array if s == 3)),
                "basic": int(sum(1 for s in skills_array if s == 2)),
                "beginner": int(sum(1 for s in skills_array if s == 1)),
                "none": int(sum(1 for s in skills_array if s == 0)),
                "overall_score": float(round(sum(skills_array) / (total * 5) * 100, 1)) if total > 0 else 0.0
            }
            
        except Exception as e:
            self.log_error(f"Skills summary calculation failed: {str(e)}")
            return {"total_skills": 28, "expert": 0, "advanced": 0, "intermediate": 0, "basic": 0, "beginner": 0, "none": 28, "overall_score": 0.0}

def main():
    """Entry point for Node.js"""
    try:
        # Read input from stdin
        raw_input = sys.stdin.read().strip()
        
        if not raw_input:
            print(json.dumps({"status": "error", "message": "No input data provided"}))
            return

        # Parse JSON input
        try:
            input_data = json.loads(raw_input)
        except json.JSONDecodeError as e:
            print(json.dumps({"status": "error", "message": f"Invalid JSON input: {str(e)}"}))
            return

        # Initialize predictor
        predictor = NodeJSCareerPredictor()
        
        # Load model
        model_path = input_data.get("model_path", "career_prediction_model.pkl")
        if not predictor.load_model(model_path):
            print(json.dumps({"status": "error", "message": "Model loading failed"}))
            return

        # Get prediction parameters
        skills_data = input_data.get("skills", [])
        top_n = input_data.get("top_predictions", 3)

        if not skills_data:
            print(json.dumps({"status": "error", "message": "No skills data provided"}))
            return

        # Make prediction
        result = predictor.predict_career_from_nodejs(skills_data, top_n)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))

    except Exception as e:
        error_result = {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()