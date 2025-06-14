import { pdf } from '@react-pdf/renderer';
import React from 'react';
import QuoteDocument from '../components/pdf/QuoteDocument';
import { generateEnhancedQuotePDF as clientSideGeneration } from './enhancedPdfGenerator';

// Server-side PDF generation with fallback to client-side
export const generateHybridPDF = async (quote) => {
  try {
    console.log('Attempting server-side PDF generation...');
    
    // Step 1: Generate quote PDF on client (same as before)
    const doc = <QuoteDocument quote={quote} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const quoteBlob = await asPdf.toBlob();
    
    // Step 2: Convert to base64 for server transmission
    const quotePdfBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64,
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(quoteBlob);
    });
    
    // Step 3: Try server-side generation
    const response = await fetch('http://localhost:5001/api/pdf/generate-enhanced-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quote,
        quotePdfBuffer
      })
    });
    
    if (response.ok) {
      console.log('✅ Server-side PDF generation successful!');
      
      // Download the enhanced PDF from server
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]+)"/);
        if (matches) {
          filename = matches[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, method: 'server-side' };
    } else {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.warn('⚠️ Server-side PDF generation failed, falling back to client-side:', error.message);
    
    // Step 4: Fallback to client-side generation
    console.log('🔄 Falling back to client-side PDF generation...');
    try {
      await clientSideGeneration(quote);
      console.log('✅ Client-side PDF generation successful!');
      return { success: true, method: 'client-side-fallback' };
    } catch (clientError) {
      console.error('❌ Both server-side and client-side PDF generation failed:', clientError);
      throw new Error(`PDF generation failed: Server: ${error.message}, Client: ${clientError.message}`);
    }
  }
};

// Health check for server-side PDF service
export const checkPdfServiceHealth = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/pdf/pdf-health');
    if (response.ok) {
      const health = await response.json();
      console.log('PDF Service Health:', health);
      return health;
    }
    return { status: 'unhealthy', error: `HTTP ${response.status}` };
  } catch (error) {
    console.warn('PDF service health check failed:', error.message);
    return { status: 'unavailable', error: error.message };
  }
};

// Export original client-side function for backward compatibility
export { generateEnhancedQuotePDF } from './enhancedPdfGenerator';

// Default export is the hybrid version
export default generateHybridPDF; 