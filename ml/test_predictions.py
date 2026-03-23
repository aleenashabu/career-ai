import joblib
import numpy as np
import json
import sys
import os

class CareerPredictor:
    def __init__(self):
        self.model_data = None
        self.skills = []
        self.careers = []
    
    def load_model(self, filepath="career_prediction_model.pkl"):
        """Load trained model"""
        if not os.path.exists(filepath):
            print(f"Error: Model file '{filepath}' not found!")
            print("Please run train_model.py first to train the model.")
            sys.exit(1)
        
        print(f"Loading model from: {filepath}")
        self.model_data = joblib.load(filepath)
        self.skills = self.model_data['skills']
        self.careers = self.model_data['careers']
        
        print(f"Model loaded successfully!")
        print(f"Skills: {len(self.skills)}")
        print(f"Careers: {len(self.careers)}")
        
        return self.model_data
    
    def predict_career(self, skills_array, top_n=3):
        """Predict career paths for given skills"""
        if len(skills_array) != len(self.skills):
            raise ValueError(f"Expected {len(self.skills)} skills, got {len(skills_array)}")
        
        skills_array = np.array(skills_array).reshape(1, -1)
        
        # Get predictions from both models
        rf_model = self.model_data['rf_model']
        xgb_model = self.model_data['xgb_model']
        label_encoder = self.model_data['label_encoder']
        
        rf_proba = rf_model.predict_proba(skills_array)[0]
        xgb_proba = xgb_model.predict_proba(skills_array)[0]
        
        # Ensemble prediction (weighted average)
        ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
        
        # Get top N predictions
        top_indices = ensemble_proba.argsort()[-top_n:][::-1]
        
        predictions = []
        for idx in top_indices:
            career_name = label_encoder.inverse_transform([idx])[0]
            confidence = ensemble_proba[idx]
            
            # Get relevant skills analysis
            relevant_skills = self.analyze_skills_for_career(skills_array[0], career_name)
            
            predictions.append({
                'career': career_name,
                'confidence': float(confidence),
                'confidence_percentage': f"{confidence * 100:.1f}%",
                'matching_skills': relevant_skills['strong'],
                'growth_areas': relevant_skills['improvement_needed']
            })
        
        return predictions
    
    def analyze_skills_for_career(self, skills_array, career_name):
        """Analyze skills relevance for specific career"""
        skill_scores = dict(zip(self.skills, skills_array))
        
        # Categorize skills by rating
        strong_skills = []
        medium_skills = []
        weak_skills = []
        
        for skill, score in skill_scores.items():
            if score >= 4:
                strong_skills.append(f"{skill} ({score}/5)")
            elif score >= 2:
                medium_skills.append(f"{skill} ({score}/5)")
            else:
                weak_skills.append(f"{skill} ({score}/5)")
        
        return {
            'strong': strong_skills[:5],  # Top 5 strong skills
            'medium': medium_skills[:3],  # Top 3 medium skills
            'improvement_needed': weak_skills[:5]  # Top 5 skills to improve
        }
    
    def print_prediction_results(self, predictions, skills_input=None):
        """Print formatted prediction results"""
        print("\n" + "="*60)
        print("CAREER PREDICTION RESULTS")
        print("="*60)
        
        if skills_input:
            print("Input Skills Summary:")
            skill_summary = {}
            for i, skill in enumerate(self.skills):
                rating = skills_input[i]
                if rating > 0:
                    if rating not in skill_summary:
                        skill_summary[rating] = []
                    skill_summary[rating].append(skill)
            
            for rating in sorted(skill_summary.keys(), reverse=True):
                print(f"  Level {rating}: {len(skill_summary[rating])} skills")
                if rating >= 3:
                    print(f"    {', '.join(skill_summary[rating][:3])}")
            print()
        
        for i, pred in enumerate(predictions, 1):
            print(f"{i}. {pred['career']}")
            print(f"   Confidence: {pred['confidence_percentage']}")
            
            if pred['matching_skills']:
                print(f"   Strong Skills: {', '.join(pred['matching_skills'][:3])}")
            
            if pred['growth_areas']:
                print(f"   Growth Areas: {', '.join([area.split(' (')[0] for area in pred['growth_areas'][:3]])}")
            print()

