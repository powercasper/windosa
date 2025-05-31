const PDFDocument = require('pdfkit');

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Helper function to draw a door panel
function drawDoorPanel(doc, x, y, width, height, isFixed = false, direction = null) {
  // Draw panel rectangle with shadow
  doc.save()
     .fillColor('#E8E8E8')
     .rect(x + 3, y + 3, width, height)
     .fill()
     .restore();

  // Draw panel rectangle
  doc.rect(x, y, width, height)
     .lineWidth(2)
     .strokeColor(isFixed ? '#666666' : '#000000')
     .fillColor(isFixed ? '#F5F5F5' : '#FFFFFF')
     .fillAndStroke();

  // If it's a sliding panel, draw direction arrow
  if (!isFixed && direction) {
    const arrowY = y + height / 2;
    const arrowSize = Math.min(width, height) * 0.15;
    
    doc.strokeColor('#2196F3') // Blue color for arrows
       .lineWidth(1.5);

    if (direction === 'left') {
      // Draw left arrow with multiple lines for better visibility
      doc.moveTo(x + width * 0.7, arrowY - arrowSize)
         .lineTo(x + width * 0.3, arrowY)
         .lineTo(x + width * 0.7, arrowY + arrowSize)
         .stroke();
      // Add a second arrow line
      doc.moveTo(x + width * 0.6, arrowY - arrowSize * 0.7)
         .lineTo(x + width * 0.2, arrowY)
         .lineTo(x + width * 0.6, arrowY + arrowSize * 0.7)
         .stroke();
    } else {
      // Draw right arrow with multiple lines for better visibility
      doc.moveTo(x + width * 0.3, arrowY - arrowSize)
         .lineTo(x + width * 0.7, arrowY)
         .lineTo(x + width * 0.3, arrowY + arrowSize)
         .stroke();
      // Add a second arrow line
      doc.moveTo(x + width * 0.4, arrowY - arrowSize * 0.7)
         .lineTo(x + width * 0.8, arrowY)
         .lineTo(x + width * 0.4, arrowY + arrowSize * 0.7)
         .stroke();
    }
  }

  // Add panel label
  doc.fontSize(8)
     .fillColor('#333333')
     .text(isFixed ? 'Fixed' : `Sliding ${direction === 'left' ? '←' : '→'}`,
           x + width/2,
           y + height - 15,
           { width: width, align: 'center' });
}

// Helper function to draw a window panel
function drawWindowPanel(doc, x, y, width, height, operationType) {
  // Draw shadow
  doc.save()
     .fillColor('#E8E8E8')
     .rect(x + 3, y + 3, width, height)
     .fill()
     .restore();

  // Draw panel rectangle
  doc.rect(x, y, width, height)
     .lineWidth(2)
     .strokeColor('#000000')
     .fillColor('#FFFFFF')
     .fillAndStroke();

  // Draw operation type indicator
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const size = Math.min(width, height) * 0.25;

  doc.strokeColor('#2196F3') // Blue color for operation indicators
     .lineWidth(1.5);

  switch (operationType) {
    case 'Tilt & Turn':
      // Draw more sophisticated tilt and turn indicators
      doc.circle(centerX, centerY, size / 2)
         .stroke()
         .moveTo(centerX - size / 2, centerY)
         .lineTo(centerX + size / 2, centerY)
         .moveTo(centerX, centerY - size / 2)
         .lineTo(centerX, centerY + size / 2)
         .stroke();
      // Add curved arrow
      doc.arc(centerX, centerY, size * 0.7, -Math.PI / 4, Math.PI / 4)
         .stroke();
      break;
    case 'Casement':
      // Draw enhanced swing arc with arrow
      doc.arc(x, y + height / 2, size * 1.2, -Math.PI / 2, Math.PI / 2)
         .stroke()
         // Add arrowhead
         .moveTo(x + size * 0.8, y + height * 0.8)
         .lineTo(x + size * 1.2, y + height / 2)
         .lineTo(x + size * 0.8, y + height * 0.2)
         .stroke();
      break;
    case 'Awning':
      // Draw enhanced bottom-hinged arrows
      const arrowBaseY = y + height * 0.8;
      doc.moveTo(x + width * 0.2, arrowBaseY)
         .lineTo(x + width * 0.5, y + height * 0.5)
         .lineTo(x + width * 0.8, arrowBaseY)
         .stroke()
         // Add arc to indicate hinge
         .arc(x + width / 2, arrowBaseY, width * 0.3, Math.PI, 0)
         .stroke();
      break;
    case 'Fixed':
      // Draw enhanced fixed panel indicator
      doc.moveTo(x + width * 0.2, y + height * 0.2)
         .lineTo(x + width * 0.8, y + height * 0.8)
         .moveTo(x + width * 0.8, y + height * 0.2)
         .lineTo(x + width * 0.2, y + height * 0.8)
         .stroke();
      break;
  }

  // Add panel label
  doc.fontSize(8)
     .fillColor('#333333')
     .text(operationType,
           x + width/2,
           y + height - 15,
           { width: width, align: 'center' });
}

