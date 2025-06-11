import { pdf } from '@react-pdf/renderer';
import React from 'react';
import QuoteDocument from '../components/pdf/QuoteDocument';

// Simple Buffer polyfill for browser environment
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.global = window.global || window;
  window.Buffer = window.Buffer || {
    from: (data) => new Uint8Array(data),
    isBuffer: () => false
  };
}

export const generateQuotePDF = async (quote) => {
  try {
    // Create PDF document
    const doc = <QuoteDocument quote={quote} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 