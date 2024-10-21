import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask import Flask, render_template, request, jsonify, session, send_file
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from models import db, User
import matplotlib
import logging
import psycopg2
import matplotlib.pyplot as plt
import joblib
import numpy as np
import pandas as pd
import io
import re
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import difflib
from datetime import datetime, timedelta
import random

matplotlib.use('Agg')  # Use 'Agg' backend for non-GUI environments

# Load environment variables

# Load environment variables
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key')

# Initialize extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app, supports_credentials=True)

# Function to connect to the PostgreSQL database
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="summerproject",
            user="postgres",
            password="remo&rt",  # Consider changing this to a password without special characters
            port="5432"
        )
        return conn
    except Exception as e:
        logging.error(f"Error connecting to the database: {e}")
        raise

# Route for the home page
@app.route("/")
def hello_world():
    return "Home!"

# User registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING user_id",
            (email, hashed_password)
        )
        conn.commit()
        user_id = cur.fetchone()[0]
    except Exception as e:
        conn.rollback()
        logging.error(f"Error during registration: {e}")
        return jsonify({"error": "Registration failed. Please try again."}), 400
    finally:
        cur.close()
        conn.close()

    access_token = create_access_token(identity=user_id)
    return jsonify(access_token=access_token), 201

# User login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT user_id, password FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and bcrypt.check_password_hash(user[1], password):
        access_token = create_access_token(identity=user[0])
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# Protected route example
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200


base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, '..', '..', 'data')
model_file_path = os.path.join(data_dir, 'decision_tree_model.joblib')
scaler_file_path = os.path.join(data_dir, 'scaler.joblib')
csv_file_path = os.path.join(data_dir, 'GCB2022v27_MtCO2_flat(1)(5).csv')

if not os.path.exists(model_file_path) or not os.path.exists(scaler_file_path):
    raise FileNotFoundError("Model or scaler file not found")
if not os.path.exists(csv_file_path):
    raise FileNotFoundError("CSV file not found")

model = joblib.load(model_file_path)
scaler = joblib.load(scaler_file_path)
data_frame = pd.read_csv(csv_file_path)

