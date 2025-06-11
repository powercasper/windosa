import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../../assets/logo_windo.png';
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
});

const QuoteDocument = ({ quote }) => {
  // Split items into pages (1 item per page to ensure full display)
  const splitIntoPages = (items) => {
    // Each page will have 1 item to ensure no splitting
    return items.map(item => [item]);
  };

  // Calculate total quantity
  const totalQuantity = quote.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const itemPages = splitIntoPages(quote.items);
  const totalPages = 1 + itemPages.length; // 1 header page + item pages

  return (
    <Document>
      {/* Page 1: Header and Project Information Only */}
      <Page size="A4" orientation="landscape" style={styles.page}>
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
            <Text style={styles.companyName}>WINDO</Text>
            <Text style={styles.companyDetail}>1010 Lake St, Suite 200</Text>
            <Text style={styles.companyDetail}>Oak Park, IL 60301</Text>
            <Text style={styles.companyDetail}>Phone: (872) 281-5683</Text>
            <Text style={styles.companyDetail}>Email: info@windosa.com</Text>
            <Text style={styles.companyDetail}>www.windosa.com</Text>
          </View>
        </View>

        <View style={styles.projectInfo}>
          <View style={styles.projectSection}>
            <Text style={styles.projectTitle}>Project Details</Text>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Project Name:</Text>
              <Text style={styles.projectValue}>{quote.projectName || 'Untitled Project'}</Text>
            </View>
            {quote.customerName && (
              <View style={styles.projectDetail}>
                <Text style={styles.projectLabel}>Customer:</Text>
                <Text style={styles.projectValue}>{quote.customerName}</Text>
              </View>
            )}
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Total Items:</Text>
              <Text style={styles.projectValue}>{quote.items.length}</Text>
            </View>
            {totalQuantity > quote.items.length && (
              <View style={styles.projectDetail}>
                <Text style={styles.projectLabel}>Total Quantity:</Text>
                <Text style={styles.projectValue}>{totalQuantity}</Text>
              </View>
            )}
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Total Area:</Text>
              <Text style={styles.projectValue}>
                {quote.totalArea ? `${quote.totalArea.toFixed(1)} sq ft` : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.projectSection}>
            <Text style={styles.projectTitle}>Order Summary</Text>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Total Amount:</Text>
              <Text style={styles.projectValue}>${quote.totalAmount.toFixed(2)}</Text>
            </View>
            {quote.additionalCosts && (
              <>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Tariff:</Text>
                  <Text style={styles.projectValue}>${quote.additionalCosts.tariff.toFixed(2)}</Text>
                </View>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Shipping:</Text>
                  <Text style={styles.projectValue}>${quote.additionalCosts.shipping.toFixed(2)}</Text>
                </View>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Delivery:</Text>
                  <Text style={styles.projectValue}>${quote.additionalCosts.delivery.toFixed(2)}</Text>
                </View>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Margin:</Text>
                  <Text style={styles.projectValue}>{quote.additionalCosts.margin.toFixed(1)}%</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Summary Section on First Page */}
        {quote.pricing && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Cost Breakdown Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryColumn}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>System Costs:</Text>
                  <Text style={styles.summaryValue}>${quote.pricing.totalSystemCost.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Glass Costs:</Text>
                  <Text style={styles.summaryValue}>${quote.pricing.totalGlassCost.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Labor Costs:</Text>
                  <Text style={styles.summaryValue}>${quote.pricing.totalLaborCost.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.summaryColumn}>
                {quote.additionalCosts && (
                  <>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Additional Costs:</Text>
                      <Text style={styles.summaryValue}>
                        ${(quote.additionalCosts.tariff + quote.additionalCosts.shipping + quote.additionalCosts.delivery).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Subtotal:</Text>
                      <Text style={styles.summaryValue}>
                        ${(quote.pricing.grandTotal + quote.additionalCosts.tariff + quote.additionalCosts.shipping + quote.additionalCosts.delivery).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total:</Text>
                  <Text style={styles.totalValue}>${quote.totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.pageNumber}>
          Page 1 of {totalPages}
        </Text>
      </Page>

      {/* Item Pages: Starting from page 2 */}
      {itemPages.map((pageItems, pageIndex) => (
        <Page key={pageIndex + 1} size="A4" orientation="landscape" style={styles.itemPage}>
          <View style={styles.itemsContainer}>
            {pageItems.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <QuoteLineItem item={item} />
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

export default QuoteDocument; 