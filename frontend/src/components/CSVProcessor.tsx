import React, { useState } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import axios from 'axios';

const Navbar = () => (
  <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-2xl font-bold text-white">ScraperWizard</span>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-purple-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function DataWizard() {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mainColumn, setMainColumn] = useState<string>('');
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>('');
  const [processedData, setProcessedData] = useState<string[][]>([]);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'process' | 'results'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data as string[][]);
          setHeaders(result.data[0] as string[]);
          setActiveTab('process');
        }
      });
    }
  };

  const handleMainColumnSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMainColumn(event.target.value);
  };

  const handlePromptTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPromptTemplate(event.target.value);
  };

  const handleGoogleSheetUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoogleSheetUrl(event.target.value);
  };

  const handleGoogleSheetConnect = () => {
    setError('Google Sheets integration is not yet implemented.');
  };

  const handleBackendProcessing = async () => {
    if (!mainColumn || !promptTemplate || csvData.length === 0) {
      setError('Please select a main column, enter a prompt template, and upload a CSV file.');
      return;
    }

    const csvBlob = new Blob([Papa.unparse(csvData)], { type: 'text/csv;charset=utf-8;' });
    const formData = new FormData();
    formData.append('file', csvBlob, 'input.csv');
    formData.append('prompt', promptTemplate);

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://127.0.0.1:5000/scrape_csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob'
      });
      if (response.status === 200) {
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        setProcessedDataUrl(downloadUrl);
        
        const reader = new FileReader();
        reader.onload = function(e) {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const result = Papa.parse(text, { header: true });
            setProcessedData(result.data as string[][]);
            setActiveTab('results');
          }
        };
        reader.readAsText(new Blob([response.data]));
      } else {
        setError('Unexpected response from the server. Please try again.');
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      if (error.response) {
        const reader = new FileReader();
        reader.onload = function () {
          setError(`Error from server: ${reader.result}`);
        };
        reader.readAsText(error.response.data);
      } else {
        setError('There was an error processing the CSV file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedDataUrl) {
      saveAs(processedDataUrl, 'processed_results.csv');
    } else {
      setError('No processed data available for download.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
            Transform Your Data with AI-Powered Insights
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              title="CSV Upload"
              description="Easily upload your CSV files or connect to Google Sheets for seamless data import."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>}
            />
            <FeatureCard
              title="AI Processing"
              description="Leverage advanced AI algorithms to process and analyze your data with custom prompts."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>}
            />
            <FeatureCard
              title="Instant Results"
              description="Get processed results instantly and download them in CSV format for further analysis."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>}
            />
          </div>
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'upload' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload Data
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'process' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('process')}
              >
                Process
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'results' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <label htmlFor="csvInput" className="flex-1">
                      <div className="relative group">
                        <input
                          id="csvInput"
                          type="file"
                          accept=".csv"
                          className="sr-only"
                          onChange={handleFileUpload}
                          aria-label="Upload a CSV file"
                        />
                        <div className="cursor-pointer bg-purple-600 text-white font-medium py-3 px-4 rounded-lg text-center transition duration-300 ease-in-out hover:bg-purple-700 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                          Upload a CSV
                        </div>
                      </div>
                    </label>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={googleSheetUrl}
                        onChange={handleGoogleSheetUrlChange}
                        placeholder="Enter Google Sheet URL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        onClick={handleGoogleSheetConnect}
                        className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Connect to Google Sheets
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'process' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <select
                      className="flex-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg"
                      onChange={handleMainColumnSelect}
                      value={mainColumn}
                      aria-label="Select main column"
                    >
                      <option value="">Select main column</option>
                      {headers.map((header, index) => (
                        <option key={index} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={promptTemplate}
                      onChange={handlePromptTemplateChange}
                      placeholder="Enter prompt template, e.g., 'Get me the email address of {company}'"
                      className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleBackendProcessing}
                    className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Process CSV with AI'}
                  </button>
                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                      <p className="font-bold">Error</p>
                      <p>{error}</p>
                    </div>
                  )}
                  {csvData.length > 0 && (
                    <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg shadow-inner">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {headers.map((header, index) => (
                              <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {csvData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'results' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Processed Data Preview</h2>
                  {processedData.length > 0 ? (
                    <div className="max-h-96 overflow-auto border border-gray-200 rounded-lg shadow-inner">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {Object.keys(processedData[0]).map((header, index) => (
                              <th
                                key={index}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedData.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              {Object.values(row).map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No processed data available. Please process your CSV first.</p>
                  )}
                  <button
                    onClick={handleDownload}
                    className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    disabled={!processedDataUrl}
                  >
                    Download Processed CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}