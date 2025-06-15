# Pre-Qualification Documents Directory

This directory contains pre-qualification PDF documents for window and door systems that will be automatically included in generated quotes.

## Naming Convention

Files should be named using the format: `brand-systemmodel.pdf`

### Examples:
- `alumil-s650.pdf` → Alumil SUPREME S650 system
- `alumil-m630.pdf` → Alumil SMARTIA M630 system
- `schuco-aws75.pdf` → Schüco AWS 75 system

## Currently Mapped Systems

The following systems are configured to include pre-q documentation:

### Alumil Systems
- `alumil-s650.pdf` → SUPREME S650
- `alumil-m630.pdf` → SMARTIA M630  
- `alumil-m11000.pdf` → SMARTIA M11000
- `alumil-visoglide.pdf` → Visoglide

### Schüco Systems
- `schuco-aws75.pdf` → AWS 75
- `schuco-ads90.pdf` → ADS 90
- `schuco-asi80.pdf` → ASI 80

## Adding New Systems

To add pre-qualification documents for a new system:

1. **Add the PDF file** to this directory using the naming convention
2. **Update the mapping** in `server/routes/pdfGeneration.js`:
   ```javascript
   const PRE_Q_PDF_MAPPING = {
     // Add your system here
     'brand-systemmodel': 'filename.pdf',
   };
   ```

## File Requirements

- **Format**: PDF only
- **Size**: Recommended under 10MB per file
- **Content**: Official system documentation, performance data, certifications
- **Quality**: Professional documentation suitable for client presentation

## How It Works

When a quote is generated:
1. System extracts brand and system model from quote items
2. Normalizes to lowercase format (e.g., "Alumil SMARTIA S650" → "alumil-s650" for SUPREME)
3. Looks up corresponding PDF file in this directory
4. Includes found PDFs in the final quote document with professional separator pages

## PDF Integration Order

In the final quote document:
1. **Original Quote** (pricing, specifications)
2. **Pre-Qualification Documents** (system documentation) - Orange section header
3. **Glass Specifications** (glass technical data) - Blue section header

## Troubleshooting

- **File not found**: Check filename matches exactly (case-sensitive)
- **System not detected**: Verify mapping in `PRE_Q_PDF_MAPPING`
- **PDF corruption**: Ensure PDF files are valid and not corrupted

## Health Check

Check PDF service status: `GET /api/pdf/pdf-health`
- Shows count of available pre-q documents
- Lists all supported systems 