// Helper function to draw dimensions
function drawDimensions(doc, x, y, width, height, dimensions) {
  const arrowSize = 5;
  doc.strokeColor('#666666')
     .lineWidth(1);

  // Width dimension
  doc.moveTo(x, y + height + 20)
     .lineTo(x + width, y + height + 20)
     .stroke();
  // Width arrows
  doc.moveTo(x, y + height + 20 - arrowSize)
     .lineTo(x, y + height + 20 + arrowSize)
     .moveTo(x + width, y + height + 20 - arrowSize)
     .lineTo(x + width, y + height + 20 + arrowSize)
     .stroke();
  // Width text
  doc.fontSize(10)
     .fillColor('#666666')
     .text(`${dimensions.width}"`,
           x + width/2,
           y + height + 25,
           { width: width, align: 'center' });

  // Height dimension
  doc.moveTo(x + width + 20, y)
     .lineTo(x + width + 20, y + height)
     .stroke();
  // Height arrows
  doc.moveTo(x + width + 20 - arrowSize, y)
     .lineTo(x + width + 20 + arrowSize, y)
     .moveTo(x + width + 20 - arrowSize, y + height)
     .lineTo(x + width + 20 + arrowSize, y + height)
     .stroke();
  // Height text
  doc.fontSize(10)
     .fillColor('#666666')
     .text(`${dimensions.height}"`,
           x + width + 25,
           y + height/2,
           { width: 50, align: 'left' });
}

