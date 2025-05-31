/**
 * Format a number as currency in USD
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format a date string to local date string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Save a quote to localStorage
 * @param {Object} quote - The quote object to save
 * @param {string} [quote.id] - The ID of an existing quote to update
 * @returns {Object} The saved quote object
 */
export const saveQuote = (quote) => {
  const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
  
  if (quote.id) {
    // Update existing quote
    const quoteIndex = savedQuotes.findIndex(q => q.id === quote.id);
    if (quoteIndex !== -1) {
      // Update the existing quote but preserve its original ID and creation date
      const originalQuote = savedQuotes[quoteIndex];
      const updatedQuote = {
        ...quote,
        id: originalQuote.id,
        date: originalQuote.date,
        lastModified: new Date().toISOString()
      };
      savedQuotes[quoteIndex] = updatedQuote;
      localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
      return updatedQuote;
    }
  }
  
  // Create new quote
  const newQuote = {
    ...quote,
    id: generateId(),
    date: new Date().toISOString()
  };
  savedQuotes.push(newQuote);
  localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
  return newQuote;
};

/**
 * Load saved quotes from localStorage
 * @returns {Array} Array of saved quotes
 */
export const loadSavedQuotes = () => {
  const quotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
  return quotes.sort((a, b) => new Date(b.date) - new Date(a.date));
}; 