import requests
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__)
app.config['FREEZER_BASE_URL'] = 'http://localhost/'  # Adjust based on production needs
app.config['FREEZER_DESTINATION'] = 'build'  # Set the output directory for static files

# Hugging Face API URL for emotion detection
HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/distilbert-base-uncased-emotion"
QUOTE_API_URL = "https://api.api-ninjas.com/v1/quotes?category={}"


# Function to analyze the user's emotional state using Hugging Face API
def analyze_emotion(responses):
    x = ['not', 'abit', 'kinda', 'very', 'extremely', '.', '.', '.']
    # Map numeric responses to text descriptions
    response_texts = [
        f"I am {x[responses[0] - 1]} energsied",
        f"I am {x[responses[1] - 1]} sad",
        f"I am {x[responses[2] - 1]} motivated to work towards my goals",
    ]
    print(response_texts)

    # Combine the responses into a single prompt
    prompt = " ".join(response_texts)

    headers = {"Authorization": "Bearer API_KEY"}  # Optional if you have a Hugging Face API token (or leave empty for public)

    try:
        # Call Hugging Face API for analysis
        response = requests.post(HUGGING_FACE_API_URL, headers=headers, json={"inputs": prompt})
        response_json = response.json()
        if response.status_code == 200:
            # Extract the most likely emotion from the response
            emotions = response_json[0]
            sorted_emotions = sorted(emotions, key=lambda x: x['score'], reverse=True)
            emotion_label = sorted_emotions[0]['label'].lower()
            print(emotion_label)
            # Map emotion label to our predefined categories
            if 'joy' in emotion_label or 'love' in emotion_label:
                return "happy"
            elif 'neutral' in emotion_label or 'calm' in emotion_label:
                return "neutral"
            elif 'sadness' in emotion_label or 'anger' in emotion_label or 'stress' in emotion_label:
                return "stressed"
            else:
                return "neutral"  # Fallback if unclear
        else:
            print(f"Error: {response_json}")
            return "neutral"  # Fallback if error occurs
    except Exception as e:
        print(f"Exception: {e}")
        return "neutral"  # Default to neutral if API fails

# Function to map emotion to one of the 5 categories
def get_category_from_emotion(emotion):
    emotion_to_category = {
        "happy": "happiness",
        "neutral": "hope",
        "stressed": "faith"
    }
    return emotion_to_category.get(emotion, "success") # emotion == happy neutrol or stressed

def generate_quote_filtered_len(category):

    while True:
        api_url = QUOTE_API_URL.format(category)
        response = requests.get(api_url, headers={'X-Api-Key': 'API_KEY'})
        
        if response.status_code == 200:
            quote_data = response.json()[0]
            quote_str = quote_data["quote"]
            quote_author = quote_data["author"]

            if len(quote_str) <= 100:
                return {"quote_str": quote_str, "author_str": quote_author}
        else:
            print(f"Error fetching quote: {response.status_code}")
            return {"quote_str": "No quote available.", "author_str": "Unknown"}


# Function to fetch a quote from the API based on the emotion category
def get_quote(category):
    print(category)
    quote_data = generate_quote_filtered_len(category)
    quote_str = quote_data["quote_str"]
    author_str = quote_data["author_str"]

    return {"quote": quote_str, "author": author_str}

# Route to display the homepage 
@app.route('/')
def home():
    return render_template("index.html")

# Route to handle user responses and send back emotion and quote
@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    responses = data['responses']
    
    # Analyze emotion using Hugging Face API
    emotion = analyze_emotion(responses)
    
    # Get category and quote based on emotion
    category = get_category_from_emotion(emotion)
    quote_data = get_quote(category)
    
    return jsonify({"emotion": emotion.capitalize(), "quote": quote_data["quote"], "author": quote_data["author"]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000)