@app.route("/predict", methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        input_data = np.array(data['input']).reshape(1, -1)
        input_data_scaled = scaler.transform(input_data)
        prediction = model.predict(input_data_scaled)
        return jsonify({'prediction': prediction[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/plot", methods=['GET'])
def plot():
    country = request.args.get('country')
    if not country:
        return jsonify({'error': 'Country parameter is required'}), 400
    
    df1 = data_frame[data_frame['Country'] == country]
    
    if df1.empty:
        return jsonify({'error': 'No data available for the specified country'}), 404
    
    plt.figure(figsize=(16,10))
    plt.plot(df1['Year'], df1['Total'], color='red')
    plt.ylabel('Total Emission')
    plt.title(f'Emission Progression in {country} from {df1["Year"].min()}-{df1["Year"].max()}')
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png', download_name='plot.png')

@app.route("/top10plot", methods=['GET'])
def top10plot():
    df1 = data_frame[data_frame['Country'].isin(['USA', 'China', 'Russia', 'Germany', 'United Kingdom', 'Japan', 'International Transport', 'India', 'France', 'Nigeria'])]

    grouped = df1.groupby("Country")

    plt.figure(figsize=(20, 16))
    
    for name, group in grouped:
        plt.plot(group['Year'], group['Total'], label=name)
    
    plt.title('Total by Country and Year')
    plt.xlabel('Year')
    plt.ylabel('Total')
    plt.legend()
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()
    
    return send_file(img, mimetype='image/png', download_name='top10plot.png')




# Load dataset and model for individual prediction
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, '..', '..', 'data')
csv_path = os.path.join(data_dir, 'Carbon Emission.csv')

df = pd.read_csv(csv_path)
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

@app.route('/predictindividual', methods=['POST'])
def predictindividual():
    try:
        data = request.json
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
            data.get('recyclingValue'),
            data.get('cookingValue')
        ]

        if len(input_list) != 19:
            raise ValueError('Input data does not match the expected number of features.')

        input_array = np.array(input_list).reshape(1, -1)
        prediction = xgb_model.predict(input_array)
        prediction_value = float(prediction[0])

        return jsonify({'prediction': prediction_value})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Chatbot functionality
data = {
    "User Question": [
        'hi|hello|hey|howdy|greetings',
        'good morning|good afternoon|good evening',
        'what’s up|what’s new?',
        'hello there|hi there',
        'bye|goodbye|see you later|take care',
        'see you soon|catch you later',
        'have a good day|have a nice day',
        'until next time|talk to you later',
        'what is your name?',
        'who are you?',
        'how are you?|how are you doing?',
        'how’s it going?|what’s up?',
        'what’s new with you?',
        'reduce|carbon|footprint|home',
        'lower|CO2|emissions|traveling',
        'small|changes|eco-friendly',
        'sustainable|diet',
        'save|energy|home',
        'solar|energy|worth',
        'reduce|waste',
        'start|composting|home',
        'live|sustainably',
        'wardrobe|sustainable',
        'benefits|renewable|energy',
        'power|home|renewable|energy',
        'conserve|water|daily',
        'water|conservation|important',
        'avoid|single-use|plastics',
        'reduce|energy|bill|winter',
        'recycling|help|environment',
        'eco-friendly|commute',
        'reduce|food|waste|home',
        'alternatives|plastic|bags',
        'garden|eco-friendly',
        'reduce|electronic|waste',
        'reduce|water|garden',
        'home|energy-efficient',
        'sustainable|groceries',
        'reduce|carbon|footprint|eating|out',
        'eco-friendly|alternatives|paper|towels',
        'reduce|plastic|bathroom',
        'fast|fashion|impact',
        'cleaning|routine|eco-friendly',
        'meat|consumption|environment',
        'eco-friendly|gift|ideas',
        'reduce|environmental|impact|traveling',
        'benefits|second-hand|items',
        'reduce|energy|consumption|cooking',
        'support|local|businesses',
        'laundry|routine|eco-friendly',
        'reduce|paper|usage|work',
        'carbon|footprint|holidays',
        'benefits|locally|sourced|food',
        'reduce|environmental|impact|diet',
        'eco-friendly|home|decor',
        'water|usage|kitchen',
        'pet|care|sustainable',
        'plastic|usage|shopping',
        'plastic|pollution|impact',
        'environmental|impact|home|renovation',
        'sustainable|holidays',
        'environmental|impact|work',
        'eco-friendly|food|waste',
        'beauty|routine|sustainable',
        'reduce|water|usage',
        'zero|waste',
        'support|renewable|energy',
        'carbon|footprint|flying',
        'reduce|energy|summer',
        'deforestation|climate|change',
        'office|eco-friendly',
        'reduce|plastic|pollution',
        'reduce|emissions|car',
        'eco-friendly|cleaning|products',
        'outdoor|activities|sustainable',
        'food|production|environment',
        'benefits|less|plastic',
        'carbon|footprint|diet',
        'water|bathroom',
        'waste|events|parties',
        'home|decor|sustainable',
        'workplace|sustainable',
        'waste|impact',
        'carbon|footprint|winter',
        'alternatives|plastic|straws',
        'minimize|waste|grocery|shopping',
        'carpooling|environmental|benefits',
        'reduce|energy|night',
        'reusing|repurposing|benefits',
        'kitchen|eco-friendly',
        'packaging|waste|impact',
        'sustainable|gift-wrapping|ideas',
        'carbon|footprint|work',
        'conserve|energy|kitchen',
        'waste|holidays',
        'electronic|waste|impact',
        'minimize|waste|takeout',
        'eco-friendly|transportation',
        'reduce|water|outdoors',
        'sustainable|pet|care',
        'carbon|footprint|meals',
        'sustainable|travel',
        'waste|daily|routine',
        'public|transportation|benefits',
        'reduce|energy|home',
        'eco-friendly|cleaning',
        'waste|home|office',
        'sustainable|clothing',
        'environmental|impact|shopping',
        'single-use|plastics|impact',
        'diet|eco-friendly',
        'plant-based|diet|benefits',
        'energy|use|winter',
            # Scolding
    'you are not helpful|you are useless|this is frustrating',
    'i don’t like this|this is bad',
    'this is annoying|you’re bothering me',
    'you’re wrong|that’s not correct',

    # Appreciation
    'thank you|thanks|i appreciate your help',
    'you are great|this is helpful|i’m impressed',
    'i’m grateful for your assistance|this is fantastic',
    'thanks for the advice|i appreciate the information'    
    
    ],

    "Bot Answer": [
        'Hello! How can I assist you today?',
        'Good day! How can I help you?',
        'Not much, just here to help you with your carbon footprint!',
        'Hi! Ready to talk about reducing carbon emissions?',
        'Goodbye! Remember, every small change counts.',
        'See you later! Keep up the great work on reducing your carbon footprint.',
        'Have a fantastic day! Remember, every eco-friendly choice makes a difference.',
        'Until next time! Feel free to reach out if you have more questions.',
        'I’m an eco-friendly bot here to help you reduce your carbon footprint!',
        'I’m your friendly eco-bot here to help you go green!',
        'I’m just a program, but I’m here and ready to help with your eco-friendly questions!',
        'I’m functioning well, thank you! How can I assist you with your environmental goals?',
        'I’m constantly learning how to better assist you in reducing your carbon footprint.',
        "You can reduce your carbon footprint by using energy-efficient appliances, switching to LED bulbs, and unplugging devices when not in use.",
        "Consider using public transportation, biking, or carpooling to reduce CO2 emissions. For longer trips, opt for trains instead of planes if possible.",
        "Start by reducing single-use plastics, bringing reusable bags to the store, and choosing products with minimal packaging.",
        "Incorporate more plant-based meals into your diet, reduce food waste, and choose locally sourced, seasonal produce.",
        "Turn off lights when leaving a room, use programmable thermostats, and switch to energy-efficient appliances to save energy.",
        "Yes! Solar energy can significantly reduce your energy bills and decrease your reliance on fossil fuels, contributing to a cleaner environment.",
        "Recycle properly, compost organic waste, and avoid disposable products. Try to repurpose items instead of throwing them away.",
        "You can start composting by collecting kitchen scraps like vegetable peels and coffee grounds, and creating a compost bin in your backyard or using a composting service.",
        "Living sustainably means making choices that reduce your impact on the environment, like conserving resources, reducing waste, and supporting eco-friendly products.",
        "Choose clothing made from sustainable materials, buy second-hand or vintage, and take care of your clothes to make them last longer.",
        "Renewable energy sources like wind, solar, and hydroelectric power produce no direct greenhouse gas emissions, helping to combat climate change.",
        "Yes, with the right setup, like solar panels or a wind turbine, you can power your home entirely with renewable energy.",
        "Take shorter showers, fix leaky faucets, and use water-efficient appliances to conserve water.",
        "Water conservation is crucial because it helps protect our limited freshwater resources, reduces energy use, and supports the health of ecosystems.",
        "Think of single-use plastics as that friend who never returns your calls—time to cut ties and stick with reusable options!",
        "Snuggle up in a cozy sweater, sip some hot cocoa, and let your thermostat take a little break!",
        "Recycling reduces the need for raw materials, conserves energy, and decreases pollution, making it a crucial part of protecting our planet.",
        "Walking, biking, or using public transportation are great ways to reduce your carbon footprint during your daily commute.",
        "Plan your meals, store food properly, and get creative with leftovers to minimize food waste.",
        "Reusable cloth bags, paper bags, or biodegradable bags are excellent alternatives to plastic bags.",
        "Use organic fertilizers, compost, and rainwater for watering. Plant native species to support local wildlife.",
        "Donate or recycle old electronics, repair instead of replace, and choose devices with longer lifespans.",
        "Mulch your plants, use drip irrigation, and choose drought-tolerant plants to reduce water usage.",
        "Insulate your home, seal windows and doors, and install energy-efficient windows to improve energy efficiency.",
        "Buy in bulk, choose products with minimal packaging, and bring your own reusable bags and containers.",
        "Choose restaurants that focus on locally sourced, seasonal ingredients and offer plant-based options.",
        "Reusable cloth towels, sponges, and microfiber cloths are great eco-friendly alternatives to paper towels.",
        "Switch to bar soap, bamboo toothbrushes, and refillable shampoo and conditioner bottles.",
        "Fast fashion contributes to pollution, resource depletion, and waste, making it a significant environmental issue.",
        "Use natural cleaning products like vinegar and baking soda, and avoid single-use cleaning wipes.",
        "Reducing meat consumption lowers greenhouse gas emissions, conserves water, and reduces deforestation.",
        "Consider gifting experiences, reusable items, or handmade goods made from sustainable materials.",
        "Choose eco-friendly accommodations, reduce waste, and support local, sustainable businesses.",
        "Buying second-hand reduces waste, saves resources, and lowers the demand for new products.",
        "Use lids on pots, cook with residual heat, and opt for energy-efficient appliances like induction cooktops.",
        "Supporting local businesses helps stimulate the local economy, reduces transportation emissions, and fosters a sense of community.",
        "Wash full loads, use cold water, and air dry your clothes to reduce energy consumption during laundry.",
        "Go digital, print only when necessary, and use both sides of the paper to reduce paper usage at work.",
        "Opt for eco-friendly decorations, minimize waste, and give sustainable gifts to reduce your carbon footprint during the holidays.",
        "Eating locally sourced food reduces the carbon emissions associated with transportation and supports your local economy.",
        "Reduce meat consumption, avoid processed foods, and choose organic, locally grown produce to lower the environmental impact of your diet.",
        "Use energy-efficient lighting, furniture made from sustainable materials, and indoor plants to create an eco-friendly home décor.",
        "Install a water-efficient faucet, use a dishwasher instead of handwashing, and avoid running water unnecessarily to save water in the kitchen.",
        "Choose eco-friendly pet products, feed your pets sustainably sourced food, and clean up after them using biodegradable waste bags.",
        "Bring your own reusable bags, containers, and avoid products with excessive plastic packaging when shopping.",
        "Plastic pollution harms marine life, disrupts ecosystems, and contributes to the overall degradation of the environment.",
        "Choose sustainable materials, energy-efficient designs, and minimize waste to reduce the environmental impact of your home renovation.",
        "Celebrate holidays with eco-friendly decorations, reusable tableware, and by giving sustainably sourced gifts.",
        "Bring your own reusable containers, avoid single-use plastics, and recycle properly to reduce your environmental impact at work.",
        "Compost food scraps, donate excess food, and get creative with leftovers to handle food waste sustainably.",
        "Switch to natural, cruelty-free, and plastic-free beauty products, and minimize water usage during your beauty routine.",
        "Take shorter showers, fix leaks promptly, and use water-efficient appliances to reduce your overall water usage.",
        "Aim for zero waste by reducing, reusing, and recycling. Start by eliminating single-use plastics and opting for reusable alternatives.",
        "Support renewable energy by choosing a green energy provider, installing solar panels, or advocating for renewable energy policies.",
        "Flying has a significant carbon footprint. Consider offsetting your emissions, flying less, or choosing more eco-friendly travel options.",
        "Use fans instead of air conditioning, keep your blinds closed during the day, and opt for energy-efficient appliances to reduce summer energy use.",
        "Deforestation contributes to climate change by releasing stored carbon into the atmosphere and reducing the planet's capacity to absorb CO2.",
        "Encourage recycling, reduce paper usage, and choose energy-efficient equipment to make your office more eco-friendly.",
        "Reduce plastic pollution by recycling properly, avoiding single-use plastics, and supporting initiatives that tackle plastic waste.",
        "Regularly maintain your car, drive efficiently, and consider switching to an electric vehicle to reduce emissions from your car.",
        "Use natural, biodegradable cleaning products, and avoid those with harsh chemicals to make your cleaning routine more eco-friendly.",
        "Bring reusable water bottles, minimize waste, and stick to marked trails to ensure your outdoor activities are sustainable.",
        "Food production affects the environment through greenhouse gas emissions, water use, and deforestation. Opt for plant-based, organic, and local foods.",
        "Using less plastic helps reduce pollution, conserve resources, and protect wildlife from the dangers of plastic waste.",
        "Consider plant-based meals, reduce meat consumption, and avoid processed foods to lower the carbon footprint of your diet.",
        "Install low-flow showerheads, fix leaks, and take shorter showers to use less water in the bathroom.",
        "Use reusable tableware, offer digital invitations, and plan portion sizes carefully to reduce waste during events and parties.",
        "Choose home décor made from sustainable materials, support local artisans, and opt for second-hand or vintage items.",
        "Implement recycling programs, reduce paper usage, and encourage energy conservation to make your workplace more sustainable.",
        "Waste contributes to pollution, greenhouse gas emissions, and the depletion of natural resources, making waste reduction essential for environmental protection.",
        "Insulate your home, seal drafts, and use energy-efficient heating systems to reduce your carbon footprint in the winter.",
        "Switch to reusable metal, bamboo, or silicone straws to avoid the environmental impact of single-use plastic straws.",
        "Minimize waste while grocery shopping by bringing your own bags, buying in bulk, and choosing products with minimal packaging.",
        "Carpooling reduces the number of vehicles on the road, lowering greenhouse gas emissions and traffic congestion.",
        "Unplug electronics, use energy-efficient lighting, and adjust your thermostat to save energy at night.",
        "Reusing and repurposing items helps conserve resources, reduces waste, and can save you money in the long run.",
        "Use energy-efficient appliances, reduce food waste, and cook with residual heat to make your kitchen more eco-friendly.",
        "Packaging waste contributes to pollution and resource depletion. Opt for products with minimal or recyclable packaging.",
        "Use reusable fabric, old newspapers, or eco-friendly wrapping paper to wrap gifts sustainably.",
        "Reduce energy usage, recycle, and avoid single-use plastics to lower your carbon footprint at work.",
        "Use energy-efficient appliances, cook with lids on pots, and avoid preheating your oven unnecessarily to conserve energy in the kitchen.",
        "Reduce waste during the holidays by reusing decorations, avoiding single-use items, and planning meals carefully to avoid excess food.",
        "Electronic waste contains hazardous materials that can harm the environment if not disposed of properly. Recycle electronics responsibly.",
        "Avoid unnecessary packaging, bring your own containers, and choose sustainable materials to minimize waste when ordering takeout.",
        "Consider walking, biking, public transportation, or carpooling as eco-friendly transportation options.",
        "Water your plants during the early morning or late evening, use a broom instead of a hose for cleaning, and install a rain barrel to collect water for your garden.",
        "Choose eco-friendly pet products, such as biodegradable waste bags and sustainably sourced food, to reduce the environmental impact of pet care.",
        "Opt for plant-based meals, reduce food waste, and buy locally sourced ingredients to lower the carbon footprint of your meals.",
        "Choose eco-friendly accommodations, reduce waste, and support local communities to make travel more sustainable.",
        "Reduce waste by opting for reusable items, composting, and recycling, and aim to avoid single-use products in your daily routine.",
        "Using public transportation reduces greenhouse gas emissions, lowers traffic congestion, and decreases the demand for parking spaces.",
        "Switch to energy-efficient appliances, unplug devices when not in use, and use programmable thermostats to reduce your energy use at home.",
        "Choose natural, biodegradable cleaning products and reusable cleaning tools to reduce your environmental impact.",
        "Minimize waste in your home office by going digital, recycling paper, and using energy-efficient equipment.",
        "Opt for clothing made from sustainable materials, buy second-hand, and take care of your clothes to reduce your environmental impact.",
        "Shop with reusable bags, avoid products with excessive packaging, and support companies with sustainable practices to reduce your impact while shopping.",
        "Single-use plastics contribute to pollution, harm wildlife, and take centuries to decompose, making them a significant environmental issue.",
        "To make your diet more eco-friendly, reduce meat consumption, choose locally sourced produce, and avoid processed foods.",
        "A plant-based diet reduces greenhouse gas emissions, conserves water, and decreases the demand for deforestation, making it a sustainable choice.",
        "To reduce your energy use in the winter, insulate your home, use energy-efficient heating, and wear layers to stay warm without cranking up the heat.",
            'I’m sorry to hear that. I’m here to assist you, so please let me know how I can improve.',
    'I apologize if I haven’t met your expectations. Your feedback is valuable, and I’m here to help in any way I can.',
    'I’m sorry if I’m causing any frustration. Let me know how I can assist you better.',
    'I’m sorry if there was a mistake. Please provide more details, and I’ll do my best to correct it.',

    # Appreciation
    'You’re welcome! I’m glad I could assist you. If you have any more questions, feel free to ask.',
    'Thank you for the kind words! I’m here to help you make a positive impact on the environment.',
    'I’m happy to hear that! Let me know if there’s anything else I can do for you.',
    'You’re welcome! I’m here to help you with any questions or tips you need.'
    ]
}

phrase_dict = dict(zip(data["User Question"], data["Bot Answer"]))

def clean_input(user_input):
    # Convert to lowercase
    user_input = user_input.lower()
    # Remove any non-alphabetic characters and extra spaces
    user_input = re.sub(r'[^a-z\s]', '', user_input)
    # Split into words
    tokens = user_input.split()
    print(f'cleaned words are : {tokens}')
    return tokens

def compare_and_respond(cleaned_words):
    max_match = 0
    best_phrase = None
    
    for phrase,r in phrase_dict.items():
        # Split the phrase into individual words using the pipe character
        variant_words = phrase.split('|')
        # Count the number of matching words between cleaned input and the variant words
        match_count = sum(1 for word in cleaned_words if word in variant_words)
        if match_count > max_match:
            max_match = match_count
            best_phrase = phrase

    if max_match > 0:
        return phrase_dict.get(best_phrase, "Sorry, I don't understand that.")
    else:
        return "Hmm, I didn't catch that. Could you ask something related to carbon emissions or the environment?"

@app.route("/homeplot", methods=['GET'])
def homeplot():
    countries = request.args.getlist('countries')  # Get list of countries from request
    if not countries:
        return jsonify({'error': 'At least one country is required'}), 400

    plt.figure(figsize=(16, 10))
    
    # Debug: Print requested countries
    print("Requested countries:", countries)
    
    # Plot data for each country
    for country in countries:
        df_country = data_frame[data_frame['Country'] == country]
        
        # Debug: Print data for each country
        print(f"Data for {country}:")
        print(df_country.head())
        
        if not df_country.empty:
            plt.plot(df_country['Year'], df_country['Total'], label=country)
        else:
            print(f"No data available for {country}")  # Log missing data

    plt.ylabel('Total Emission')
    plt.title('Emission Progression for Selected Countries')
    plt.legend()  # Show legend for country labels
    
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close()

    return send_file(img, mimetype='image/png', download_name='homeplot.png')




@app.route('/globalplot', methods=['GET'])
def get_global_plot():
    # Generate the global CO2 emissions graph here (top 10 countries)
    fig = top10plot()  # Ensure this function generates and returns a Matplotlib figure
    output = io.BytesIO()
    fig.savefig(output, format='png')  # Save figure to the BytesIO object
    output.seek(0)  # Reset the pointer to the beginning of the buffer
    
    return send_file(output, mimetype='image/png')  # Return the image as a response



@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    user_input = data.get('message', '')
    print(f'user_input is : {user_input}')
    cleaned_words = clean_input(user_input)
    response = compare_and_respond(cleaned_words)
    print(f'chat_output is : {response}')

    return jsonify({'response': response})  

@app.route('/challenges', methods=['GET'])
@jwt_required()
def get_challenges():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM challenges WHERE user_id = %s",(user_id,))  # Adjust query as needed
        challenges = cur.fetchall()
        challenges_list = [{'name': c[1], 'description': c[2]} for c in challenges]  # Adjust based on your schema
        return jsonify(challenges_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/start_challenge', methods=['POST'])
@jwt_required()
def start_challenge():
    user_id = get_jwt_identity()
    challenge_name = '21-Day Eco-Friendly Challenge'
    start_date = datetime.now()
    end_date = start_date + timedelta(days=21)
    total_points = 1000
    status = 'In Progress'
    data = request.get_json()
    name = data.get('name')
    print(f"Received name: {name}")

    conn = get_db_connection()
    cur = conn.cursor()
    print(f"MADE CONNECTION")
    
    try:
        cur.execute(
            """
            INSERT INTO challenges (username, user_id, challenge_name, start_date, end_date, total_points, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (name, user_id, challenge_name, start_date, end_date, total_points, status)
        )

        print(f"Execution mudinchi")

        challenge_id = cur.fetchone()[0]


        conn.commit()
        print(f"comiited naanu")

        return jsonify({
        "success": True,
        "challenge_id": challenge_id
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()
  

@app.route('/challenge_status', methods=['POST'])
@jwt_required()
def challenge_status():
    print(f'Ulla lam varuthu')
    user_id = get_jwt_identity()
    print(f'USER : {user_id}')
    conn = get_db_connection()
    cur = conn.cursor()
    print(f'Connection DB Oda mudinjiruchu')

    cur.execute("""
        SELECT *
        FROM challenges
        WHERE user_id = %s
    """, (user_id,))
    challenges = cur.fetchall()
    
    cur.close()
    conn.close()

    if not challenges:
        print(f'Start Aagala dei')
        return jsonify({"status": "not_started"}), 200

    print(f'Start aachu challenge')

    return jsonify({"status": "started", "data": challenges}), 200


@app.route('/fetch_user_challenge', methods=['POST'])
@jwt_required()
def fetch_user_challenge():
    user_id = get_jwt_identity()

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT challenge_day, description, status, points, points_won
            FROM user_challenges
            WHERE user_id = %s
            ORDER BY challenge_day
            """, (user_id,))
        
        challenges = cur.fetchall()

        # Convert the result into a list of dictionaries
        challenges_list = []
        for row in challenges:
            challenges_list.append({
                "challenge_day": row[0],
                "description": row[1],
                "status": row[2],
                "points": row[3],
                "points_won": row[4]
            })
        
        return jsonify({"data": challenges_list}), 200
    
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 400
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.route('/fetch_today', methods=['GET'])
@jwt_required()
def fetch_today():
    user_id = get_jwt_identity()
    today_date = datetime.now().strftime('%Y-%m-%d')

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Query to get today's task for the user
        cur.execute("""
            SELECT description
            FROM user_challenges
            WHERE user_id = %s AND challenge_day::date = %s
            """, (user_id, today_date))

        task = cur.fetchone()

        if task:
            return jsonify({"task": task[0]}), 200
        else:
            return jsonify({"message": "No task found for today. Please start the challenge."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

logging.basicConfig(level=logging.DEBUG)

@app.route('/complete_task', methods=['POST'])
@jwt_required()
def complete_task():
    try:
        user_id = get_jwt_identity()
        conn = get_db_connection()
        cur = conn.cursor()
        print(f"MADE CONNECTION")


        # Fetch today's task for the user
        cur.execute("""
            SELECT id, challenge_day, points
            FROM user_challenges
            WHERE user_id = %s AND challenge_day = CURRENT_DATE
        """, (user_id,))
        task = cur.fetchone()

        print(f"task fetch {task}")

        if task:
            task_id, challenge_day, points = task

            # Update task status to completed and add points
            cur.execute("""
                UPDATE user_challenges
                SET status = 'completed', points_won = points
                WHERE id = %s
            """, (task_id,))

            print(f"update paniyachu")


            # Fetch the reward based on the sum of points
            cur.execute("""
                SELECT title, stars
                FROM rewards
                WHERE points_required <= %s
                ORDER BY points_required DESC
                LIMIT 1
            """, (points,))
            reward = cur.fetchone()

            print(f"rewRD yenna fetch {reward}")


            if reward:
                title, stars = reward
               
                print(f"if satisfied ra {reward}")

                # Update the user's status
                cur.execute("""
                    INSERT INTO user_status (user_id, total_points, current_title, stars, last_updated)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE
                    SET total_points = EXCLUDED.total_points,
                        current_title = EXCLUDED.current_title,
                        stars = EXCLUDED.stars,
                        last_updated = EXCLUDED.last_updated;
                """, (user_id, points, title, stars, datetime.now()))

                conn.commit()
                cur.close()
                conn.close()

                return jsonify({"message": "Task completed successfully!"}), 200
            else:
                cur.close()
                conn.close()
                return jsonify({"error": "No rewards found for the given points"}), 404

        else:
            cur.close()
            conn.close()
            return jsonify({"error": "No task found for today"}), 404

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/revoke_task', methods=['POST'])
@jwt_required()
def revoke_task():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch today's task for the user
    cur.execute("""
        SELECT id, points
        FROM user_challenges
        WHERE user_id = %s AND challenge_day = CURRENT_DATE AND status = 'completed'
    """, (user_id,))
    task = cur.fetchone()

    if task:
        task_id, points = task

        # Revert task status to not completed and remove points
        cur.execute("""
            UPDATE user_challenges
            SET status = 'Pending', points_won = 0
            WHERE id = %s
        """, (task_id,))
        
        # Optionally, update user points or other relevant details here
        # Example: cur.execute("UPDATE users SET total_points = total_points - %s WHERE id = %s", (points, user_id))
        cur.execute("""
            UPDATE user_status
            SET total_points = total_points - %s, last_updated = CURRENT_TIMESTAMP
            WHERE user_id = %s
        """, (points, user_id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Task completion revoked. Points removed."}), 200
    else:
        cur.close()
        conn.close()
        return jsonify({"error": "No completed task found to revoke"}), 404

@app.route('/task_status', methods=['GET'])
@jwt_required()
def task_status():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch today's task status for the user
    cur.execute("""
        SELECT status
        FROM user_challenges
        WHERE user_id = %s AND challenge_day = CURRENT_DATE
    """, (user_id,))
    task_status = cur.fetchone()

    cur.close()
    conn.close()

    if task_status:
        return jsonify({"status": task_status[0]}), 200
    else:
        return jsonify({"status": None}), 200


@app.route('/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch users and their details, ordered by total_points descending
    cur.execute("""
        SELECT c.username, us.total_points, us.current_title, us.stars, us.last_updated
        FROM user_status us
        JOIN challenges c ON us.user_id = c.user_id
        ORDER BY us.total_points DESC, us.last_updated ASC
        LIMIT 10
    """)

    leaderboard = cur.fetchall()

    cur.close()
    conn.close()

    # Format the results
    result = [
        {
            "user_name": row[0],
            "total_points": row[1],
            "current_title": row[2],
            "stars": row[3],
            "last_updated": row[4]
        }
        for row in leaderboard
    ]
    return jsonify(result), 200

@app.route('/rewards', methods=['GET'])
@jwt_required()
def get_rewards():
    user_id = get_jwt_identity()

    conn = get_db_connection()
    cur = conn.cursor()

    # Fetch user's total points
    cur.execute("SELECT total_points FROM user_status WHERE user_id = %s", (user_id,))
    result = cur.fetchone()

    if result is None:
        # If no record found, return an error message or handle it as required
        return jsonify({"error": "User not found"}), 404

    user_points = result[0]

    # Fetch all rewards
    cur.execute("SELECT reward_id, points_required, title, stars FROM rewards ORDER BY points_required ASC")
    rewards = cur.fetchall()

    current_reward = None
    for reward in rewards:
        if user_points >= reward[1]:  # Check if user has enough points for the reward
            current_reward = reward

    cur.close()
    conn.close()

    return jsonify({
        'rewards': rewards,
        'current_reward': current_reward
    })


@app.route('/user_challenge', methods=['POST'])
@jwt_required()
def user_challenge():

    user_id = get_jwt_identity()
    challenge_id = request.json.get('challenge_id')

    conn = get_db_connection()
    cur = conn.cursor()

    # Define the list of activities
    activities = [
        {"day": "Monday", "activity": "Meatless Monday - Start your week with a plant-based diet."},
        {"day": "Tuesday", "activity": "Eco-Friendly Swap - Replace plastic bottles with a reusable water bottle."},
        {"day": "Wednesday", "activity": "Zero Waste Week Begins - Use a reusable shopping bag for groceries."},
        {"day": "Thursday", "activity": "Zero Waste Week - Avoid single-use plastics (straws, cups, etc.)."},
        {"day": "Friday", "activity": "Zero Waste Week - Start a compost bin or use a composting service."},
        {"day": "Saturday", "activity": "Zero Waste Week - Declutter responsibly—donate, recycle, or upcycle items."},
        {"day": "Sunday", "activity": "Zero Waste Week - Prepare meals with minimal food waste."},
        {"day": "Monday", "activity": "Eco-Friendly Swap - Switch to a bamboo toothbrush."},
        {"day": "Tuesday", "activity": "Plant a Tree - Plant a tree or an indoor plant."},
        {"day": "Wednesday", "activity": "Public Transport Day - Use public transport, carpool, bike, or walk."},
        {"day": "Thursday", "activity": "Eco-Friendly Swap - Replace your cleaning products with DIY natural cleaners."},
        {"day": "Friday", "activity": "Public Transport Day - Reduce your carbon footprint by avoiding your car."},
        {"day": "Saturday", "activity": "Plant a Tree - Care for your previously planted tree or plant another one."},
        {"day": "Sunday", "activity": "Public Transport Day - Avoid driving and use alternative transportation."},
        {"day": "Monday", "activity": "Meatless Monday - Enjoy a vegetarian or vegan meal."},
        {"day": "Tuesday", "activity": "Eco-Friendly Swap - Choose a reusable coffee cup or lunch container."},
        {"day": "Wednesday", "activity": "Zero Waste Week Ends - Use beeswax wraps instead of plastic wrap for food storage."},
        {"day": "Thursday", "activity": "Eco-Friendly Swap - Switch to a reusable shopping bag for all your shopping."},
        {"day": "Friday", "activity": "Zero Waste Week - Focus on minimal waste during meal preparation."},
        {"day": "Saturday", "activity": "Public Transport Day - Embrace public transport or carpool with others."},
        {"day": "Sunday", "activity": "Eco-Friendly Swap - Choose a sustainable or eco-friendly personal care product."}
    ]

    # Randomly select 3 Meatless Mondays and 2 Plant a Tree days
    def select_random_days(days, num):
        return random.sample(days, num)

    # Define all days and constraints
    all_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    meatless_mondays = select_random_days(all_days, 3)  # Randomly choose 3 Mondays
    plant_tree_days = select_random_days(all_days, 2)  # Randomly choose 2 days

    # Define activities for the week
    week_activities = [
        {"day": day, "activity": activity} for day, activity in [
            ("Monday", "Meatless Monday - Start your week with a plant-based diet."),
            ("Tuesday", "Eco-Friendly Swap - Replace plastic bottles with a reusable water bottle."),
            ("Wednesday", "Zero Waste Week Begins - Use a reusable shopping bag for groceries."),
            ("Thursday", "Zero Waste Week - Avoid single-use plastics (straws, cups, etc.)."),
            ("Friday", "Zero Waste Week - Start a compost bin or use a composting service."),
            ("Saturday", "Zero Waste Week - Declutter responsibly—donate, recycle, or upcycle items."),
            ("Sunday", "Zero Waste Week - Prepare meals with minimal food waste."),
        ]
    ]

    # Generate the list of activities for the 21-day challenge
    def generate_activities(start_day):
        challenge_activities = []
        # Week 1
        for i in range(7):
            current_day = (start_day + i) % 7
            day_name = all_days[current_day]
            activity = next(act['activity'] for act in week_activities if act['day'] == day_name)
            challenge_activities.append({"day_date": start_date + timedelta(days=i), "activity": activity})

        # Week 2
        for i in range(7, 14):
            current_day = (start_day + i) % 7
            day_name = all_days[current_day]
            if day_name in meatless_mondays:
                activity = "Meatless Monday - Enjoy a vegetarian or vegan meal."
            elif day_name == "Tuesday":
                activity = "Plant a Tree - Plant a tree or an indoor plant." if (i - 7) in [0, 6] else "Public Transport Day - Use public transport, carpool, bike, or walk."
            elif day_name == "Wednesday":
                activity = "Public Transport Day - Reduce your carbon footprint by avoiding your car."
            elif day_name == "Thursday":
                activity = "Eco-Friendly Swap - Replace your cleaning products with DIY natural cleaners."
            elif day_name == "Friday":
                activity = "Public Transport Day - Embrace public transport or carpool with others."
            elif day_name == "Saturday":
                activity = "Plant a Tree - Care for your previously planted tree or plant another one." if (i - 7) in [0, 6] else "Eco-Friendly Swap - Switch to a reusable shopping bag for all your shopping."
            elif day_name == "Sunday":
                activity = "Public Transport Day - Avoid driving and use alternative transportation."
            challenge_activities.append({"day_date": start_date + timedelta(days=i), "activity": activity})

        # Week 3
        for i in range(14, 21):
            current_day = (start_day + i) % 7
            day_name = all_days[current_day]
            if day_name in meatless_mondays:
                activity = "Meatless Monday - Enjoy a vegetarian or vegan meal."
            elif day_name == "Tuesday":
                activity = "Eco-Friendly Swap - Choose a reusable coffee cup or lunch container."
            elif day_name == "Wednesday":
                activity = "Zero Waste Week - Focus on minimal waste during meal preparation."
            elif day_name == "Thursday":
                activity = "Eco-Friendly Swap - Switch to a sustainable or eco-friendly personal care product."
            elif day_name == "Friday":
                activity = "Public Transport Day - Embrace public transport or carpool with others."
            elif day_name == "Saturday":
                activity = "Eco-Friendly Swap - Choose a sustainable or eco-friendly personal care product."
            elif day_name == "Sunday":
                activity = "Zero Waste Week - Use beeswax wraps instead of plastic wrap for food storage."
            challenge_activities.append({"day_date": start_date + timedelta(days=i), "activity": activity})

        return challenge_activities

    # Example usage
    start_date = datetime.now()
    start_day = start_date.weekday()  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    activities_for_challenge = generate_activities(start_day)

    # Debugging output
    print(f"Generated activities: {activities_for_challenge}")

    # Insert activities into the user_challenges table as needed
    try:
        for activity in activities_for_challenge:
            cur.execute(
                """
                INSERT INTO user_challenges (user_id, challenge_id, challenge_day, description, status, points, points_won)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (user_id, challenge_id, activity['day_date'], activity['activity'], 'Pending', 50, 0)
            )

        cur.execute(
            """
                    INSERT INTO user_status (user_id, total_points, current_title, stars, last_updated)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE
                    SET total_points = EXCLUDED.total_points,
                        current_title = EXCLUDED.current_title,
                        stars = EXCLUDED.stars,
                        last_updated = EXCLUDED.last_updated;
            """,(user_id, 0, 'Newbie', 0, datetime.now())
        )
        conn.commit()
        return jsonify({
            "success": True
        }), 201
    except Exception as e:
        conn.rollback()
        print(f"Error occurred: {e}")  # Debugging output
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
