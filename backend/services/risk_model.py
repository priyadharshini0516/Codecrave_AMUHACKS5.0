import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
import os

MODEL_PATH = "risk_model.pkl"

class RiskModel:
    def __init__(self):
        self.model = None
        self._is_trained = False
        self.load_or_train()

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self._is_trained = True
                print("Risk model loaded from disk.")
            except Exception as e:
                print(f"Error loading model: {e}. Training new one.")
                self._initialize_default_model()
        else:
            self._initialize_default_model()

    def _initialize_default_model(self):
        # Features: [completion_pct, days_left, missed_tasks_ratio, stress_level, consistency_score]
        # X: 0.0-1.0, 1-100, 0.0-1.0, 1-10, 0.0-1.0
        # y: 0 (Low), 1 (Moderate), 2 (High)
        
        data = [
            [0.9, 60, 0.1, 2, 0.9, 0], # Low risk
            [0.7, 30, 0.3, 5, 0.7, 1], # Moderate risk
            [0.3, 5, 0.8, 9, 0.3, 2],  # High risk
            [0.8, 45, 0.2, 3, 0.8, 0], # Low risk
            [0.2, 2, 0.9, 8, 0.2, 2],  # High risk
            [0.6, 20, 0.5, 6, 0.6, 1], # Moderate risk
            [0.5, 15, 0.4, 7, 0.5, 1], # Moderate risk
            [0.95, 90, 0.05, 1, 0.95, 0] # Low risk
        ]
        
        columns = ['completion', 'days', 'missed_ratio', 'stress', 'consistency', 'risk']
        df = pd.DataFrame(data, columns=columns)
        X = df.drop('risk', axis=1)
        y = df['risk']
        
        # Logistic Regression (Multi-class)
        self.model = LogisticRegression(multi_class='ovr', max_iter=1000)
        self.model.fit(X, y)
        self._is_trained = True
        
        # Save model
        joblib.dump(self.model, MODEL_PATH)
        print("Initial risk model trained and saved to disk.")

    def predict_risk(self, data):
        """
        Expects a dict with:
        - completion_percentage (0.0 - 1.0)
        - days_remaining (int)
        - missed_tasks_ratio (0.0 - 1.0)
        - stress_level (1 - 10)
        - consistency_score (0.0 - 1.0)
        """
        features_df = pd.DataFrame([[
            data.get('completion_percentage', 0.5),
            data.get('days_remaining', 30),
            data.get('missed_tasks_ratio', 0.5),
            data.get('stress_level', 5),
            data.get('consistency_score', 0.5)
        ]], columns=['completion', 'days', 'missed_ratio', 'stress', 'consistency'])
        
        risk_map = {0: 'Low', 1: 'Moderate', 2: 'High'}
        
        prediction = self.model.predict(features_df)[0]
        # Get probability for the predicted class
        probabilities = self.model.predict_proba(features_df)[0]
        confidence = float(np.max(probabilities))
        
        # For a single score 0-1, we can use a weighted average of probabilities 
        # or simply treat the probability of 'High' risk as the indicator
        # But user requested classification by 0-0.4, 0.4-0.7, 0.7-1
        # Let's derive a probability score based on the risk levels
        if prediction == 0: # Low
            prob_score = confidence * 0.4
        elif prediction == 1: # Moderate
            prob_score = 0.4 + (confidence * 0.3)
        else: # High
            prob_score = 0.7 + (confidence * 0.3)
            
        return {
            'risk_level': risk_map[prediction],
            'probability_score': round(prob_score, 2),
            'confidence': round(confidence, 2),
            'raw_score': int(prediction)
        }

# Singleton instance
risk_model = RiskModel()

def get_risk_assessment(user_data):
    return risk_model.predict_risk(user_data)
