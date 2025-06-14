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
  // Split items into pages (1 item per page to ensure full display)
  const splitIntoPages = (items) => {
    // Each page will have 1 item to ensure no splitting
    return items.map(item => [item]);
  };

  // Calculate total quantity
  const totalQuantity = quote.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Unified pricing calculation function
  const calculatePricing = () => {
    // Calculate base costs from individual items
    const totalSystemCost = quote.items.reduce((sum, item) => sum + (item.pricing?.systemCost || 0), 0);
    const totalGlassCost = quote.items.reduce((sum, item) => sum + (item.pricing?.glassCost || 0), 0);
    const totalLaborCost = quote.items.reduce((sum, item) => sum + (item.pricing?.laborCost || 0), 0);
    const baseItemsCost = totalSystemCost + totalGlassCost + totalLaborCost;

    // Additional costs
    const tariff = quote.additionalCosts?.tariff || 0;
    const shipping = quote.additionalCosts?.shipping || 0;
    const delivery = quote.additionalCosts?.delivery || 0;
    const margin = quote.additionalCosts?.margin || 0;

    // Calculate totals
    const additionalCostsExceptDelivery = tariff + shipping;
    const totalWithoutMarginAndDelivery = baseItemsCost + additionalCostsExceptDelivery;
    const marginMultiplier = 1 / (1 - (margin / 100));
    const subtotal = totalWithoutMarginAndDelivery * marginMultiplier;
    const grandTotal = subtotal + delivery;

    return {
      baseItemsCost,
      totalSystemCost,
      totalGlassCost,
      totalLaborCost,
      tariff,
      shipping,
      delivery,
      margin,
      subtotal,
      grandTotal
    };
  };

  const pricing = calculatePricing();

  // Function to calculate individual item final price (consistent with overall totals)
  const calculateItemFinalPrice = (item, itemArea, totalArea) => {
    // Get base item cost (system + glass + labor)
    const baseItemCost = (item.pricing?.systemCost || 0) + (item.pricing?.glassCost || 0) + (item.pricing?.laborCost || 0);
    
    // Calculate proportional additional costs (tariff + shipping only, delivery is added at the end)
    const proportionalAdditionalCosts = totalArea > 0 ? 
      (itemArea / totalArea) * (pricing.tariff + pricing.shipping) : 0;
    
    // Apply margin to base cost + proportional additional costs
    const costWithAdditionalCosts = baseItemCost + proportionalAdditionalCosts;
    const marginMultiplier = 1 / (1 - (pricing.margin / 100));
    const finalItemPrice = costWithAdditionalCosts * marginMultiplier;
    
    return finalItemPrice;
  };

  const itemPages = splitIntoPages(quote.items);
  const totalPages = 1 + itemPages.length + 1; // 1 header page + item pages + 1 itemized overview page

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
        </View>

        {/* Order Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryColumn}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quote #:</Text>
                <Text style={styles.summaryValue}>{quote.quoteNumber}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quote Date:</Text>
                <Text style={styles.summaryValue}>{new Date().toLocaleDateString()}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Valid Until:</Text>
                <Text style={styles.summaryValue}>
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.summaryColumn}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>
                  ${pricing.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Delivery Costs:</Text>
                <Text style={styles.summaryValue}>${pricing.delivery.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
                <Text style={styles.totalValue}>
                  ${pricing.grandTotal.toFixed(2)}
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

      {/* Last Page: Itemized Overview Table */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logo} style={styles.logo} />
            <View>
              <Text style={styles.projectTitle}>Itemized Overview - Quote #{quote.quoteNumber}</Text>
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

        {/* Itemized Overview Table */}
        <View style={[styles.itemizedSection, { marginTop: 10 }]}>
          <Text style={styles.itemizedTitle}>Itemized Overview</Text>
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.colPosition]}>
                <Text style={styles.tableHeaderCell}>Position</Text>
              </View>
              <View style={[styles.colQuantity]}>
                <Text style={styles.tableHeaderCell}>Quantity [Pcs.]</Text>
              </View>
              <View style={[styles.colDescription]}>
                <Text style={styles.tableHeaderCellLeft}>Description</Text>
              </View>
              <View style={[styles.colLocation]}>
                <Text style={styles.tableHeaderCell}>Location</Text>
              </View>
              <View style={[styles.colArea]}>
                <Text style={styles.tableHeaderCellRight}>Area [ft²]</Text>
              </View>
              <View style={[styles.colUnitPrice]}>
                <Text style={styles.tableHeaderCellRight}>Unit Price*</Text>
              </View>
              <View style={[styles.colTotal]}>
                <Text style={styles.tableHeaderCellRight}>Total</Text>
              </View>
            </View>

            {/* Table Rows */}
            {(() => {
              // Calculate total area once for all items
              const totalArea = quote.items.reduce((sum, itm) => {
                let area = 0;
                if (itm.systemType === 'Windows') {
                  area = (itm.panels.reduce((w, p) => w + p.width, 0) * itm.dimensions.height) / 144;
                } else if (itm.systemType === 'Entrance Doors') {
                  area = ((itm.leftSidelight?.enabled ? itm.leftSidelight.width : 0) + 
                         itm.dimensions.width +
                         (itm.rightSidelight?.enabled ? itm.rightSidelight.width : 0)) * 
                        (itm.dimensions.height + 
                         (itm.transom?.enabled ? itm.transom.height : 0)) / 144;
                } else if (itm.systemType === 'Sliding Doors') {
                  area = (itm.dimensions.width * itm.dimensions.height) / 144;
                }
                return sum + area;
              }, 0);

              return quote.items.map((item, index) => {
                const itemArea = (() => {
                  if (item.systemType === 'Windows') {
                    return ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
                  } else if (item.systemType === 'Entrance Doors') {
                    return (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                            item.dimensions.width +
                            (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                           (item.dimensions.height + 
                            (item.transom?.enabled ? item.transom.height : 0)) / 144);
                  } else if (item.systemType === 'Sliding Doors') {
                    return ((item.dimensions.width * item.dimensions.height) / 144);
                  }
                  return 0;
                })();

                // Use consistent pricing calculation
                const finalItemPrice = calculateItemFinalPrice(item, itemArea, totalArea);
                
                const description = (() => {
                  if (item.systemType === 'Windows') {
                    return `${item.brand} ${item.systemModel} - ${item.panels.map(p => p.operationType).join('/')}`;
                  } else if (item.systemType === 'Entrance Doors') {
                    return `${item.brand} ${item.systemModel} - ${item.openingType}`;
                  } else if (item.systemType === 'Sliding Doors') {
                    return `${item.brand} ${item.systemModel} - ${item.operationType}`;
                  }
                  return '';
                })();

                return (
                  <View key={item.id} style={styles.tableRow}>
                    <View style={[styles.colPosition]}>
                      <Text style={styles.tableCell}>{String(index + 1).padStart(3, '0')}</Text>
                    </View>
                    <View style={[styles.colQuantity]}>
                      <Text style={styles.tableCell}>{item.quantity || 1}</Text>
                    </View>
                    <View style={[styles.colDescription]}>
                      <Text style={styles.tableCellLeft}>{description}</Text>
                    </View>
                    <View style={[styles.colLocation]}>
                      <Text style={styles.tableCell}>{item.location || '-'}</Text>
                    </View>
                    <View style={[styles.colArea]}>
                      <Text style={styles.tableCellRight}>{itemArea.toFixed(1)}</Text>
                    </View>
                    <View style={[styles.colUnitPrice]}>
                      <Text style={styles.tableCellRight}>${(finalItemPrice / (item.quantity || 1)).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.colTotal]}>
                      <Text style={styles.tableCellRight}>${finalItemPrice.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              });
            })()}

            {/* Total Row */}
            <View style={styles.tableTotalRow}>
              <View style={[styles.colPosition]}>
                <Text style={styles.tableHeaderCell}>{quote.items.length} Positions</Text>
              </View>
              <View style={[styles.colQuantity]}></View>
              <View style={[styles.colDescription]}></View>
              <View style={[styles.colLocation]}></View>
              <View style={[styles.colArea]}>
                <Text style={styles.tableHeaderCellRight}>
                  {quote.totalArea?.toFixed(1) || '0.0'}
                </Text>
              </View>
              <View style={[styles.colUnitPrice]}></View>
              <View style={[styles.colTotal]}>
                <Text style={styles.tableHeaderCellRight}>
                  ${pricing.subtotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* GRAND TOTAL Row */}
            <View style={styles.tableGrandTotalRow}>
              <View style={[styles.colPosition]}></View>
              <View style={[styles.colQuantity]}></View>
              <View style={[styles.colDescription]}></View>
              <View style={[styles.colLocation]}></View>
              <View style={[styles.colArea]}></View>
              <View style={[styles.colUnitPrice]}>
                <Text style={[styles.tableHeaderCellRight, { fontSize: 9, fontWeight: 'bold' }]}>GRAND TOTAL</Text>
              </View>
              <View style={[styles.colTotal]}>
                <Text style={[styles.tableHeaderCellRight, { fontSize: 9, fontWeight: 'bold' }]}>
                  ${pricing.grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.tableNote}>
            * Unit Price includes proportionally distributed additional costs (tariff, shipping, delivery) and margin
          </Text>
        </View>

        <Text style={styles.pageNumber}>
          Page {totalPages} of {totalPages}
        </Text>
      </Page>
    </Document>
  );
};

export default QuoteDocument; 