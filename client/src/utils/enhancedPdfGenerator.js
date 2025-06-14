import { pdf } from '@react-pdf/renderer';
import { PDFDocument, rgb } from 'pdf-lib';
import React from 'react';
import QuoteDocument from '../components/pdf/QuoteDocument';

// Glass product code to PDF file mapping (served through Express server)
const GLASS_SPEC_MAPPING = {
  'SKN 184': 'http://localhost:5001/glass-specs/SKN-184-spec.pdf',
  'SKN184': 'http://localhost:5001/glass-specs/SKN-184-spec.pdf',
  'SKN 154': 'http://localhost:5001/glass-specs/SKN-154-spec.pdf',
  'SKN154': 'http://localhost:5001/glass-specs/SKN-154-spec.pdf',
  '70/33': 'http://localhost:5001/glass-specs/70-33-spec.pdf',
  '70-33': 'http://localhost:5001/glass-specs/70-33-spec.pdf',
  '61-29': 'http://localhost:5001/glass-specs/61-29-spec.pdf',
  '61/29': 'http://localhost:5001/glass-specs/61-29-spec.pdf',
  // Alternative mappings for glass database entries
  'SKN 184 High Performance': 'http://localhost:5001/glass-specs/SKN-184-spec.pdf',
  'SKN 154 Balanced Performance': 'http://localhost:5001/glass-specs/SKN-154-spec.pdf',
  'XTREME 70/33 Maximum Light': 'http://localhost:5001/glass-specs/70-33-spec.pdf',
  'XTREME 61-29 Balanced': 'http://localhost:5001/glass-specs/61-29-spec.pdf'
};

// Simple Buffer polyfill for browser environment
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
  window.global = window.global || window;
  window.Buffer = window.Buffer || {
    from: (data) => new Uint8Array(data),
    isBuffer: () => false
  };
}

// Helper function to fetch PDF data
const fetchPdfData = async (pdfPath) => {
  try {
    const response = await fetch(pdfPath);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    console.warn(`Could not fetch glass spec PDF: ${pdfPath}`, error);
    return null;
  }
};

// Extract unique glass products from quote items
const extractGlassProducts = (quote) => {
  const glassProducts = new Set();
  
  if (quote.items) {
    quote.items.forEach((item) => {
      const config = item.configuration || item;
      
      // Check for enhanced glass details
      if (config.glassDetails?.productCode) {
        glassProducts.add(config.glassDetails.productCode);
      }
      // Check for glass type
      else if (config.glassType) {
        glassProducts.add(config.glassType);
      }
      // Check for glass selection in various formats
      else if (config.glassSelection) {
        glassProducts.add(config.glassSelection);
      }
      // Check for glass details type
      else if (config.glassDetails?.type) {
        glassProducts.add(config.glassDetails.type);
      }
    });
  }
  
  return Array.from(glassProducts);
};

// Get glass spec PDFs for the quote
const getGlassSpecPdfs = async (quote) => {
  const glassProducts = extractGlassProducts(quote);
  const specPdfs = [];
  
  for (const product of glassProducts) {
    const specPath = GLASS_SPEC_MAPPING[product];
    if (specPath) {
      const pdfData = await fetchPdfData(specPath);
      if (pdfData) {
        specPdfs.push({
          product,
          data: pdfData,
          filename: `${product}_Specification.pdf`
        });
      }
    }
  }
  
  return specPdfs;
};

// Enhanced PDF generator with glass specifications
export const generateEnhancedQuotePDF = async (quote) => {
  try {
    // Step 1: Generate the main quote PDF
    const doc = <QuoteDocument quote={quote} />;
    const asPdf = pdf();
    asPdf.updateContainer(doc);
    const quoteBlob = await asPdf.toBlob();
    const quoteArrayBuffer = await quoteBlob.arrayBuffer();
    
    // Step 2: Get glass specification PDFs
    const glassSpecPdfs = await getGlassSpecPdfs(quote);
    
    // Step 3: If no glass specs found, just return the quote PDF
    if (glassSpecPdfs.length === 0) {
      const url = URL.createObjectURL(quoteBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
    
    // Step 4: Merge quote PDF with glass specification PDFs
    
    const mergedPdf = await PDFDocument.create();
    
    // Add quote PDF pages
    const quotePdf = await PDFDocument.load(quoteArrayBuffer);
    const quotePages = await mergedPdf.copyPages(quotePdf, quotePdf.getPageIndices());
    quotePages.forEach((page) => mergedPdf.addPage(page));
    
    // Add a separator page for glass specifications
    if (glassSpecPdfs.length > 0) {
      const separatorPage = mergedPdf.addPage();
      const { width, height } = separatorPage.getSize();
      
      // Add title for glass specifications section
      separatorPage.drawText('Glass Performance Specifications', {
        x: 50,
        y: height - 100,
        size: 24,
        color: rgb(0.1, 0.5, 0.8)
      });
      
      separatorPage.drawText('Professional glass technical data sheets for your selected products', {
        x: 50,
        y: height - 140,
        size: 14,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      // List the included glass products
      let yPosition = height - 180;
      glassSpecPdfs.forEach((spec, index) => {
        separatorPage.drawText(`• ${spec.product} - Technical Specification`, {
          x: 70,
          y: yPosition - (index * 25),
          size: 12,
          color: rgb(0.2, 0.2, 0.2)
        });
      });
    }
    
    // Add glass specification PDFs
    for (const spec of glassSpecPdfs) {
      try {
        const specPdf = await PDFDocument.load(spec.data);
        const specPages = await mergedPdf.copyPages(specPdf, specPdf.getPageIndices());
        specPages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        console.warn(`Failed to add spec PDF for ${spec.product}:`, error);
      }
    }
    
    // Step 5: Generate final merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const finalBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    
    // Step 6: Download the merged PDF
    const url = URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = url;
    
    // Enhanced filename to indicate glass specs included
    const glassCount = glassSpecPdfs.length;
    const filename = `Quote_${quote.quoteNumber}_with_${glassCount}_Glass_Specs_${new Date().toISOString().split('T')[0]}.pdf`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating enhanced PDF:', error);
    
    // Fallback to basic PDF generation
    try {
      const doc = <QuoteDocument quote={quote} />;
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (fallbackError) {
      console.error('Fallback PDF generation also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

// Export both functions for flexibility
export { generateQuotePDF } from './pdfGenerator';
export default generateEnhancedQuotePDF; 