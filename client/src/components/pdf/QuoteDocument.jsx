import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo_windo.png';
import { COMPANY_INFO } from '../../assets/logo';
import QuoteLineItem from './QuoteLineItem';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  itemPage: {
    padding: 30,
    fontSize: 10,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottom: 1,
    borderBottomColor: '#999',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  companyInfo: {
    textAlign: 'right',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 8,
    color: '#666',
    marginBottom: 1,
  },
  projectInfo: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 15,
  },
  projectSection: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1976d2',
  },
  projectDetail: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  projectLabel: {
    width: 80,
    fontSize: 8,
    color: '#666',
  },
  projectValue: {
    flex: 1,
    fontSize: 8,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
  },
  itemsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 15,
  },
  itemWrapper: {
    width: '100%',
    marginBottom: 15,
    minHeight: 350, // Minimum height to ensure item visibility
  },
  summarySection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1976d2',
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 30,
  },
  summaryColumn: {
    flex: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: '0.5pt solid #ddd',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#666',
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1pt solid #333',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  // New styles for Itemized Overview Table
  itemizedSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    border: '1pt solid #ddd',
    borderRadius: 5,
  },
  itemizedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1pt solid #333',
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ddd',
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderTop: '2pt solid #333',
    borderBottom: '1pt solid #333',
    paddingVertical: 5,
    paddingHorizontal: 3,
    backgroundColor: '#f8f8f8',
  },
  tableGrandTotalRow: {
    flexDirection: 'row',
    borderTop: '2pt solid #333',
    paddingVertical: 5,
    paddingHorizontal: 3,
    backgroundColor: '#e8f4f8',
  },
  tableCell: {
    fontSize: 8,
    paddingHorizontal: 2,
    textAlign: 'center',
  },
  tableCellLeft: {
    fontSize: 8,
    paddingHorizontal: 2,
    textAlign: 'left',
  },
  tableCellRight: {
    fontSize: 8,
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 2,
    textAlign: 'center',
  },
  tableHeaderCellLeft: {
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 2,
    textAlign: 'left',
  },
  tableHeaderCellRight: {
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  // Column widths (removed Base Price column)
  colPosition: { width: '8%' },
  colQuantity: { width: '10%' },
  colDescription: { width: '38%' },
  colLocation: { width: '14%' },
  colArea: { width: '12%' },
  colUnitPrice: { width: '18%' },
  colTotal: { width: '18%' },
  tableNote: {
    fontSize: 7,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

const QuoteDocument = ({ quote }) => {
  // Debug: log the full quote object
  console.log('[PDF] Quote data:', JSON.stringify(quote, null, 2));

  // Split items into pages (1 item per page to ensure full display)
  const splitIntoPages = (items) => {
    // Each page will have 1 item to ensure no splitting
    return items.map(item => [item]);
  };

  const itemPages = splitIntoPages(quote.items);
  const totalPages = itemPages.length + 1; // +1 for the summary page

  const {
    baseCost,
    totalAdditionalCost,
    delivery,
    subtotal,
    grandTotal,
    totalArea
  } = quote.pricing;

  const renderItemizedTable = () => {
    return (
      <View style={styles.itemizedSection}>
        <Text style={styles.itemizedTitle}>Itemized Overview</Text>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colPosition }}>Pos.</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colQuantity }}>Qty</Text>
            <Text style={{ ...styles.tableHeaderCellLeft, ...styles.colDescription }}>Description</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colLocation }}>Location</Text>
            <Text style={{ ...styles.tableHeaderCellRight, ...styles.colArea }}>Area (ft²)</Text>
            <Text style={{ ...styles.tableHeaderCellRight, ...styles.colUnitPrice }}>Unit Price*</Text>
            <Text style={{ ...styles.tableHeaderCellRight, ...styles.colTotal }}>Total</Text>
          </View>
          
          {/* Table Body */}
          {quote.items.map((item, index) => {
            const description = item.systemType === 'Windows'
              ? `${item.brand} ${item.systemModel} - ${item.panels.map(p => p.operationType).join('/')}`
              : `${item.brand} ${item.systemModel} - ${item.openingType || item.operationType}`;
            
            return (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, ...styles.colPosition }}>{String(index + 1).padStart(3, '0')}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colQuantity }}>{item.quantity || 1}</Text>
                <Text style={{ ...styles.tableCellLeft, ...styles.colDescription }}>{description}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colLocation }}>{item.location || '-'}</Text>
                <Text style={{ ...styles.tableCellRight, ...styles.colArea }}>{item.pricing.area.toFixed(1)}</Text>
                <Text style={{ ...styles.tableCellRight, ...styles.colUnitPrice }}>${item.pricing.unitPrice.toFixed(2)}</Text>
                <Text style={{ ...styles.tableCellRight, ...styles.colTotal }}>${item.pricing.finalPrice.toFixed(2)}</Text>
              </View>
            );
          })}
          
          {/* Table Totals */}
          <View style={styles.tableTotalRow}>
            <Text style={{ ...styles.tableCellLeft, width: '30%', fontWeight: 'bold' }}>{quote.items.length} Positions</Text>
            <Text style={{ ...styles.tableCell, width: '38%' }}></Text>
            <Text style={{ ...styles.tableHeaderCellRight, ...styles.colArea }}>{totalArea.toFixed(1)}</Text>
            <Text style={{ ...styles.tableCell, ...styles.colUnitPrice }}></Text>
            <Text style={{ ...styles.tableHeaderCellRight, ...styles.colTotal }}>${subtotal.toFixed(2)}</Text>
          </View>
        </View>
        <Text style={styles.tableNote}>
          * Unit Price includes proportionally distributed additional costs (tariff, shipping) with a 5% fee and product margin. Delivery is separate.
        </Text>
      </View>
    );
  };

  return (
    <Document>
      {/* Page 1: Summary Page */}
      <Page size="LETTER" style={styles.page}>
        <Header quote={quote} />
        
        {/* Itemized Table on First Page */}
        {renderItemizedTable()}

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Subtotal (Products + Margin):</Text>
                <Text style={styles.summaryValue}>${(baseCost * (1 + (quote.margin / 100))).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Additional Costs (Tariff + Shipping + 5% Fee):</Text>
                <Text style={styles.summaryValue}>${(totalAdditionalCost * 1.05).toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.summaryColumn}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Delivery Costs:</Text>
                <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
                <Text style={styles.totalValue}>
                  ${grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.pageNumber}>
          Page 1 of {totalPages}
        </Text>
      </Page>

      {/* Item Pages: Starting from page 2 */}
      {itemPages.map((pageItems, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.itemPage}>
          <Header quote={quote} />
          <View style={styles.itemsContainer}>
            {pageItems.map((item, itemIndex) => (
              <View key={item.id || itemIndex} style={styles.itemWrapper}>
                <QuoteLineItem item={item} position={pageIndex + 1} />
              </View>
            ))}
          </View>
          <Text style={styles.pageNumber}>
            Page {pageIndex + 2} of {totalPages}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

const Header = ({ quote }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Image src={logo} style={styles.logo} />
      <View>
        <Text style={styles.projectTitle}>Project Quote #{quote.quoteNumber}</Text>
        <Text style={styles.projectValue}>
          Date: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </View>
    <View style={styles.companyInfo}>
      <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
      <Text style={styles.companyDetail}>{COMPANY_INFO.specialty}</Text>
      <Text style={styles.companyDetail}>{COMPANY_INFO.address}</Text>
      <Text style={styles.companyDetail}>Phone: {COMPANY_INFO.phone}</Text>
      <Text style={styles.companyDetail}>Email: {COMPANY_INFO.email}</Text>
      <Text style={styles.companyDetail}>{COMPANY_INFO.website}</Text>
    </View>
  </View>
);

export default QuoteDocument; 