import sqlite3
import csv

# Path to your CSV file
csv_file = 'emotions.csv'

# Connect to (or create) your SQLite database
conn = sqlite3.connect('../interaction_logs.db')
cursor = conn.cursor()

# Create table (without user_sentiment)
cursor.execute('''
    CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY,
        timestamp TEXT,
        user_id TEXT,
        session_id TEXT,
        user_message TEXT,
        chatbot_response TEXT,
        context TEXT
    )
''')

# Read and insert CSV data (skip user_sentiment if present)
with open(csv_file, newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    rows = []
    for row in reader:
        rows.append((
            int(row['id']),
            row['timestamp'],
            row['user_id'],
            row['session_id'],
            row['user_message'],
            row['chatbot_response'],
            row.get('context', '')  # defaults to empty string if missing
        ))

    cursor.executemany('''
    INSERT OR REPLACE INTO interactions (
        id, timestamp, user_id, session_id, user_message, chatbot_response, context
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
''', rows)


# Commit and close
conn.commit()
conn.close()

print("Data inserted successfully into SQLite DB.")
