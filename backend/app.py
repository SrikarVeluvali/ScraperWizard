import requests
import json
import os
import logging
import pandas as pd
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
from groq import Groq
from werkzeug.utils import secure_filename
import re
from flask_cors import CORS
# Load environment variables
load_dotenv()

# Get API keys from environment variables
GOOGLE_SEARCH_API_KEY = os.getenv("SCRAPER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Set up logging
logging.basicConfig(level=logging.INFO)

# Define upload folder
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

# Define the Google search query function
def google_search_query(q):
    payload = {'api_key': GOOGLE_SEARCH_API_KEY, 'query': q}
    r = requests.get('https://api.scraperapi.com/structured/google/search', params=payload)
    return r.text

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Create a function to interact with the Groq LLM
def get_groq_chat_response(prompt):
    logging.info("Requesting response from Groq LLM...")
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.1-8b-instant",
    )
    logging.info("Received response from Groq LLM.")
    return chat_completion.choices[0].message.content

# Flask route to get catchy headlines
@app.route('/scrape', methods=['POST'])
def get_catchy_headlines():
    logging.info("Received request for catchy headlines.")
    data = request.get_json()
    topic = data.get("topic")
    if not topic:
        logging.error("Topic is missing in the request.")
        return jsonify({"error": "Topic is required"}), 400

    logging.info(f"Performing Google search for topic: {topic}")
    search_results = google_search_query(topic)
    logging.info("Parsing search results using Groq LLM.")
    
    prompt = (
        """You are an intelligent text extraction assistant. Your task is to extract information from the given web scraping result and print the top one output directly. The output should contain only the text extracted from the scraping result, with no additional commentary, explanations, or extraneous information. You could encounter cases where you can't find the data of the fields you have to extract or the data will be in a foreign language. Please process the following text and provide the output directly with no words before or after the output:"""
        f"Topic: {topic}\nSearch Results: {search_results}"
    )
    result = get_groq_chat_response(prompt)
    logging.info("Successfully generated catchy headlines.")
    return jsonify({"result": result})

# Flask route to handle CSV upload and scraping
@app.route('/scrape_csv', methods=['POST'])
def scrape_csv():
    if 'file' not in request.files:
        logging.error("CSV file is missing in the request.")
        return jsonify({"error": "CSV file is required"}), 400

    file = request.files['file']
    if file.filename == '':
        logging.error("No selected file.")
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    logging.info(f"CSV file uploaded: {filename}")

    # Read the CSV file
    df = pd.read_csv(filepath)
    user_prompt = request.form.get('prompt')
    if not user_prompt:
        logging.error("Prompt is missing in the request.")
        return jsonify({"error": "Prompt is required"}), 400

    # Extract placeholder columns from the prompt
    placeholders = re.findall(r"\{(.*?)\}", user_prompt)
    if len(placeholders) == 0:
        logging.error("No placeholders found in the prompt.")
        return jsonify({"error": "No placeholders found in the prompt."}), 400
    elif len(set(placeholders)) > 1:
        logging.error("Multiple different placeholders found in the prompt.")
        return jsonify({"error": "Multiple different placeholders found in the prompt. Only one unique placeholder is allowed."}), 400

    column_name = placeholders[0]
    if column_name not in df.columns:
        logging.error(f"CSV file must contain a '{column_name}' column.")
        return jsonify({"error": f"CSV file must contain a '{column_name}' column."}), 400

    # Process each query and get the response
    responses = []
    for value in df[column_name]:
        # Replace placeholder in the user-defined prompt
        final_prompt = user_prompt.replace(f"{{{column_name}}}", value)
        logging.info(f"Performing Google search for query: {final_prompt}")
        search_results = google_search_query(final_prompt)
        logging.info("Parsing search results using Groq LLM.")
        
        prompt = (
            """You are an intelligent text extraction assistant. Your task is to extract information from the given web scraping result and print the top one output directly. The output should contain only the text extracted from the scraping result, with no additional commentary, explanations, or extraneous information. You could encounter cases where you can't find the data of the fields you have to extract or the data will be in a foreign language. Please process the following text and provide the output directly with no words before or after the output. If you find multiple outputs, give only one of them. If you can't find any outputs, just give \"N/A\":"""
            f"Query: {final_prompt}\nSearch Results: {search_results}"
        )
        response = get_groq_chat_response(prompt)
        responses.append(response)

    # Add the responses to the DataFrame
    df['response'] = responses

    # Save the updated DataFrame to a new CSV file
    result_filename = f"result_{filename}"
    result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
    df.to_csv(result_filepath, index=False)
    logging.info(f"Result CSV file saved: {result_filename}")

    return send_file(result_filepath, as_attachment=True, download_name=result_filename)

# Run the Flask app
if __name__ == '__main__':
    logging.info("Starting Flask app...")
    app.run(debug=True)
