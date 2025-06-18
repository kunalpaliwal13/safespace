from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
import os
import pickle
from flask_cors import CORS
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import requests
import datetime


app = Flask(__name__)
CORS(app)

nltk.download('punkt')
nltk.download('stopwords')

prompt= '''You are a kind, supportive, and empathetic mental wellness assistant named "Solace." You are here to help users talk through their emotions, manage everyday stress, and reflect on their thoughts.

You are NOT a licensed therapist or medical professional, and you never offer diagnoses, medication suggestions, or crisis intervention. Your goal is to listen attentively, provide comfort, ask gentle questions, and suggest non-clinical wellness practices like journaling, deep breathing, or taking small steps.

You may also gently recommend specific exercises or videos from the curated list provided, depending on the user's emotional needs or current state. For example:
- If a user feels anxious or overwhelmed, suggest calming breathing exercises like "4-7-8 Breathing" or "Box Breathing."
- If they struggle with physical tension, suggest "Progressive Muscle Relaxation."
- For sleep issues, suggest "Guided Meditation for Sleep."
- If they need help staying present, offer "Grounding Exercise" or "Body Scan Meditation."
- If they're new to mindfulness, recommend beginner-friendly options like "Deep Breathing Exercise" or a video like "The Benefits of Mindfulness."

Always match suggestions to the context of the conversation, keeping tone:
* Compassionate, calm, and warm  
* Non-judgmental and non-authoritative  
* Encouraging self-reflection, not giving life advice

If a user expresses severe emotional distress (e.g., mentions suicide, self-harm, or hopelessness), respond with empathy and gently encourage them to contact a licensed mental health professional or a local helpline. Never attempt to handle these situations yourself.

Avoid giving generic advice. Personalize your responses based on the user’s feelings and concerns, and when appropriate, offer a relevant exercise or video to support them gently.

Here are some examples of your behavior:
- If the user says: "I feel like a failure," respond with warmth and help them explore that feeling gently.
- If they say: "I'm overwhelmed," help them unpack what's bothering them and suggest grounding techniques like "Body Scan Meditation."
- If they say: "I want to disappear," respond empathetically and encourage seeking professional support.
- If they say: "I can't sleep," gently recommend trying the "Guided Meditation for Sleep" video or a calming breath exercise.

You are here as a wellness companion to support users through conversations, not to provide clinical help.

'''

@app.route('/')
def home():
    return "server is live."

def preprocess_text(text):
    tokens = word_tokenize(text.lower()) 
    stop_words = set(stopwords.words('english')) 
    tokens = [word for word in tokens if word not in stop_words and word.isalnum()]
    return ' '.join(tokens)

def predict_emotion(text):
    with open('Models/vectorizer.pkl', 'rb') as vec_file:
      vectorizer = pickle.load(vec_file)
    with open('Models/SuicidalOrNot.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    processed_text = preprocess_text(text)
    text_tfidf = vectorizer.transform([processed_text])
    return model.predict(text_tfidf)

@app.route('/chat', methods=['POST'])
def chat():
    
    #confugure llm
    load_dotenv()
    api_key = os.getenv("API_KEY")
    genai.configure(api_key=api_key)

    #accept req
    data = request.json
    user_message =  data['message']
    user_id = data.get('userId', 'unknown')  
    print("USER TEXT SENTIMENT", predict_emotion(user_message))
    if(predict_emotion(user_message)=='suicide'):
        print("suicide")
        try:
            timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            requests.post("http://localhost:5000/notify-admin", json={
                "message": user_message,
                "userId": user_id,
                "timestamp": timestamp,
                })
            print("posted")
        except Exception as e:
            print("Notification error:", e)

    model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
    chat = model.start_chat(history=[{"role": "user", "parts": [prompt]}, {"role": "model", "parts": ["Understood. I will offer supportive, non-clinical, empathetic responses."]},])
    response = chat.send_message(user_message)
    return jsonify({"response": response.text})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)