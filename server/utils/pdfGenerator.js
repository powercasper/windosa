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
      doc.fontSize(20)
         .text('Window & Door Quote', { align: 'center' })
         .moveDown();

      // Quote Details
      doc.fontSize(12)
         .text(`Quote Number: ${quote.quoteNumber}`)
         .text(`Date: ${new Date(quote.date).toLocaleDateString()}`)
         .moveDown();

      // Items
      doc.fontSize(14)
         .text('Items', { underline: true })
         .moveDown();

      quote.items.forEach((item, index) => {
        doc.fontSize(12)
           .text(`Item ${index + 1}`, { underline: true })
           .moveDown();

        // Configuration Details
        doc.text(`Brand: ${item.configuration.brand}`)
           .text(`System Type: ${item.configuration.systemType}`)
           .text(`Model: ${item.configuration.systemModel}`);

        if (item.configuration.operationType) {
          doc.text(`Operation Type: ${item.configuration.operationType}`);
        }

        doc.text(`Dimensions: ${item.configuration.dimensions.width}" × ${item.configuration.dimensions.height}"`)
           .text(`Glass Type: ${item.configuration.glassType}`)
           .text(`Finish: ${item.configuration.finish.type} - ${item.configuration.finish.color}`)
           .moveDown();

        // Item Cost Breakdown
        doc.text('Cost Breakdown:')
           .text(`  System Cost: ${formatCurrency(item.pricing.systemCost)}`)
           .text(`  Glass Package: ${formatCurrency(item.pricing.glassCost)}`)
           .text(`  Labor: ${formatCurrency(item.pricing.laborCost)}`)
           .text(`  Item Total: ${formatCurrency(item.pricing.total)}`)
           .moveDown();
      });

      // Total Cost Breakdown
      doc.fontSize(14)
         .text('Total Cost Breakdown', { underline: true })
         .moveDown();

      doc.fontSize(12)
         .text(`Total System Cost: ${formatCurrency(quote.totals.systemCost)}`)
         .text(`Total Glass Package: ${formatCurrency(quote.totals.glassCost)}`)
         .text(`Total Labor: ${formatCurrency(quote.totals.laborCost)}`)
         .moveDown();

      // Grand Total
      doc.fontSize(16)
         .text(`Grand Total: ${formatCurrency(quote.totals.total)}`, { underline: true })
         .moveDown();

      // Terms and Conditions
      doc.fontSize(10)
         .text('Terms and Conditions:', { underline: true })
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