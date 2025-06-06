import { pdf } from '@react-pdf/renderer';
import QuotePDF from '../components/pdf/QuotePDF';
import React from 'react';

export const generateQuotePDF = async (quote, items) => {
  try {
    const doc = <QuotePDF quote={quote} items={items} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quotation_Windo_${quote.projectName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '_')}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 