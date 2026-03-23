import joblib
import numpy as np
import json
import sys
import os

class NodeJSCareerPredictor:
    def __init__(self):
        self.model_data = None
        self.skills = []
    
    def load_model(self, model_path="career_prediction_model.pkl"):
        """Load the trained model"""
        try:
            self.model_data = joblib.load(model_path)
            self.skills = self.model_data['skills']
            return True
        except Exception as e:
            return False
    
    def predict_career_from_nodejs(self, skills_data, top_n=3):
        """
        Predict career from Node.js formatted data
        Expected input: [{'C Programming': 3}, {'Python': 4}, {'HTML/CSS': 5}, ...]
        """
        try:
            # Convert Node.js format to skills array
            skills_array = self.convert_nodejs_format(skills_data)
            
            if skills_array is None:
                return {
                    "status": "error",
                    "message": "Invalid skills data format"
                }
            
            # Make predictions
            predictions = self.predict_career(skills_array, top_n)
            
            return {
                "status": "success",
                "predictions": predictions,
                "total_skills_evaluated": len(skills_array),
                "skills_summary": self.get_skills_summary(skills_array)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def convert_nodejs_format(self, skills_data):
        """
        Convert Node.js format to numpy array
        Input: [{'C Programming': 3}, {'Python': 4}, ...]
        Output: [3, 4, 5, ...] in correct order
        """
        try:
            # Create a mapping of skill name to value
            skill_values = {}
            
            for skill_dict in skills_data:
                for skill_name, value in skill_dict.items():
                    skill_values[skill_name] = int(value)
            
            # Create array in the correct order
            skills_array = []
            for skill in self.skills:
                if skill in skill_values:
                    skills_array.append(skill_values[skill])
                else:
                    skills_array.append(0)  # Default to 0 if skill not provided
            
            return skills_array
            
        except Exception as e:
            print(f"Error converting format: {str(e)}", file=sys.stderr)
            return None
    
    def predict_career(self, skills_array, top_n=3):
        """Make career predictions"""
        skills_array = np.array(skills_array).reshape(1, -1)
        
        # Get models
        rf_model = self.model_data['rf_model']
        xgb_model = self.model_data['xgb_model']
        label_encoder = self.model_data['label_encoder']
        
        # Get probabilities from both models
        rf_proba = rf_model.predict_proba(skills_array)[0]
        xgb_proba = xgb_model.predict_proba(skills_array)[0]
        
        # Ensemble prediction
        ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
        
        # Get top N predictions
        top_indices = ensemble_proba.argsort()[-top_n:][::-1]
        
        predictions = []
        for rank, idx in enumerate(top_indices, 1):
            career_name = label_encoder.inverse_transform([idx])[0]
            confidence = ensemble_proba[idx]
            
            # Analyze skills for this career
            skill_analysis = self.analyze_skills_for_career(skills_array[0], career_name)
            
            predictions.append({
                'rank': rank,
                'career': career_name,
                'confidence': round(float(confidence), 4),
                'confidence_percentage': round(confidence * 100, 1),
                'matching_skills': skill_analysis['strong'],
                'growth_areas': skill_analysis['weak'],
                'skill_gaps': skill_analysis['missing'],
                'career_readiness': self.calculate_readiness(skills_array[0], career_name)
            })
        
        return predictions
    
    def analyze_skills_for_career(self, skills_array, career_name):
        """Analyze skills relevance for specific career"""
        skill_scores = dict(zip(self.skills, skills_array))
        
        strong_skills = []
        weak_skills = []
        missing_skills = []
        
        for skill, score in skill_scores.items():
            if score >= 4:
                strong_skills.append({
                    'skill': skill,
                    'level': score,
                    'status': 'strong'
                })
            elif score >= 2:
                # These are decent but could be improved
                pass
            elif score == 1:
                weak_skills.append({
                    'skill': skill,
                    'level': score,
                    'status': 'needs_improvement'
                })
            else:  # score == 0
                missing_skills.append({
                    'skill': skill,
                    'level': score,
                    'status': 'not_started'
                })
        
        return {
            'strong': strong_skills[:5],
            'weak': weak_skills[:5],
            'missing': missing_skills[:5]
        }
    
    def calculate_readiness(self, skills_array, career_name):
        """Calculate career readiness percentage"""
        total_skills = len(skills_array)
        skilled_count = sum(1 for score in skills_array if score >= 3)
        readiness = (skilled_count / total_skills) * 100
        
        if readiness >= 70:
            level = "High"
        elif readiness >= 50:
            level = "Medium"
        elif readiness >= 30:
            level = "Basic"
        else:
            level = "Beginner"
        
        return {
            'percentage': round(readiness, 1),
            'level': level,
            'skilled_areas': skilled_count,
            'total_areas': total_skills
        }
    
    def get_skills_summary(self, skills_array):
        """Get overall skills summary"""
        total = len(skills_array)
        expert = sum(1 for score in skills_array if score == 5)
        advanced = sum(1 for score in skills_array if score == 4)
        intermediate = sum(1 for score in skills_array if score == 3)
        basic = sum(1 for score in skills_array if score == 2)
        beginner = sum(1 for score in skills_array if score == 1)
        none = sum(1 for score in skills_array if score == 0)
        
        return {
            'total_skills': total,
            'expert_level': expert,
            'advanced_level': advanced,
            'intermediate_level': intermediate,
            'basic_level': basic,
            'beginner_level': beginner,
            'no_experience': none,
            'overall_score': round(sum(skills_array) / (total * 5) * 100, 1)
        }

def main():
    """Main function to handle Node.js integration"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "status": "error",
            "message": "No input data provided"
        }))
        return
    
    try:
        # Parse JSON input from Node.js
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        # Initialize predictor
        predictor = NodeJSCareerPredictor()
        
        # Load model
        model_path = input_data.get('model_path', 'career_prediction_model.pkl')
        if not predictor.load_model(model_path):
            print(json.dumps({
                "status": "error",
                "message": "Failed to load ML model"
            }))
            return
        
        # Get skills data
        skills_data = input_data.get('skills', [])
        top_n = input_data.get('top_predictions', 3)
        
        # Make prediction
        result = predictor.predict_career_from_nodejs(skills_data, top_n)
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({
            "status": "error",
            "message": "Invalid JSON input"
        }))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))

if __name__ == "__main__":
    main()