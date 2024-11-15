# ScraperWizard

ScraperWizard is an AI-powered application designed to automate information retrieval from the web based on user-defined prompts. This tool allows users to upload datasets, define search queries dynamically, and extract relevant information using advanced LLM capabilities. The extracted data can be displayed in a user-friendly dashboard and downloaded as structured files.

## Key Features

- **File Upload & Google Sheets Integration**:
  - Upload CSV files or connect Google Sheets for data input.
  - Select a primary column (e.g., company names) for the search query.
  - Preview uploaded data within the dashboard.

- **Dynamic Prompt Input**:
  - Define custom search prompts using placeholders like `{entity}`.
  - Prompts are dynamically replaced with each entity from the selected column.

- **Automated Web Search**:
  - Perform searches using ScraperAPI or similar services.
  - Handle rate limits and API constraints effectively.
  - Collect and store search results (e.g., URLs, snippets).

- **LLM Integration for Data Parsing**:
  - Use Groq’s LLM or OpenAI’s GPT API to extract precise information from search results.
  - Customize backend prompts for detailed extraction.

- **Data Display & Download**:
  - Visualize extracted data in a structured table format.
  - Download results as CSV files or update the connected Google Sheet.

## Setup Instructions

### Prerequisites

- Python 3.8+
- API keys for ScraperAPI (or equivalent), Groq API, Google Cloud OAuth, Google Cloud API Key.
- Google Cloud account for accessing Google Sheets API.

## Project Structure

```
AI Based Webscraper
├── backend
│   ├── results
│   │   └── result_input.csv
│   ├── uploads
│   │   └── input.csv
│   ├── .env               # Backend environment variables
│   ├── .gitignore
│   ├── app.py             # Backend server code
│   ├── requirements.txt   # Python dependencies
│   ├── Test.csv
├── frontend
│   ├── public
│   │   ├── favicon.svg
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   ├── robots.txt
│   ├── src
│   │   ├── components
│   │   │   └── CSVProcessor.tsx  # Main data processor component
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   ├── .env                # Frontend environment variables
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
├── README.md               # Main project readme
```

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```plaintext
   SCRAPER_API_KEY=<Scraper API Key>
   GROQ_API_KEY=<Groq API Key>
   ```

5. Start the server:
   ```bash
   python app.py
   ```

The backend server will be available at `http://localhost:5000`.

## Frontend Setup

### Prerequisites

- Node.js 16+

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```plaintext
   REACT_APP_CLIENT_ID=<Google Oauth Client ID>
   REACT_APP_API_KEY=<Google Cloud API Key>
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`.

## Usage Guide

1. **Upload your data**:
   - Upload a CSV file or connect to a Google Sheet.
     - ![image](https://github.com/user-attachments/assets/cbf94e3c-b77f-4622-a80e-187906cfbf6f)
   - Select the column containing entities for the search query.
     - ![image](https://github.com/user-attachments/assets/d062875f-d280-4eb6-998d-a1e9ff46ae1b)

2. **Define your prompt**:
   - Input a query template like: "Find the email address of {company}."
     - ![image](https://github.com/user-attachments/assets/494dc646-3166-413d-b1f2-78757c68f63f)
   - The placeholder `{entity}` will be dynamically replaced for each row.

3. **Retrieve and process data**:
   - ScraperWizard performs automated searches and processes results through the integrated LLM.

4. **View and download results**:
   - Extracted data is displayed in a table format.
     - ![image](https://github.com/user-attachments/assets/5f0c5797-1332-4b31-a496-21602e415a86)

   - Download the results as a CSV.

## Optional Features

- Real-time Google Sheets updates with the extracted data.
- Robust error handling for failed queries.

## Technologies Used

- **Backend**: Python, Flask
- **Data Handling**: Pandas, Google Sheets API
- **Search API**: ScraperAPI
- **LLM API**: Groq
- **Frontend**: ReactJS, Tailwind CSS

Made by Srikar Veluvali.
