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
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companyDetail}>{COMPANY_INFO.specialty}</Text>
            <Text style={styles.companyDetail}>{COMPANY_INFO.address}</Text>
            <Text style={styles.companyDetail}>Phone: {COMPANY_INFO.phone}</Text>
            <Text style={styles.companyDetail}>Email: {COMPANY_INFO.email}</Text>
            <Text style={styles.companyDetail}>{COMPANY_INFO.website}</Text>
          </View>
        </View>

        <View style={styles.projectInfo}>
          <View style={styles.projectSection}>
            <Text style={styles.projectTitle}>Client Information</Text>
            {quote.clientInfo && (
              <>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Client:</Text>
                  <Text style={styles.projectValue}>
                    {quote.clientInfo.isCompany && quote.clientInfo.companyName ? 
                      quote.clientInfo.companyName : 
                      `${quote.clientInfo.firstName} ${quote.clientInfo.lastName}`.trim()
                    }
                  </Text>
                </View>
                {quote.clientInfo.isCompany && quote.clientInfo.jobTitle && (
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectLabel}>Contact:</Text>
                    <Text style={styles.projectValue}>
                      {`${quote.clientInfo.firstName} ${quote.clientInfo.lastName}`.trim()}, {quote.clientInfo.jobTitle}
                    </Text>
                  </View>
                )}
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Email:</Text>
                  <Text style={styles.projectValue}>{quote.clientInfo.email}</Text>
                </View>
                <View style={styles.projectDetail}>
                  <Text style={styles.projectLabel}>Phone:</Text>
                  <Text style={styles.projectValue}>{quote.clientInfo.phone}</Text>
                </View>
                {quote.clientInfo.address?.street && (
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectLabel}>Address:</Text>
                    <Text style={styles.projectValue}>
                      {quote.clientInfo.address.street}
                      {quote.clientInfo.address.city && `, ${quote.clientInfo.address.city}`}
                      {quote.clientInfo.address.state && `, ${quote.clientInfo.address.state}`}
                      {quote.clientInfo.address.zipCode && ` ${quote.clientInfo.address.zipCode}`}
                    </Text>
                  </View>
                )}
              </>
            )}
            {/* Fallback for legacy quotes */}
            {!quote.clientInfo && quote.customerName && (
              <View style={styles.projectDetail}>
                <Text style={styles.projectLabel}>Customer:</Text>
                <Text style={styles.projectValue}>{quote.customerName}</Text>
              </View>
            )}
          </View>
          <View style={styles.projectSection}>
            <Text style={styles.projectTitle}>Project Details</Text>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Project Name:</Text>
              <Text style={styles.projectValue}>
                {quote.clientInfo?.projectName || quote.projectName || 'Untitled Project'}
              </Text>
            </View>
            {quote.clientInfo?.projectType && (
              <View style={styles.projectDetail}>
                <Text style={styles.projectLabel}>Project Type:</Text>
                <Text style={styles.projectValue}>{quote.clientInfo.projectType}</Text>
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
              <Text style={styles.projectLabel}>Quote #:</Text>
              <Text style={styles.projectValue}>{quote.quoteNumber}</Text>
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Quote Date:</Text>
              <Text style={styles.projectValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Valid Until:</Text>
              <Text style={styles.projectValue}>
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel} />
              <Text style={styles.projectValue} />
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Total Amount:</Text>
              <Text style={styles.projectValue}>
                ${(() => {
                  const baseCosts = (quote.pricing?.totalSystemCost || 0) + (quote.pricing?.totalGlassCost || 0) + (quote.pricing?.totalLaborCost || 0);
                  const additionalCosts = (quote.additionalCosts?.tariff || 0) + (quote.additionalCosts?.shipping || 0);
                  const marginAmount = baseCosts > 0 ? baseCosts * ((quote.additionalCosts?.margin || 0) / 100) : 0;
                  const totalAmount = baseCosts + additionalCosts + marginAmount;
                  return totalAmount.toFixed(2);
                })()}
              </Text>
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>Delivery:</Text>
              <Text style={styles.projectValue}>${(quote.additionalCosts?.delivery || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.projectDetail}>
              <Text style={styles.projectLabel}>GRAND TOTAL:</Text>
              <Text style={[styles.projectValue, { fontSize: 12, fontWeight: 'bold', color: '#1976d2' }]}>
                ${(quote.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
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
                  <Text style={styles.summaryValue}>${(quote.pricing.totalSystemCost || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Glass Costs:</Text>
                  <Text style={styles.summaryValue}>${(quote.pricing.totalGlassCost || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Labor Costs:</Text>
                  <Text style={styles.summaryValue}>${(quote.pricing.totalLaborCost || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Base Subtotal:</Text>
                  <Text style={styles.summaryValue}>
                    ${((quote.pricing.totalSystemCost || 0) + (quote.pricing.totalGlassCost || 0) + (quote.pricing.totalLaborCost || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryColumn}>
                {quote.additionalCosts ? (
                  <>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Tariff:</Text>
                      <Text style={styles.summaryValue}>${(quote.additionalCosts.tariff || 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Shipping:</Text>
                      <Text style={styles.summaryValue}>${(quote.additionalCosts.shipping || 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Delivery:</Text>
                      <Text style={styles.summaryValue}>${(quote.additionalCosts.delivery || 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Profit Margin ({(quote.additionalCosts.margin || 0).toFixed(1)}%):</Text>
                      <Text style={styles.summaryValue}>
                        ${(() => {
                          const baseCosts = (quote.pricing.totalSystemCost || 0) + (quote.pricing.totalGlassCost || 0) + (quote.pricing.totalLaborCost || 0);
                          const additionalCosts = (quote.additionalCosts.tariff || 0) + (quote.additionalCosts.shipping || 0) + (quote.additionalCosts.delivery || 0);
                          const marginAmount = Math.max(0, (quote.totalAmount || 0) - baseCosts - additionalCosts);
                          return marginAmount.toFixed(2);
                        })()}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>No additional costs</Text>
                    <Text style={styles.summaryValue}>$0.00</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total:</Text>
                  <Text style={styles.totalValue}>${(quote.totalAmount || 0).toFixed(2)}</Text>
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