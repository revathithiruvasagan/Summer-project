import matplotlib
matplotlib.use('Agg')  # Ensure Matplotlib uses a non-GUI backend
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file, render_template
import joblib
import numpy as np
import pandas as pd
import io
import os

app = Flask(__name__)

# Load the trained DecisionTreeRegressor model and scaler from Joblib files
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, '..', 'data')

# Paths to the model, scaler, and CSV file
model_path = os.path.join(data_dir, 'decision_tree_model.joblib')
scaler_path = os.path.join(data_dir, 'scaler.joblib')
csv_path = os.path.join(data_dir, 'GCB2022v27_MtCO2_flat(1)(5).csv')

# Ensure the model, scaler, and CSV files exist
if not os.path.exists(model_path) or not os.path.exists(scaler_path):
    raise FileNotFoundError("Model or scaler file not found")
if not os.path.exists(csv_path):
    raise FileNotFoundError("CSV file not found")

# Load the trained model and scaler
#dt_reg = joblib.load(model_path)
#scaler = joblib.load(scaler_path
dt_reg = joblib.load(model_path)
scaler = joblib.load(scaler_path)

# Load your dataset
#co2 = pd.read_csv('GCB2022v27_MtCO2_flat(1)(5).csv')
co2 = pd.read_csv(csv_path)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    input_data = np.array(data['input']).reshape(1, -1)
    input_data_scaled = scaler.transform(input_data)
    prediction = dt_reg.predict(input_data_scaled)
    return jsonify({'prediction': prediction[0]})

@app.route('/plot', methods=['GET'])
def plot():
    country = request.args.get('country')
    if not country:
        return jsonify({'error': 'Country parameter is required'}), 400
    
    df = co2[co2['Country'] == country]
    
    if df.empty:
        return jsonify({'error': 'No data available for the specified country'}), 404
    
    plt.figure(figsize=(16,10))
    plt.plot(df['Year'], df['Total'], color='red')
    plt.ylabel('Total Emission')
    plt.title(f'Emission Progression in {country} from {df["Year"].min()}-{df["Year"].max()}')

    # Save the plot to a BytesIO object and return it
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png', download_name='plot.png')

@app.route('/top10plot', methods=['GET'])
def top10plot():
    # Filter the DataFrame for the top 10 countries
    df = co2[co2['Country'].isin(['USA', 'China', 'Russia', 'Germany', 'United Kingdom', 'Japan', 'International Transport', 'India', 'France', 'Nigeria'])]
    grouped = df.groupby("Country")

    # Create a plot
    plt.figure(figsize=(20, 16))
    
    for name, group in grouped:
        plt.plot(group['Year'], group['Total'], label=name)
    
    plt.title('Total by Country and Year')
    plt.xlabel('Year')
    plt.ylabel('Total')
    plt.legend()
    
    # Save the plot to a BytesIO object and return it
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png', download_name='top10plot.png')


if __name__ == "__main__":
    app.run(debug=True)
