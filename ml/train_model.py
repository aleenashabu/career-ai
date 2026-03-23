import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
import joblib
import json
import sys
import os

class CareerModelTrainer:
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
        
        self.rf_model = None
        self.xgb_model = None
        self.label_encoder = None
        self.feature_importance = None
        self.model_metrics = {}
    
    def load_dataset(self, filepath="career_training_dataset.csv"):
        """Load dataset from CSV file"""
        if not os.path.exists(filepath):
            print(f"Error: Dataset file '{filepath}' not found!")
            print("Please run create_dataset.py first to generate the dataset.")
            sys.exit(1)
        
        df = pd.read_csv(filepath)
        print(f"Dataset loaded: {df.shape[0]} samples, {df.shape[1]-1} features")
        print(f"Careers in dataset: {df['Career'].nunique()}")
        return df
    
    def prepare_data(self, df):
        """Prepare features and target variables"""
        print("Preparing data for training...")
        
        # Separate features and target
        X = df[self.skills].values
        y = df['Career'].values
        
        # Encode target labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        
        print(f"Features shape: {X.shape}")
        print(f"Unique careers: {len(np.unique(y))}")
        print("Career labels:", list(self.label_encoder.classes_))
        
        return X, y_encoded
    
    def train_random_forest(self, X_train, y_train):
        """Train Random Forest model"""
        print("Training Random Forest model...")
        
        self.rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        )
        
        self.rf_model.fit(X_train, y_train)
        
        # Get feature importance
        self.feature_importance = dict(zip(self.skills, self.rf_model.feature_importances_))
        
        print("Random Forest training completed!")
        return self.rf_model
    
    def train_xgboost(self, X_train, y_train):
        """Train XGBoost model"""
        print("Training XGBoost model...")
        
        self.xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='mlogloss'
        )
        
        self.xgb_model.fit(X_train, y_train)
        
        print("XGBoost training completed!")
        return self.xgb_model
    
    def evaluate_models(self, X_test, y_test):
        """Evaluate both models"""
        print("Evaluating models...")
        
        # Random Forest predictions
        rf_pred = self.rf_model.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        
        # XGBoost predictions
        xgb_pred = self.xgb_model.predict(X_test)
        xgb_accuracy = accuracy_score(y_test, xgb_pred)
        
        # Ensemble prediction (weighted average of probabilities)
        rf_proba = self.rf_model.predict_proba(X_test)
        xgb_proba = self.xgb_model.predict_proba(X_test)
        ensemble_proba = 0.6 * rf_proba + 0.4 * xgb_proba
        ensemble_pred = np.argmax(ensemble_proba, axis=1)
        ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
        
        self.model_metrics = {
            'random_forest_accuracy': rf_accuracy,
            'xgboost_accuracy': xgb_accuracy,
            'ensemble_accuracy': ensemble_accuracy,
            'test_samples': len(y_test)
        }
        
        print(f"Random Forest Accuracy: {rf_accuracy:.4f}")
        print(f"XGBoost Accuracy: {xgb_accuracy:.4f}")
        print(f"Ensemble Accuracy: {ensemble_accuracy:.4f}")
        
        return self.model_metrics
    
    def save_models(self, filepath="career_prediction_model.pkl"):
        """Save all trained models and metadata"""
        print(f"Saving models to {filepath}...")
        
        model_data = {
            'rf_model': self.rf_model,
            'xgb_model': self.xgb_model,
            'label_encoder': self.label_encoder,
            'skills': self.skills,
            'feature_importance': self.feature_importance,
            'model_metrics': self.model_metrics,
            'careers': list(self.label_encoder.classes_)
        }
        
        joblib.dump(model_data, filepath)
        
        # Also save metadata as JSON for easy inspection
        metadata = {
            'skills': self.skills,
            'careers': list(self.label_encoder.classes_),
            'feature_importance': self.feature_importance,
            'model_metrics': self.model_metrics
        }
        
        json_filepath = filepath.replace('.pkl', '_metadata.json')
        with open(json_filepath, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Models saved to: {filepath}")
        print(f"Metadata saved to: {json_filepath}")
    
    def print_feature_importance(self, top_n=10):
        """Print top N most important features"""
        if self.feature_importance:
            print(f"\nTop {top_n} Most Important Skills:")
            sorted_features = sorted(self.feature_importance.items(), 
                                   key=lambda x: x[1], reverse=True)
            
            for i, (skill, importance) in enumerate(sorted_features[:top_n], 1):
                print(f"{i:2d}. {skill}: {importance:.4f}")
    
    def train_complete_pipeline(self, dataset_filepath="career_training_dataset.csv"):
        """Complete training pipeline"""
        print("="*60)
        print("CAREER PREDICTION MODEL TRAINING")
        print("="*60)
        
        # Load dataset
        df = self.load_dataset(dataset_filepath)
        
        # Prepare data
        X, y = self.prepare_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Testing samples: {len(X_test)}")
        
        # Train models
        self.train_random_forest(X_train, y_train)
        self.train_xgboost(X_train, y_train)
        
        # Evaluate models
        metrics = self.evaluate_models(X_test, y_test)
        
        # Save models
        self.save_models()
        
        # Print feature importance
        self.print_feature_importance()
        
        print("\n" + "="*60)
        print("MODEL TRAINING COMPLETED!")
        print("="*60)
        print("Files created:")
        print("  - career_prediction_model.pkl (trained models)")
        print("  - career_prediction_model_metadata.json (model info)")
        print("\nNext step: Run test_predictions.py to test the model")
        
        return metrics

if __name__ == "__main__":
    trainer = CareerModelTrainer()
    
    # Get dataset filepath from command line argument
    dataset_file = sys.argv[1] if len(sys.argv) > 1 else "career_training_dataset.csv"
    
    # Train the complete pipeline
    trainer.train_complete_pipeline(dataset_file)