// Helper function to draw an entrance door
function drawEntranceDoor(doc, x, y, width, height, config) {
  const doorWidth = config.dimensions.width;
  const doorHeight = config.dimensions.height;
  const totalWidth = (config.leftSidelight?.enabled ? config.leftSidelight.width : 0) +
                    doorWidth +
                    (config.rightSidelight?.enabled ? config.rightSidelight.width : 0);
  const totalHeight = doorHeight + (config.transom?.enabled ? config.transom.height : 0);

  // Calculate scale to fit the drawing in the available space
  const scale = Math.min(width / totalWidth, height / totalHeight);
  const scaledWidth = totalWidth * scale;
  const scaledHeight = totalHeight * scale;
  const startX = x + (width - scaledWidth) / 2;
  const startY = y + (height - scaledHeight) / 2;
  const scaledDoorWidth = doorWidth * scale;
  const scaledDoorHeight = doorHeight * scale;
  const scaledTransomHeight = config.transom?.enabled ? config.transom.height * scale : 0;

  // Draw shadow
  doc.save()
     .fillColor('#E8E8E8')
     .rect(startX + 3, startY + 3, scaledWidth, scaledHeight)
     .fill()
     .restore();

  // Helper function to draw a panel
  const drawPanel = (panelX, panelY, panelWidth, panelHeight, isFixed = true) => {
    doc.rect(panelX, panelY, panelWidth, panelHeight)
       .lineWidth(2)
       .strokeColor(isFixed ? '#666666' : '#000000')
       .fillColor(isFixed ? '#F5F5F5' : '#FFFFFF')
       .fillAndStroke();
  };

  let currentX = startX;

  // Draw transom if enabled
  if (config.transom?.enabled) {
    drawPanel(startX, startY, scaledWidth, scaledTransomHeight);
    doc.fontSize(8)
       .fillColor('#333333')
       .text('Transom',
             startX,
             startY - 15,
             { width: scaledWidth, align: 'center' });
  }

  const doorStartY = startY + (config.transom?.enabled ? scaledTransomHeight : 0);

  // Draw left sidelight if enabled
  if (config.leftSidelight?.enabled) {
    const scaledSidelightWidth = config.leftSidelight.width * scale;
    drawPanel(currentX, doorStartY, scaledSidelightWidth, scaledDoorHeight);
    doc.fontSize(8)
       .fillColor('#333333')
       .text('Left Sidelight',
             currentX,
             doorStartY + scaledDoorHeight + 5,
             { width: scaledSidelightWidth, align: 'center' });
    currentX += scaledSidelightWidth;
  }

  // Draw door panel(s)
  if (config.openingType === 'Double Door') {
    // Draw double door
    const halfDoorWidth = scaledDoorWidth / 2;
    
    // Left door
    drawPanel(currentX, doorStartY, halfDoorWidth, scaledDoorHeight, false);
    // Right door
    drawPanel(currentX + halfDoorWidth, doorStartY, halfDoorWidth, scaledDoorHeight, false);

    // Draw swing indicators
    doc.strokeColor('#2196F3')
       .lineWidth(1.5);

    // Left door swing arc
    const arcRadius = halfDoorWidth * 0.8;
    doc.arc(currentX, doorStartY + scaledDoorHeight, arcRadius, -Math.PI/2, 0)
       .stroke();
    // Right door swing arc
    doc.arc(currentX + scaledDoorWidth, doorStartY + scaledDoorHeight, arcRadius, -Math.PI, -Math.PI/2)
       .stroke();

    doc.fontSize(8)
       .fillColor('#333333')
       .text('Double Door',
             currentX,
             doorStartY + scaledDoorHeight + 5,
             { width: scaledDoorWidth, align: 'center' });

  } else if (config.openingType === 'Pivot Door') {
    drawPanel(currentX, doorStartY, scaledDoorWidth, scaledDoorHeight, false);
    
    // Draw pivot point and swing indicator
    const centerX = currentX + scaledDoorWidth / 2;
    doc.strokeColor('#2196F3')
       .lineWidth(1.5)
       .circle(centerX, doorStartY + scaledDoorHeight / 2, 3)
       .fill()
       .arc(centerX, doorStartY + scaledDoorHeight / 2, scaledDoorWidth * 0.4, -Math.PI/4, Math.PI/4)
       .stroke();

    doc.fontSize(8)
       .fillColor('#333333')
       .text('Pivot Door',
             currentX,
             doorStartY + scaledDoorHeight + 5,
             { width: scaledDoorWidth, align: 'center' });

  } else {
    // Single door
    drawPanel(currentX, doorStartY, scaledDoorWidth, scaledDoorHeight, false);
    
    // Draw swing indicator
    const isLeftHand = config.swingDirection?.toLowerCase().includes('left');
    const arcRadius = scaledDoorWidth * 0.8;
    doc.strokeColor('#2196F3')
       .lineWidth(1.5);

    if (isLeftHand) {
      doc.arc(currentX, doorStartY + scaledDoorHeight, arcRadius, -Math.PI/2, 0)
         .stroke();
    } else {
      doc.arc(currentX + scaledDoorWidth, doorStartY + scaledDoorHeight, arcRadius, -Math.PI, -Math.PI/2)
         .stroke();
    }

    doc.fontSize(8)
       .fillColor('#333333')
       .text('Single Door',
             currentX,
             doorStartY + scaledDoorHeight + 5,
             { width: scaledDoorWidth, align: 'center' });
  }

  currentX += scaledDoorWidth;

  // Draw right sidelight if enabled
  if (config.rightSidelight?.enabled) {
    const scaledSidelightWidth = config.rightSidelight.width * scale;
    drawPanel(currentX, doorStartY, scaledSidelightWidth, scaledDoorHeight);
    doc.fontSize(8)
       .fillColor('#333333')
       .text('Right Sidelight',
             currentX,
             doorStartY + scaledDoorHeight + 5,
             { width: scaledSidelightWidth, align: 'center' });
  }

  // Draw dimensions
  drawDimensions(doc, startX, startY, scaledWidth, scaledHeight, {
    width: totalWidth,
    height: totalHeight
  });

  // Add additional dimension lines for individual components
  doc.strokeColor('#666666')
     .lineWidth(0.5)
     .fontSize(8);

  // Door width dimension
  const doorX = startX + (config.leftSidelight?.enabled ? config.leftSidelight.width * scale : 0);
  doc.moveTo(doorX, startY - 10)
     .lineTo(doorX + scaledDoorWidth, startY - 10)
     .stroke()
     .text(`Door: ${doorWidth}"`,
           doorX,
           startY - 25,
           { width: scaledDoorWidth, align: 'center' });

  // Sidelight dimensions
  if (config.leftSidelight?.enabled) {
    doc.moveTo(startX, startY - 5)
       .lineTo(doorX, startY - 5)
       .stroke()
       .text(`${config.leftSidelight.width}"`,
             startX,
             startY - 20,
             { width: config.leftSidelight.width * scale, align: 'center' });
  }
  if (config.rightSidelight?.enabled) {
    const rightX = doorX + scaledDoorWidth;
    doc.moveTo(rightX, startY - 5)
       .lineTo(rightX + config.rightSidelight.width * scale, startY - 5)
       .stroke()
       .text(`${config.rightSidelight.width}"`,
             rightX,
             startY - 20,
             { width: config.rightSidelight.width * scale, align: 'center' });
  }

  // Transom height dimension
  if (config.transom?.enabled) {
    doc.moveTo(startX - 5, startY)
       .lineTo(startX - 5, startY + scaledTransomHeight)
       .stroke()
       .text(`${config.transom.height}"`,
             startX - 25,
             startY,
             { width: 20, align: 'right' });
  }
}

