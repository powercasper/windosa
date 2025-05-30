const PDFDocument = require('pdfkit');

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function generateQuotePDF(quote) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50
      });

      // Collect PDF chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(24)
         .text('Window & Door Quote', { align: 'center' })
         .moveDown();

      // Quote Details
      doc.fontSize(12)
         .text(`Quote Number: ${quote.quoteNumber}`, { continued: true })
         .text(`Date: ${new Date(quote.date).toLocaleDateString()}`, { align: 'right' })
         .moveDown(2);

      // Items
      quote.items.forEach((item, index) => {
        // Item Header with Price
        doc.fontSize(16)
           .text(`Item ${index + 1}`, { continued: true })
           .text(formatCurrency(item.pricing.total), { align: 'right' })
           .moveDown();

        // Two-column layout for each item
        const startY = doc.y;
        let maxY = startY;

        // Left column - System Details
        doc.fontSize(14)
           .text('System Details', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(12)
           .text(`${item.configuration.brand} - ${item.configuration.systemModel}`)
           .text(`Type: ${item.configuration.systemType}`);

        // Handle window panes if present
        if (item.configuration.systemType === 'Windows' && item.configuration.panels) {
          doc.moveDown(0.5)
             .text('Panes:');
          item.configuration.panels.forEach((panel, idx) => {
            doc.text(`  Pane ${idx + 1}: ${panel.width}" wide - ${panel.operationType}`);
          });
        } else if (item.configuration.operationType) {
          doc.text(`Operation: ${item.configuration.operationType}`);
        }

        // Dimensions
        doc.moveDown(0.5)
           .text('Dimensions')
           .text(`  Width: ${item.configuration.dimensions.width}"`)
           .text(`  Height: ${item.configuration.dimensions.height}"`);

        const leftColumnY = doc.y;

        // Right column - Finish Details
        doc.y = startY;
        doc.x = 350;

        doc.fontSize(14)
           .text('Finish Details', { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .text(`Type: ${item.configuration.finish.type}`)
           .text(`Style: ${item.configuration.finish.color}`)
           .text(`RAL Color: ${item.configuration.finish.ralColor || 'N/A'}`);

        const rightColumnY = doc.y;

        // Update maxY for the taller column
        maxY = Math.max(leftColumnY, rightColumnY);

        // Move to the end of the taller column and add spacing
        doc.y = maxY + 30;

        // Add a divider between items
        if (index < quote.items.length - 1) {
          doc.moveTo(50, doc.y)
             .lineTo(550, doc.y)
             .stroke()
             .moveDown(2);
        }
      });

      // Grand Total
      doc.moveDown()
         .fontSize(18)
         .text('Grand Total:', { continued: true })
         .text(formatCurrency(quote.totals.total), { align: 'right' })
         .moveDown(2);

      // Terms and Conditions
      doc.fontSize(10)
         .text('Terms and Conditions:', { underline: true })
         .moveDown(0.5)
         .fontSize(8)
         .text('1. All prices are subject to change without notice.')
         .text('2. Quote valid for 30 days from the date of issue.')
         .text('3. Installation costs may vary based on site conditions.')
         .text('4. Lead times are approximate and subject to change.')
         .text('5. Warranty information available upon request.')
         .moveDown();

      // Footer
      doc.fontSize(8)
         .text('Thank you for choosing our services!', { align: 'center' })
         .text('For any questions, please contact our sales team.', { align: 'center' });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = generateQuotePDF; 