const express = require('express');
const router = express.Router();
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

// Glass product code to PDF file mapping (server-side paths)
const GLASS_SPEC_MAPPING = {
  'SKN 184': 'SKN-184-spec.pdf',
  'SKN184': 'SKN-184-spec.pdf',
  'SKN 154': 'SKN-154-spec.pdf', 
  'SKN154': 'SKN-154-spec.pdf',
  '70/33': '70-33-spec.pdf',
  '70-33': '70-33-spec.pdf',
  '61-29': '61-29-spec.pdf',
  '61/29': '61-29-spec.pdf',
  // Alternative mappings for glass database entries
  'SKN 184 High Performance': 'SKN-184-spec.pdf',
  'SKN 154 Balanced Performance': 'SKN-154-spec.pdf',
  'XTREME 70/33 Maximum Light': '70-33-spec.pdf',
  'XTREME 61-29 Balanced': '61-29-spec.pdf',
  'XTREME 50-22 Solar Control': '50-22-spec.pdf' // Add when available
};

// Helper function to extract glass products from quote items
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

// Helper function to load glass spec PDFs
const loadGlassSpecPdfs = async (glassProducts) => {
  const specPdfs = [];
  
  for (const product of glassProducts) {
    const filename = GLASS_SPEC_MAPPING[product];
    if (filename) {
      try {
        const filePath = path.join(__dirname, '../assets/glass', filename);
        const pdfData = await fs.readFile(filePath);
        specPdfs.push({
          product,
          data: pdfData,
          filename: filename
        });
      } catch (error) {
        console.warn(`Could not load glass spec PDF for ${product}:`, error.message);
      }
    }
  }
  
  return specPdfs;
};

// Enhanced PDF generation endpoint
router.post('/generate-enhanced-pdf', async (req, res) => {
  try {
    console.log('Server-side PDF generation requested');
    
    const { quote, quotePdfBuffer } = req.body;
    
    if (!quotePdfBuffer) {
      return res.status(400).json({ error: 'Quote PDF buffer is required' });
    }
    
    // Convert base64 PDF buffer back to binary
    const quoteBuffer = Buffer.from(quotePdfBuffer, 'base64');
    
    // Extract glass products from quote
    const glassProducts = extractGlassProducts(quote);
    console.log('Glass products detected:', glassProducts);
    
    // Load glass specification PDFs
    const glassSpecPdfs = await loadGlassSpecPdfs(glassProducts);
    console.log(`Loaded ${glassSpecPdfs.length} glass specification PDFs`);
    
    // If no glass specs, return original quote PDF
    if (glassSpecPdfs.length === 0) {
      return res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf"`
      }).send(quoteBuffer);
    }
    
    // Create merged PDF
    const mergedPdf = await PDFDocument.create();
    
    // Add quote PDF pages
    const quotePdf = await PDFDocument.load(quoteBuffer);
    const quotePages = await mergedPdf.copyPages(quotePdf, quotePdf.getPageIndices());
    quotePages.forEach((page) => mergedPdf.addPage(page));
    
    // Add separator page for glass specifications
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
    
    // Add glass specification PDFs
    for (const spec of glassSpecPdfs) {
      try {
        const specPdf = await PDFDocument.load(spec.data);
        const specPages = await mergedPdf.copyPages(specPdf, specPdf.getPageIndices());
        specPages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        console.warn(`Failed to add spec PDF for ${spec.product}:`, error.message);
      }
    }
    
    // Generate final merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Enhanced filename to indicate glass specs included
    const glassCount = glassSpecPdfs.length;
    const filename = `Quote_${quote.quoteNumber}_with_${glassCount}_Glass_Specs_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Send the merged PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }).send(Buffer.from(mergedPdfBytes));
    
    console.log(`Successfully generated enhanced PDF with ${glassCount} glass specifications`);
    
  } catch (error) {
    console.error('Error in server-side PDF generation:', error);
    res.status(500).json({ 
      error: 'Failed to generate enhanced PDF',
      details: error.message 
    });
  }
});

// Health check endpoint for PDF service
router.get('/pdf-health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'PDF Generation',
    glassSpecsAvailable: Object.keys(GLASS_SPEC_MAPPING).length
  });
});

module.exports = router; 