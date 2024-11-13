import requests
import json
import os
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Get API keys from environment variables
GOOGLE_SEARCH_API_KEY = os.getenv("SCRAPER_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Flask app
app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
def google_search_query(q):
    payload = { 'api_key': GOOGLE_SEARCH_API_KEY, 'query': q }
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
    print("Search Results: " + search_results)
    logging.info("Parsing search results using Groq LLM.")
    
    prompt = (
        """You are an intelligent text extraction assistant. Your task is to extract information from the given web scraping result and print the top one output directly. The output should contain only the text extracted from the scraping result, with no additional commentary, explanations, or extraneous information. You could encounter cases where you can't find the data of the fields you have to extract or the data will be in a foreign language. Please process the following text and provide the output directly with no words before or after the output:"""
        f"Topic: {topic}\nSearch Results: {search_results}"
    )
    result = get_groq_chat_response(prompt)
    logging.info("Successfully generated catchy headlines.")
    return jsonify({"result": result})

# Run the Flask app
if __name__ == '__main__':
    logging.info("Starting Flask app...")
    app.run(debug=True)