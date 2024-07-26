import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load your dataset and model here
df = pd.read_csv('Carbon Emission.csv')

categorical_columns = df.select_dtypes(include=['object']).columns
pure_label_encoded = df.copy()

label_encoder = LabelEncoder()
for column in categorical_columns:
    pure_label_encoded[column] = label_encoder.fit_transform(pure_label_encoded[column])

X = pure_label_encoded.drop('CarbonEmission', axis=1)
y = pure_label_encoded['CarbonEmission']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

xgb_model = xgb.XGBRegressor(objective='reg:squarederror', random_state=42)
xgb_model.fit(X, y)

@app.route('/')
def home():
    return "Carbon Emission Prediction API is running."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print('Received data:', data)
        
        
        # Convert received data to a list of values
        input_list = [
            data.get('What is your gender?'),
            data.get('What is your body type?'),
            data.get('What is your diet?'),
            data.get('How often do you shower?'),
            data.get('What is your heating energy source?'),
            data.get('What type of transport do you use?'),
            data.get('What type of vehicle do you drive?'),
            data.get('How often do you engage in social activities?'),
            float(data.get('What is your monthly grocery bill?')),
            float(data.get('How frequently do you travel by air?')),
            float(data.get("What is your vehicle's monthly distance (in km)?")),
            data.get('What is the size of your waste bag?'),
            int(data.get('How many waste bags do you use weekly?')),
            float(data.get('How many hours do you spend on TV/PC daily?')),
            int(data.get('How many new clothes do you buy monthly?')),
            float(data.get('How many hours do you spend on the Internet daily?')),
            data.get('Is your home energy-efficient?'),
            data.get('What do you primarily recycle?'),
            data.get('What do you primarily use for cooking?')
        ]
        
        # Ensure the input list matches the expected number of features
        if len(input_list) != 19:
            raise ValueError('Input data does not match the expected number of features.')
        
        print(input_list)

        # Convert list to NumPy array and reshape for prediction
        input_array = np.array(input_list).reshape(1, -1)
        
        # Predict using the loaded model
        prediction = xgb_model.predict(input_array)
        prediction_value = float(prediction[0])
        
        return jsonify({'prediction': prediction_value})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    test_input = [2, 0, 1, 0, 0, 1, 5, 1, 230, 0, 210, 1, 4, 7, 26, 1, 0, 2, 13]
    input_array = np.array(test_input).reshape(1, -1)
    try:
        prediction = xgb_model.predict(input_array)
        prediction_value = float(prediction[0])
        return jsonify({'prediction': prediction_value})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
