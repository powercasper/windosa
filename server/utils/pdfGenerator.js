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

      // Configuration Details
      doc.fontSize(14)
         .text('Configuration Details', { underline: true })
         .moveDown();

      doc.fontSize(12)
         .text(`Brand: ${quote.configuration.brand}`)
         .text(`System Type: ${quote.configuration.systemType}`)
         .text(`Model: ${quote.configuration.systemModel}`);

      if (quote.configuration.operationType) {
        doc.text(`Operation Type: ${quote.configuration.operationType}`);
      }

      doc.text(`Dimensions: ${quote.configuration.dimensions.width}" × ${quote.configuration.dimensions.height}"`)
         .text(`Glass Type: ${quote.configuration.glassType}`)
         .text(`Finish: ${quote.configuration.finish.type} - ${quote.configuration.finish.color}`)
         .moveDown();

      // Cost Breakdown
      doc.fontSize(14)
         .text('Cost Breakdown', { underline: true })
         .moveDown();

      doc.fontSize(12)
         .text(`System Cost: ${formatCurrency(quote.pricing.systemCost)}`)
         .text(`Glass Package: ${formatCurrency(quote.pricing.glassCost)}`)
         .text(`Labor: ${formatCurrency(quote.pricing.laborCost)}`)
         .moveDown();

      // Total
      doc.fontSize(16)
         .text(`Total Price: ${formatCurrency(quote.pricing.total)}`, { underline: true })
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