function generateQuotePDF(quote) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50,
        bufferPages: true
      });

      // Collect PDF chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cover page
      doc.fontSize(24)
         .text('Window & Door Quote', { align: 'center' })
         .moveDown();

      // Quote Details
      doc.fontSize(12)
         .text(`Quote Number: ${quote.quoteNumber}`, { continued: true })
         .text(`Date: ${new Date(quote.date).toLocaleDateString()}`, { align: 'right' })
         .moveDown(2);

      // Summary of items
      doc.fontSize(14)
         .text('Quote Summary', { underline: true })
         .moveDown();

      quote.items.forEach((item, index) => {
        doc.fontSize(12)
           .text(`${index + 1}. ${item.configuration.brand} ${item.configuration.systemModel} - ${item.configuration.systemType}`, { continued: true })
           .text(formatCurrency(item.pricing.total), { align: 'right' });
      });

      doc.moveDown()
         .fontSize(16)
         .text('Grand Total:', { continued: true })
         .text(formatCurrency(quote.totals.total), { align: 'right' })
         .moveDown(2);

      // Items - each on a new page
      quote.items.forEach((item, index) => {
        doc.addPage();

        // Item Header
        doc.fontSize(16)
           .text(`Item ${index + 1} - ${item.configuration.brand} ${item.configuration.systemModel}`, { continued: true })
           .text(formatCurrency(item.pricing.total), { align: 'right' })
           .moveDown();

        // Draw configuration visualization
        const startY = doc.y;
        const drawingWidth = 400; // Increased width
        const drawingHeight = 250; // Increased height
        const drawingX = 50;

        // Add drawing title
        doc.fontSize(12)
           .fillColor('#333333')
           .text('Configuration Drawing:', drawingX, startY)
           .moveDown(0.5);

        if (item.configuration.systemType === 'Sliding Doors') {
          const panelWidth = drawingWidth / item.configuration.panels.length;
          
          // Draw panels
          item.configuration.panels.forEach((panel, i) => {
            drawDoorPanel(
              doc,
              drawingX + (i * panelWidth),
              startY + 20,
              panelWidth,
              drawingHeight,
              panel.type === 'Fixed',
              panel.type === 'Sliding' ? panel.direction : null
            );
          });

          // Draw dimensions
          drawDimensions(doc, drawingX, startY + 20, drawingWidth, drawingHeight, item.configuration.dimensions);

        } else if (item.configuration.systemType === 'Windows') {
          const panelWidth = drawingWidth / item.configuration.panels.length;
          
          // Draw panels
          item.configuration.panels.forEach((panel, i) => {
            drawWindowPanel(
              doc,
              drawingX + (i * panelWidth),
              startY + 20,
              panelWidth,
              drawingHeight,
              panel.operationType
            );
          });

          // Draw dimensions
          drawDimensions(doc, drawingX, startY + 20, drawingWidth, drawingHeight, item.configuration.dimensions);
        } else if (item.configuration.systemType === 'Entrance Doors') {
          // Draw entrance door configuration
          drawEntranceDoor(
            doc,
            drawingX,
            startY + 20,
            drawingWidth,
            drawingHeight,
            item.configuration
          );
        }

        // Move to below the drawing
        doc.y = startY + drawingHeight + 80;

        // Two-column layout for details
        const leftColumnX = 50;
        const rightColumnX = 300;
        const startDetailsY = doc.y;

        // Left column
        doc.x = leftColumnX;
        doc.y = startDetailsY;
        
        // System Details
        doc.fontSize(12)
           .fillColor('#000000')
           .text('System Details:', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(10)
           .text(`Type: ${item.configuration.systemType}`)
           .text(`Glass Type: ${item.configuration.glassType}`)
           .text(`Operation: ${item.configuration.operationType || 'N/A'}`);

        if (item.configuration.panels) {
          doc.moveDown(0.5).text('Panel Configuration:');
          item.configuration.panels.forEach((panel, idx) => {
            doc.text(`  Panel ${idx + 1}: ${panel.type || panel.operationType}${panel.direction ? ` (${panel.direction})` : ''}`);
          });
        }

        // Right column
        doc.x = rightColumnX;
        doc.y = startDetailsY;

        // Finish Details
        doc.fontSize(12)
           .text('Finish Details:', { underline: true })
           .moveDown(0.5);
        
        doc.fontSize(10)
           .text(`Type: ${item.configuration.finish.type}`)
           .text(`Style: ${item.configuration.finish.color}`)
           .text(`RAL Color: ${item.configuration.finish.ralColor || 'N/A'}`);

        // Cost Breakdown (below both columns)
        doc.x = leftColumnX;
        doc.y = Math.max(doc.y, startDetailsY + 150);
        
        doc.moveDown()
           .fontSize(12)
           .text('Cost Breakdown:', { underline: true })
           .moveDown(0.5);

        // Create a table-like structure for cost breakdown
        const costData = [
          ['System Cost:', formatCurrency(item.pricing.systemCost)],
          ['Glass Cost:', formatCurrency(item.pricing.glassCost)],
          ['Labor Cost:', formatCurrency(item.pricing.laborCost)],
          ['Total:', formatCurrency(item.pricing.total)]
        ];

        costData.forEach((row, i) => {
          doc.fontSize(10)
             .text(row[0], leftColumnX, doc.y, { continued: true, width: 200 })
             .text(row[1], { align: 'right' });
        });
      });

      // Terms and Conditions page
      doc.addPage();
      doc.fontSize(14)
         .text('Terms and Conditions', { underline: true })
         .moveDown();

      doc.fontSize(10)
         .text('1. All prices are subject to change without notice.')
         .text('2. Quote valid for 30 days from the date of issue.')
         .text('3. Installation costs may vary based on site conditions.')
         .text('4. Lead times are approximate and subject to change.')
         .text('5. Warranty information available upon request.')
         .moveDown(2)
         .text('For any questions or concerns, please contact our sales team.')
         .moveDown()
         .text('Thank you for choosing our services!', { align: 'center' });

      // Footer with page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .fillColor('#666666')
           .text(
             `Page ${i + 1} of ${pageCount}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = generateQuotePDF; 