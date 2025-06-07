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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemWrapper: {
    width: '48%',
    marginBottom: 10,
  },
});

const QuoteDocument = ({ quote }) => {
  // Split items into pages (2 items per row, 4 per page in landscape)
  const splitIntoPages = (items) => {
    const pages = [];
    const itemsPerPage = 4;

    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }

    // If the last page has fewer than 4 items, pad it with empty items
    const lastPage = pages[pages.length - 1];
    if (lastPage && lastPage.length < itemsPerPage) {
      const emptyItems = Array(itemsPerPage - lastPage.length).fill(null);
      pages[pages.length - 1] = [...lastPage, ...emptyItems];
    }

    return pages;
  };

  const pages = splitIntoPages(quote.items);

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {/* Show header only on first page */}
          {pageIndex === 0 && (
            <>
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
                </View>
                <View style={styles.projectSection}>
                  <Text style={styles.projectTitle}>Order Summary</Text>
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectLabel}>Total Items:</Text>
                    <Text style={styles.projectValue}>{quote.items.length}</Text>
                  </View>
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectLabel}>Total Amount:</Text>
                    <Text style={styles.projectValue}>${quote.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Line Items - 2x2 Grid Layout */}
          <View style={styles.itemsContainer}>
            {pageItems.map((item, index) => (
              item && (
                <View key={item.id || index} style={styles.itemWrapper}>
                  <QuoteLineItem item={item} />
                </View>
              )
            ))}
          </View>

          {/* Page Numbers */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

export default QuoteDocument; 