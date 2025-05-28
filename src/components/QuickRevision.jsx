import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const QuickRevision = ({ summary, transcript, selectedLanguage }) => {
  const [qaPairs, setQaPairs] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Determine API URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : '';

  // Language-specific text
  const TEXT = {
    hi: {
      title: 'त्वरित पुनरीक्षण',
      loading: 'प्रश्न और उत्तर तैयार कर रहे हैं...',
      noContent: 'सारांश या प्रतिलेख से कोई प्रश्न उत्पन्न नहीं हो सका।',
      retry: 'पुनः प्रयास करें',
      regenerate: 'पुनः उत्पन्न करें'
    },
    mr: {
      title: 'जलद उजळणी',
      loading: 'प्रश्न आणि उत्तरे तयार करत आहोत...',
      noContent: 'सारांश किंवा लिप्यंतरणातून कोणतेही प्रश्न तयार करता आले नाहीत.',
      retry: 'पुन्हा प्रयत्न करा',
      regenerate: 'पुन्हा तयार करा'
    },
    en: {
      title: 'Quick Revision',
      loading: 'Generating questions and answers...',
      noContent: 'No questions could be generated from the summary or transcript.',
      retry: 'Retry',
      regenerate: 'Generate Again'
    }
  };

  const generateQuestionsAndAnswers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQaPairs([]);

    try {
      const textToProcess = [summary, transcript].filter(Boolean).join('\n\n');
      if (!textToProcess.trim()) {
        throw new Error(TEXT[selectedLanguage]?.noContent || TEXT.en.noContent);
      }

      const response = await fetch(`${API_BASE_URL}/api/generate-qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, language: selectedLanguage })
      });

      // Check for HTML error responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const errorText = await response.text();
        throw new Error('Server returned HTML error page');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate and format Q&A pairs
      const formattedPairs = Array.isArray(data.qaPairs) 
        ? data.qaPairs.map((item, index) => ({
            id: item.id || `${index}-${Date.now()}`,
            question: item.question || '',
            answer: item.answer || ''
          })).filter(item => item.question && item.answer)
        : [];

      if (formattedPairs.length === 0) {
        throw new Error(TEXT[selectedLanguage]?.noContent || TEXT.en.noContent);
      }

      setQaPairs(formattedPairs);
    } catch (err) {
      console.error("Q&A Generation Error:", err);
      setError(err.message);
      if (retryCount < 2) setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [summary, transcript, selectedLanguage, retryCount, API_BASE_URL]);

  // Auto-retry mechanism
  useEffect(() => {
    if (error && retryCount > 0) {
      const timer = setTimeout(() => generateQuestionsAndAnswers(), 2000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, generateQuestionsAndAnswers]);

  // Generate Q&A when content changes
  useEffect(() => {
    if (summary || transcript) {
      generateQuestionsAndAnswers();
    }
  }, [summary, transcript, selectedLanguage, generateQuestionsAndAnswers]);

  const handleCardClick = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8 text-purple-600">
      <svg className="w-6 h-6 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {TEXT[selectedLanguage]?.loading || TEXT.en.loading}
    </div>
  );

  const ErrorMessage = () => (
    <div className="text-center py-8 text-red-600">
      <p>{error}</p>
      <button
        onClick={generateQuestionsAndAnswers}
        className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
      >
        {TEXT[selectedLanguage]?.retry || TEXT.en.retry}
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <p>{TEXT[selectedLanguage]?.noContent || TEXT.en.noContent}</p>
      {(summary || transcript) && (
        <button
          onClick={generateQuestionsAndAnswers}
          className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {TEXT[selectedLanguage]?.regenerate || TEXT.en.regenerate}
        </button>
      )}
    </div>
  );

  const QACards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {qaPairs.map((item) => (
        <div
          key={item.id}
          className={`relative h-48 bg-gray-100 rounded-lg shadow-md cursor-pointer transition-all duration-300 ${flippedCards[item.id] ? 'bg-white' : ''}`}
          onClick={() => handleCardClick(item.id)}
        >
          <div className={`absolute inset-0 p-4 flex items-center justify-center text-center transition-opacity duration-300 ${flippedCards[item.id] ? 'opacity-0' : 'opacity-100'}`}>
            <p className="font-medium text-gray-800">{item.question}</p>
          </div>
          <div className={`absolute inset-0 p-4 flex items-center justify-center text-center transition-opacity duration-300 ${flippedCards[item.id] ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-700">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {TEXT[selectedLanguage]?.title || TEXT.en.title}
      </h3>

      {isLoading ? <LoadingSpinner /> : 
       error ? <ErrorMessage /> : 
       qaPairs.length === 0 ? <EmptyState /> : 
       <QACards />}
    </div>
  );
};

QuickRevision.propTypes = {
  summary: PropTypes.string,
  transcript: PropTypes.string,
  selectedLanguage: PropTypes.oneOf(['en', 'hi', 'mr']).isRequired
};

QuickRevision.defaultProps = {
  summary: '',
  transcript: ''
};

export default QuickRevision;