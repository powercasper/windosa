import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Svg,
  Path
} from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/helpers';
import { WINDO_LOGO, COMPANY_INFO } from '../../assets/logo';
import ConfigurationPreview from '../ConfigurationPreview';

// Register fonts if needed
// Font.register({
//   family: 'Your-Font',
//   src: '/path/to/font.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'right',
  },
  projectInfo: {
    marginBottom: 30,
    fontSize: 10,
  },
  table: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#E4E4E4',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    padding: 5,
  },
  cell: {
    flex: 1,
    padding: 3,
  },
  itemDetails: {
    flexDirection: 'row',
    padding: 10,
  },
  drawingContainer: {
    width: '40%',
    marginRight: 20,
  },
  technicalDrawing: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  specificationContainer: {
    width: '60%',
  },
  specLine: {
    marginBottom: 5,
  },
  overview: {
    marginTop: 20,
  },
  overviewTable: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  bold: {
    fontWeight: 'bold',
  },
  exteriorView: {
    fontSize: 10,
    marginBottom: 5,
    paddingLeft: 5,
  },
  positionCell: {
    width: '15%',
    padding: 3,
  },
  quantityCell: {
    width: '15%',
    padding: 3,
  },
  locationCell: {
    width: '70%',
    padding: 3,
  },
  areaCell: {
    width: '15%',
    padding: 3,
    textAlign: 'right',
  }
});

const QuotePDF = ({ quote, items }) => {
  const calculateTotalArea = () => {
    return items.reduce((sum, item) => sum + (item.area || 0), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.0825; // 8.25% tax rate
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={WINDO_LOGO} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>{COMPANY_INFO.name}</Text>
            <Text>{COMPANY_INFO.address}</Text>
            <Text>Web site: {COMPANY_INFO.website}</Text>
            <Text>Email: {COMPANY_INFO.email}</Text>
            <Text>Mob: {COMPANY_INFO.phone}</Text>
          </View>
        </View>

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <Text>Project: {quote.projectName}</Text>
          <Text>Customer: {quote.customerName}</Text>
          <Text>Date: {new Date(quote.date).toLocaleDateString()}</Text>
          <Text>Sales Rep: {quote.salesRep}</Text>
          <Text>Cell: {quote.salesRepPhone} | Email: {quote.salesRepEmail}</Text>
        </View>

        {/* Items */}
        {items.map((item, index) => (
          <View key={index} style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.positionCell}>
                <Text style={styles.bold}>Position</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.bold}>Quantity</Text>
              </View>
              <View style={styles.locationCell}>
                <Text style={styles.bold}>Location</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.positionCell}>
                <Text>{String(index + 1).padStart(3, '0')}</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text>1 Pcs</Text>
              </View>
              <View style={styles.locationCell}>
                <Text>{item.location}</Text>
              </View>
            </View>
            <Text style={styles.exteriorView}>Exterior View</Text>
            <View style={styles.itemDetails}>
              <View style={styles.drawingContainer}>
                <ConfigurationPreview configuration={item} maxHeight="200px" />
              </View>
              <View style={styles.specificationContainer}>
                <Text style={[styles.specLine, styles.bold]}>
                  Window Element {item.dimensions.width}" x {item.dimensions.height}"
                </Text>
                <Text style={styles.specLine}>{item.description}</Text>
                <Text style={styles.specLine}>Alumil Smartia {item.systemModel}</Text>
                <Text style={[styles.specLine, styles.bold]}>Colours:</Text>
                <Text style={styles.specLine}>
                  inside: GROUP D RAL {item.finish.insideColor} STRUCTU {item.finish.insideFinish}
                </Text>
                <Text style={styles.specLine}>
                  outside: GROUP D RAL {item.finish.outsideColor} STRUCTU {item.finish.outsideFinish}
                </Text>
                <Text style={[styles.specLine, styles.bold]}>Glazing:</Text>
                <Text style={styles.specLine}>{item.glazing}</Text>
                {item.hardware && (
                  <>
                    <Text style={[styles.specLine, styles.bold]}>Window Hardware:</Text>
                    <Text style={styles.specLine}>{item.hardware}</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Overview */}
        <View style={styles.overview}>
          <Text style={[styles.bold, { marginBottom: 10 }]}>Overview</Text>
          <View style={styles.overviewTable}>
            <View style={styles.tableHeader}>
              <View style={styles.positionCell}>
                <Text style={styles.bold}>Position</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text style={styles.bold}>Quantity</Text>
              </View>
              <View style={styles.locationCell}>
                <Text style={styles.bold}>Location</Text>
              </View>
              <View style={styles.areaCell}>
                <Text style={styles.bold}>Area [ft²]</Text>
              </View>
            </View>
            {items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.positionCell}>
                  <Text>{String(index + 1).padStart(3, '0')}</Text>
                </View>
                <View style={styles.quantityCell}>
                  <Text>1</Text>
                </View>
                <View style={styles.locationCell}>
                  <Text>{item.location}</Text>
                </View>
                <View style={styles.areaCell}>
                  <Text>{item.area?.toFixed(1)}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.tableRow, styles.bold]}>
              <View style={styles.positionCell}>
                <Text>{items.length} Positions</Text>
              </View>
              <View style={styles.quantityCell}>
                <Text>{items.length}</Text>
              </View>
              <View style={styles.locationCell}>
                <Text></Text>
              </View>
              <View style={styles.areaCell}>
                <Text>{calculateTotalArea().toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <Text>Grand Total Net: {formatCurrency(quote.totalAmount)}</Text>
          <Text>Value Added Tax (8.25%): {formatCurrency(calculateTax(quote.totalAmount))}</Text>
          <Text style={styles.bold}>Total Price: {formatCurrency(quote.totalAmount + calculateTax(quote.totalAmount))}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default QuotePDF; 