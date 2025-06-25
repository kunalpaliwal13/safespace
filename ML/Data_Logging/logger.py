import sqlite3
from datetime import datetime, timezone
from textblob import TextBlob
import gspread
from oauth2client.service_account import ServiceAccountCredentials

conn = sqlite3.connect("interaction_logs.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    user_id TEXT,
    session_id TEXT,
    user_message TEXT,
    chatbot_response TEXT,
    context TEXT
)
''')
conn.commit()

def log_interaction(user_id, session_id, user_message, chatbot_response, context_passages):
    timestamp = datetime.now(timezone.utc).isoformat()
    context_text = "\n\n".join(context_passages) if context_passages else ""

    cursor.execute('''
        INSERT INTO interactions (timestamp, user_id, session_id, user_message, chatbot_response, context)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (timestamp, user_id, session_id, user_message, chatbot_response, context_text))

    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)


    conn.commit()


    client = gspread.authorize(creds)
    sheet = client.open("Safespace Interactions").sheet1

    blob = TextBlob(user_message)
    sentiment = round(blob.sentiment.polarity, 4)

    sheet.append_row([
        timestamp,
        user_id,
        session_id,
        user_message,
        chatbot_response,
        sentiment,
        context_text
    ])

    print("sucessfully done")



    