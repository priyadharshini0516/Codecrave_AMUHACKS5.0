from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pandas as pd

class RiskModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self._is_trained = False
        self._initialize_dummy_model()

    def _initialize_dummy_model(self):
        # Create some synthetic training data
        # Features: [backlog_ratio, stress_level, completion_rate, days_left]
        # X: 0.0 - 1.0, 1-10, 0.0-1.0, 1-100
        
        data = [
            [0.1, 2, 0.9, 60, 0], # Low risk
            [0.4, 5, 0.7, 30, 1], # Medium risk
            [0.8, 9, 0.3, 5, 2],  # High risk
            [0.2, 3, 0.8, 45, 0], # Low risk
            [0.9, 8, 0.2, 2, 2],  # High risk
            [0.5, 6, 0.6, 20, 1]  # Medium risk
        ]
        
        df = pd.DataFrame(data, columns=['backlog', 'stress', 'completion', 'days', 'risk'])
        X = df[['backlog', 'stress', 'completion', 'days']]
        y = df['risk']
        
        self.model.fit(X, y)
        self._is_trained = True

    def predict_risk(self, data):
        """
        Expects a dict with: backlog_ratio, stress_level, completion_rate, days_remaining
        Returns risk level and probability.
        """
        features_df = pd.DataFrame([[
            data.get('backlog_ratio', 0.5),
            data.get('stress_level', 5),
            data.get('completion_rate', 0.5),
            data.get('days_remaining', 30)
        ]], columns=['backlog', 'stress', 'completion', 'days'])
        
        risk_map = {0: 'Low', 1: 'Moderate', 2: 'High'}
        
        prediction = self.model.predict(features_df)[0]
        probabilities = self.model.predict_proba(features_df)[0]
        
        return {
            'risk_level': risk_map[prediction],
            'confidence': float(np.max(probabilities)),
            'raw_score': int(prediction) # 0, 1, or 2
        }

# Singleton instance
risk_model = RiskModel()

def get_risk_assessment(user_data):
    return risk_model.predict_risk(user_data)
