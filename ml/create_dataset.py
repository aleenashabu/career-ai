import pandas as pd
import numpy as np
import json
import sys

class CareerDatasetGenerator:
    def __init__(self):
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
        
        # Define realistic career-skill patterns
        self.career_patterns = {
            "Full Stack Web Developer": {
                "essential": ["HTML/CSS", "JavaScript", "React.js", "Node.js / Express.js", "Database Management (SQL)"],
                "important": ["Python", "Database Management (MongoDB)", "Software Engineering & Project Management"],
                "helpful": ["DevOps & CI/CD (Docker, Kubernetes)", "Cloud Computing (AWS/Azure/GCP)"],
                "unlikely": ["Machine Learning Fundamentals", "Deep Learning", "Computer Vision", "Big Data Tools (Hadoop, Spark)"]
            },
            
            "Data Scientist": {
                "essential": ["Python", "Machine Learning Fundamentals", "Data Analysis (Pandas, NumPy, Excel)", 
                            "Statistics & Probability", "Data Visualization (Matplotlib, Seaborn, Power BI)"],
                "important": ["Deep Learning", "Big Data Tools (Hadoop, Spark)", "Cloud Computing (AWS/Azure/GCP)"],
                "helpful": ["Natural Language Processing", "Computer Vision", "Database Management (SQL)"],
                "unlikely": ["HTML/CSS", "React.js", "Mobile App Development (Flutter/React Native)", "DevOps & CI/CD (Docker, Kubernetes)"]
            },
            
            "Mobile App Developer": {
                "essential": ["Mobile App Development (Flutter/React Native)", "Java", "JavaScript"],
                "important": ["Python", "Database Management (SQL)", "React.js"],
                "helpful": ["HTML/CSS", "Node.js / Express.js", "Cloud Computing (AWS/Azure/GCP)"],
                "unlikely": ["Machine Learning Fundamentals", "Big Data Tools (Hadoop, Spark)", "Deep Learning"]
            },
            
            "Machine Learning Engineer": {
                "essential": ["Python", "Machine Learning Fundamentals", "Deep Learning", "Statistics & Probability"],
                "important": ["Cloud Computing (AWS/Azure/GCP)", "Big Data Tools (Hadoop, Spark)", "Data Analysis (Pandas, NumPy, Excel)"],
                "helpful": ["Natural Language Processing", "Computer Vision", "DevOps & CI/CD (Docker, Kubernetes)"],
                "unlikely": ["HTML/CSS", "Mobile App Development (Flutter/React Native)", "React.js"]
            },
            
            "Frontend Developer": {
                "essential": ["HTML/CSS", "JavaScript", "React.js"],
                "important": ["Node.js / Express.js", "Mobile App Development (Flutter/React Native)"],
                "helpful": ["Python", "Database Management (SQL)", "Software Engineering & Project Management"],
                "unlikely": ["Machine Learning Fundamentals", "Big Data Tools (Hadoop, Spark)", "Deep Learning"]
            },
            
            "Backend Developer": {
                "essential": ["Python", "Java", "Node.js / Express.js", "Database Management (SQL)"],
                "important": ["Cloud Computing (AWS/Azure/GCP)", "DevOps & CI/CD (Docker, Kubernetes)", "Database Management (MongoDB)"],
                "helpful": ["Operating Systems", "Computer Networks", "Software Engineering & Project Management"],
                "unlikely": ["HTML/CSS", "React.js", "Computer Vision", "Data Visualization (Matplotlib, Seaborn, Power BI)"]
            },
            
            "Cybersecurity Analyst": {
                "essential": ["Cybersecurity", "Computer Networks", "Operating Systems"],
                "important": ["Python", "C Programming", "Cloud Computing (AWS/Azure/GCP)"],
                "helpful": ["Java", "Database Management (SQL)", "Software Engineering & Project Management"],
                "unlikely": ["React.js", "Mobile App Development (Flutter/React Native)", "Data Visualization (Matplotlib, Seaborn, Power BI)"]
            },
            
            "DevOps Engineer": {
                "essential": ["DevOps & CI/CD (Docker, Kubernetes)", "Cloud Computing (AWS/Azure/GCP)", "Operating Systems"],
                "important": ["Python", "Database Management (SQL)", "Computer Networks"],
                "helpful": ["Java", "Software Engineering & Project Management", "Cybersecurity"],
                "unlikely": ["React.js", "Machine Learning Fundamentals", "Data Visualization (Matplotlib, Seaborn, Power BI)"]
            },
            
            "Cloud Solutions Architect": {
                "essential": ["Cloud Computing (AWS/Azure/GCP)", "DevOps & CI/CD (Docker, Kubernetes)", "Operating Systems"],
                "important": ["Python", "Database Management (SQL)", "Computer Networks"],
                "helpful": ["Java", "Cybersecurity", "Software Engineering & Project Management"],
                "unlikely": ["HTML/CSS", "React.js", "Machine Learning Fundamentals"]
            },
            
            "AI/ML Researcher": {
                "essential": ["Machine Learning Fundamentals", "Deep Learning", "Natural Language Processing", 
                            "Computer Vision", "Python"],
                "important": ["Statistics & Probability", "Large Language Models (ChatGPT/LLaMA)", "Big Data Tools (Hadoop, Spark)"],
                "helpful": ["Data Analysis (Pandas, NumPy, Excel)", "Cloud Computing (AWS/Azure/GCP)"],
                "unlikely": ["HTML/CSS", "Mobile App Development (Flutter/React Native)", "DevOps & CI/CD (Docker, Kubernetes)"]
            },
            
            "Data Analyst": {
                "essential": ["Data Analysis (Pandas, NumPy, Excel)", "Statistics & Probability", 
                            "Data Visualization (Matplotlib, Seaborn, Power BI)"],
                "important": ["Python", "Database Management (SQL)", "Machine Learning Fundamentals"],
                "helpful": ["Cloud Computing (AWS/Azure/GCP)", "Big Data Tools (Hadoop, Spark)"],
                "unlikely": ["HTML/CSS", "React.js", "Mobile App Development (Flutter/React Native)"]
            },
            
            "Database Administrator": {
                "essential": ["Database Management (SQL)", "Database Management (MongoDB)", "Operating Systems"],
                "important": ["Python", "Cloud Computing (AWS/Azure/GCP)", "Computer Networks"],
                "helpful": ["Java", "Cybersecurity", "DevOps & CI/CD (Docker, Kubernetes)"],
                "unlikely": ["HTML/CSS", "React.js", "Machine Learning Fundamentals"]
            },
            
            "Software Engineer": {
                "essential": ["Java", "Python", "C++ Programming", "Data Structures & Algorithms"],
                "important": ["Software Engineering & Project Management", "Database Management (SQL)", "Operating Systems"],
                "helpful": ["Cloud Computing (AWS/Azure/GCP)", "DevOps & CI/CD (Docker, Kubernetes)"],
                "unlikely": ["HTML/CSS", "Data Visualization (Matplotlib, Seaborn, Power BI)", "Computer Vision"]
            },
            
            "System Administrator": {
                "essential": ["Operating Systems", "Computer Networks", "Cybersecurity"],
                "important": ["Python", "Cloud Computing (AWS/Azure/GCP)", "DevOps & CI/CD (Docker, Kubernetes)"],
                "helpful": ["Database Management (SQL)", "Software Engineering & Project Management"],
                "unlikely": ["HTML/CSS", "React.js", "Machine Learning Fundamentals"]
            },
            
            "Product Manager": {
                "essential": ["Software Engineering & Project Management"],
                "important": ["Data Analysis (Pandas, NumPy, Excel)", "Data Visualization (Matplotlib, Seaborn, Power BI)"],
                "helpful": ["Python", "HTML/CSS", "Database Management (SQL)"],
                "unlikely": ["Deep Learning", "Computer Vision", "Big Data Tools (Hadoop, Spark)"]
            }
        }
    
    def generate_skill_rating(self, skill, category):
        """Generate realistic skill rating based on category"""
        if category == "essential":
            return np.random.choice([3, 4, 5], p=[0.1, 0.4, 0.5])
        elif category == "important":
            return np.random.choice([2, 3, 4], p=[0.2, 0.5, 0.3])
        elif category == "helpful":
            return np.random.choice([0, 1, 2, 3], p=[0.2, 0.3, 0.3, 0.2])
        else:  # unlikely
            return np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
    
    def create_sample_for_career(self, career_name):
        """Create a single sample for a specific career"""
        pattern = self.career_patterns[career_name]
        sample = {}
        
        for skill in self.skills:
            if skill in pattern["essential"]:
                rating = self.generate_skill_rating(skill, "essential")
            elif skill in pattern["important"]:
                rating = self.generate_skill_rating(skill, "important")
            elif skill in pattern["helpful"]:
                rating = self.generate_skill_rating(skill, "helpful")
            else:
                rating = self.generate_skill_rating(skill, "unlikely")
            
            # Add some random noise (10% chance to modify by ±1)
            if np.random.random() < 0.1:
                rating = max(0, min(5, rating + np.random.choice([-1, 1])))
            
            sample[skill] = rating
        
        sample["Career"] = career_name
        return sample
    
    def generate_dataset(self, samples_per_career=150):
        """Generate complete dataset"""
        data = []
        
        print(f"Generating dataset with {samples_per_career} samples per career...")
        
        for career in self.career_patterns.keys():
            print(f"Creating samples for: {career}")
            for _ in range(samples_per_career):
                sample = self.create_sample_for_career(career)
                data.append(sample)
        
        df = pd.DataFrame(data)
        
        # Shuffle the dataset
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        print(f"Dataset created with {len(df)} total samples")
        print(f"Careers: {df['Career'].value_counts().to_dict()}")
        
        return df
    
    def save_dataset(self, df, filepath="career_dataset.csv"):
        # csv dataset comes from here
        """Save dataset to CSV file"""
        df.to_csv(filepath, index=False)
        print(f"Dataset saved to: {filepath}")
        
        # Also save as JSON for easy inspection
        json_filepath = filepath.replace('.csv', '.json')
        df.to_json(json_filepath, orient='records', indent=2)
        print(f"Dataset also saved as JSON to: {json_filepath}")
    
    def print_sample_analysis(self, df):
        """Print sample analysis of the dataset"""
        print("\n" + "="*50)
        print("DATASET ANALYSIS")
        print("="*50)
        
        print(f"Total samples: {len(df)}")
        print(f"Total features: {len(self.skills)}")
        print(f"Total careers: {df['Career'].nunique()}")
        
        print("\nCareer distribution:")
        career_counts = df['Career'].value_counts()
        for career, count in career_counts.items():
            print(f"  {career}: {count} samples")
        
        print("\nSample records:")
        for i, career in enumerate(df['Career'].unique()[:3]):
            sample = df[df['Career'] == career].iloc[0]
            print(f"\n{career} example:")
            high_skills = []
            for skill in self.skills:
                if sample[skill] >= 3:
                    high_skills.append(f"{skill}: {sample[skill]}")
            print(f"  Strong skills: {', '.join(high_skills[:5])}")

if __name__ == "__main__":
    # Create dataset generator
    generator = CareerDatasetGenerator()
    
    # Get number of samples per career from command line argument
    samples_per_career = int(sys.argv[1]) if len(sys.argv) > 1 else 150
    
    # Generate dataset
    df = generator.generate_dataset(samples_per_career=samples_per_career)
    
    # Save dataset
    generator.save_dataset(df, "career_training_dataset.csv")
    
    # Print analysis
    generator.print_sample_analysis(df)
    
    print("\n" + "="*50)
    print("DATASET CREATION COMPLETED!")
    print("="*50)
    print("Files created:")
    print("  - career_training_dataset.csv")
    print("  - career_training_dataset.json")
    print("\nNext step: Run train_model.py to train the ML model")