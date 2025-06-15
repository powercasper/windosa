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

// Pre-qualification PDF mapping (brand-systemmodel format)
const PRE_Q_PDF_MAPPING = {
  // Alumil Systems - S650 is SUPREME, not SMARTIA
  'alumil-s650': 'alumil-s650.pdf',           // SUPREME S650
  'alumil-supreme': 'alumil-s650.pdf',        // Alternative naming
  'alumil-smartia-m630': 'alumil-m630.pdf',  // SMARTIA M630
  'alumil-m630': 'alumil-m630.pdf',          // Alternative naming
  'alumil-smartia-m11000': 'alumil-m11000.pdf', // SMARTIA M11000
  'alumil-m11000': 'alumil-m11000.pdf',      // Alternative naming
  'alumil-visoglide': 'alumil-visoglide.pdf',
  
  // Schuco Systems  
  'schuco-aws-75': 'schuco-aws75.pdf',
  'schuco-ads-90': 'schuco-ads90.pdf',
  'schuco-asi-80': 'schuco-asi80.pdf',
  
  // Test system for verification
  'test-test-system': 'test-system.pdf',
  
  // Add more systems as needed
  // Format: 'brand-systemmodel': 'filename.pdf'
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

// Helper function to extract system models from quote items for pre-q PDFs
const extractSystemModels = (quote) => {
  const systemModels = new Set();
  
  if (quote.items) {
    quote.items.forEach((item) => {
      const config = item.configuration || item;
      
      if (config.brand && config.systemModel) {
        // Create the key format: brand-systemmodel (lowercase, normalized)
        const brand = config.brand.toLowerCase().replace(/\s+/g, '-');
        
        // Normalize system model with specific handling for Alumil systems
        let systemModel = config.systemModel.toLowerCase();
        
        // Special handling for Alumil systems
        if (brand === 'alumil') {
          // S650 is SUPREME, not SMARTIA
          if (systemModel.includes('s650')) {
            systemModel = 's650';
          }
          // Handle other SMARTIA systems
          else if (systemModel.includes('smartia')) {
            systemModel = systemModel.replace(/smartia\s+/i, ''); // Remove "SMARTIA" prefix
            systemModel = systemModel.replace(/\s+/g, '-'); // Replace spaces
          }
          // Handle other systems
          else {
            systemModel = systemModel.replace(/\s+/g, '-');
          }
        } else {
          // For non-Alumil brands, use standard normalization
          systemModel = systemModel.replace(/\s+/g, '-');
        }
        
        const systemKey = `${brand}-${systemModel}`;
        systemModels.add(systemKey);
        
        // Also store original values for display
        systemModels.add({
          key: systemKey,
          brand: config.brand,
          systemModel: config.systemModel,
          displayName: `${config.brand} ${config.systemModel}`
        });
      }
    });
  }
  
  // Filter out string keys, keep only objects with display info
  return Array.from(systemModels).filter(item => typeof item === 'object');
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

// Helper function to load pre-qualification PDFs
const loadPreQPdfs = async (systemModels) => {
  const preQPdfs = [];
  
  for (const systemInfo of systemModels) {
    const filename = PRE_Q_PDF_MAPPING[systemInfo.key];
    if (filename) {
      try {
        const filePath = path.join(__dirname, '../assets/pre-q', filename);
        const pdfData = await fs.readFile(filePath);
        preQPdfs.push({
          system: systemInfo.displayName,
          key: systemInfo.key,
          data: pdfData,
          filename: filename
        });
      } catch (error) {
        console.warn(`Could not load pre-q PDF for ${systemInfo.displayName} (${systemInfo.key}):`, error.message);
      }
    } else {
      console.log(`No pre-q PDF mapping found for ${systemInfo.displayName} (${systemInfo.key})`);
    }
  }
  
  return preQPdfs;
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
    
    // Extract glass products and system models from quote
    const glassProducts = extractGlassProducts(quote);
    const systemModels = extractSystemModels(quote);
    console.log('Glass products detected:', glassProducts);
    console.log('System models detected:', systemModels.map(s => s.displayName));
    
    // Load glass specification PDFs and pre-qualification PDFs
    const glassSpecPdfs = await loadGlassSpecPdfs(glassProducts);
    const preQPdfs = await loadPreQPdfs(systemModels);
    console.log(`Loaded ${glassSpecPdfs.length} glass specification PDFs`);
    console.log(`Loaded ${preQPdfs.length} pre-qualification PDFs`);
    
    // If no glass specs or pre-q PDFs, return original quote PDF
    if (glassSpecPdfs.length === 0 && preQPdfs.length === 0) {
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
    
    // Add Pre-Qualification Documents section (if any)
    if (preQPdfs.length > 0) {
      const preQSeparatorPage = mergedPdf.addPage();
      const { width, height } = preQSeparatorPage.getSize();
      
      // Add title for pre-qualification section
      preQSeparatorPage.drawText('System Pre-Qualification Documents', {
        x: 50,
        y: height - 100,
        size: 24,
        color: rgb(0.8, 0.5, 0.1) // Orange color for pre-q section
      });
      
      preQSeparatorPage.drawText('Official system documentation and performance data for specified systems', {
        x: 50,
        y: height - 140,
        size: 14,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      // List the included system pre-q documents
      let yPosition = height - 180;
      preQPdfs.forEach((preQ, index) => {
        preQSeparatorPage.drawText(`• ${preQ.system} - Pre-Qualification Documentation`, {
          x: 70,
          y: yPosition - (index * 25),
          size: 12,
          color: rgb(0.2, 0.2, 0.2)
        });
      });
      
      // Add pre-qualification PDFs
      for (const preQ of preQPdfs) {
        try {
          const preQPdf = await PDFDocument.load(preQ.data);
          const preQPages = await mergedPdf.copyPages(preQPdf, preQPdf.getPageIndices());
          preQPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          console.warn(`Failed to add pre-q PDF for ${preQ.system}:`, error.message);
        }
      }
    }
    
    // Add Glass Specifications section (if any)
    if (glassSpecPdfs.length > 0) {
      const glassSeparatorPage = mergedPdf.addPage();
      const { width, height } = glassSeparatorPage.getSize();
      
      // Add title for glass specifications section
      glassSeparatorPage.drawText('Glass Performance Specifications', {
        x: 50,
        y: height - 100,
        size: 24,
        color: rgb(0.1, 0.5, 0.8) // Blue color for glass section
      });
      
      glassSeparatorPage.drawText('Professional glass technical data sheets for your selected products', {
        x: 50,
        y: height - 140,
        size: 14,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      // List the included glass products
      let yPosition = height - 180;
      glassSpecPdfs.forEach((spec, index) => {
        glassSeparatorPage.drawText(`• ${spec.product} - Technical Specification`, {
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
    }
    
    // Generate final merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    // Enhanced filename to indicate attachments included
    const glassCount = glassSpecPdfs.length;
    const preQCount = preQPdfs.length;
    
    let filenameComponents = [`Quote_${quote.quoteNumber}`];
    if (preQCount > 0) filenameComponents.push(`${preQCount}_PreQ_Docs`);
    if (glassCount > 0) filenameComponents.push(`${glassCount}_Glass_Specs`);
    filenameComponents.push(new Date().toISOString().split('T')[0]);
    
    const filename = filenameComponents.join('_') + '.pdf';
    
    // Send the merged PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }).send(Buffer.from(mergedPdfBytes));
    
    console.log(`Successfully generated enhanced PDF with ${preQCount} pre-qualification documents and ${glassCount} glass specifications`);
    
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
    glassSpecsAvailable: Object.keys(GLASS_SPEC_MAPPING).length,
    preQDocsAvailable: Object.keys(PRE_Q_PDF_MAPPING).length,
    supportedSystems: Object.keys(PRE_Q_PDF_MAPPING).map(key => {
      const [brand, ...systemParts] = key.split('-');
      return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${systemParts.join('-').toUpperCase()}`;
    })
  });
});

module.exports = router; 