def create_test_samples():
    """Create sample test cases"""
    skills_list = [
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
    
    test_cases = {
        "Web Developer Profile": [
            2, 1, 3, 3, 5,  # C, C++, Java, Python, JavaScript
            3, 5, 5, 4, 2,  # DSA, HTML/CSS, React, Node, Mobile
            4, 3, 1, 0, 0,  # SQL, MongoDB, ML, Deep Learning, NLP
            0, 0, 0, 2, 1,  # LLM, Chatbot, Computer Vision, Data Analysis, Data Viz
            1, 2, 1, 2, 2,  # Statistics, Cloud, Big Data, OS, Networks
            1, 3, 2        # Security, PM, DevOps
        ],
        
        "Data Scientist Profile": [
            1, 1, 2, 5, 2,  # C, C++, Java, Python, JavaScript
            3, 1, 1, 1, 0,  # DSA, HTML/CSS, React, Node, Mobile
            4, 2, 5, 4, 3,  # SQL, MongoDB, ML, Deep Learning, NLP
            2, 1, 3, 5, 5,  # LLM, Chatbot, Computer Vision, Data Analysis, Data Viz
            5, 3, 4, 1, 1,  # Statistics, Cloud, Big Data, OS, Networks
            1, 2, 2        # Security, PM, DevOps
        ],
        
        "Mobile Developer Profile": [
            2, 3, 5, 4, 4,  # C, C++, Java, Python, JavaScript
            4, 3, 4, 2, 5,  # DSA, HTML/CSS, React, Node, Mobile
            3, 2, 1, 0, 0,  # SQL, MongoDB, ML, Deep Learning, NLP
            0, 0, 0, 1, 1,  # LLM, Chatbot, Computer Vision, Data Analysis, Data Viz
            1, 3, 0, 2, 2,  # Statistics, Cloud, Big Data, OS, Networks
            1, 3, 2        # Security, PM, DevOps
        ],
        
        "Cybersecurity Analyst Profile": [
            4, 3, 3, 4, 2,  # C, C++, Java, Python, JavaScript
            3, 1, 1, 1, 0,  # DSA, HTML/CSS, React, Node, Mobile
            2, 1, 1, 0, 0,  # SQL, MongoDB, ML, Deep Learning, NLP
            0, 0, 0, 2, 1,  # LLM, Chatbot, Computer Vision, Data Analysis, Data Viz
            2, 3, 1, 5, 5,  # Statistics, Cloud, Big Data, OS, Networks
            5, 3, 3        # Security, PM, DevOps
        ],
        
        "DevOps Engineer Profile": [
            2, 1, 3, 5, 2,  # C, C++, Java, Python, JavaScript
            2, 1, 1, 2, 1,  # DSA, HTML/CSS, React, Node, Mobile
            4, 3, 0, 0, 0,  # SQL, MongoDB, ML, Deep Learning, NLP
            0, 0, 0, 1, 1,  # LLM, Chatbot, Computer Vision, Data Analysis, Data Viz
            1, 5, 2, 4, 4,  # Statistics, Cloud, Big Data, OS, Networks
            3, 4, 5        # Security, PM, DevOps
        ]
    }
    
    return test_cases, skills_list

def run_test_predictions():
    """Run test predictions on sample data"""
    print("="*60)
    print("TESTING CAREER PREDICTION MODEL")
    print("="*60)
    
    # Initialize predictor
    predictor = CareerPredictor()
    
    # Load model
    predictor.load_model()
    
    # Get test cases
    test_cases, skills_list = create_test_samples()
    
    # Run predictions for each test case
    for profile_name, skills_array in test_cases.items():
        print(f"\n{'='*60}")
        print(f"TESTING: {profile_name}")
        print('='*60)
        
        try:
            # Get predictions
            predictions = predictor.predict_career(skills_array, top_n=3)
            
            # Print results
            predictor.print_prediction_results(predictions, skills_array)
            
        except Exception as e:
            print(f"Error predicting for {profile_name}: {str(e)}")
    
    print("\n" + "="*60)
    print("TESTING COMPLETED!")
    print("="*60)

def predict_from_input(skills_input):
    """Predict career from input skills array"""
    predictor = CareerPredictor()
    predictor.load_model()
    
    try:
        predictions = predictor.predict_career(skills_input, top_n=3)
        predictor.print_prediction_results(predictions, skills_input)
        return predictions
    except Exception as e:
        print(f"Error making prediction: {str(e)}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--input":
            # Expect skills as comma-separated values
            if len(sys.argv) > 2:
                try:
                    skills_str = sys.argv[2]
                    skills_array = [int(x.strip()) for x in skills_str.split(',')]
                    predict_from_input(skills_array)
                except Exception as e:
                    print(f"Error parsing input: {str(e)}")
                    print("Usage: python test_predictions.py --input '1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4'")
            else:
                print("Usage: python test_predictions.py --input 'comma,separated,values'")
        else:
            print("Usage: python test_predictions.py [--input 'skills_array']")
    else:
        # Run default test cases
        run_test_predictions()