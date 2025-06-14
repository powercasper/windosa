import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import ConfigurationPreview from './ConfigurationPreview';

const styles = StyleSheet.create({
  container: {
    border: '1pt solid #ddd',
    borderRadius: 3,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: '1pt solid #eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityBadge: {
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: '2pt 6pt',
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  priceSection: {
    textAlign: 'right',
  },
  price: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  unitPrice: {
    fontSize: 8,
    color: '#666',
  },
  location: {
    fontSize: 9,
    color: '#666',
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    gap: 15,
  },
  previewSection: {
    width: '40%',
  },
  previewTitle: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  detailsSection: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  column: {
    flex: 1,
    minWidth: '45%',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1976d2',
    borderBottom: '0.5pt solid #eee',
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 70,
    fontSize: 8,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 8,
  },
  notes: {
    marginTop: 8,
    padding: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
  },
  notesText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666',
  }
});

const QuoteLineItem = ({ item }) => {
  const formatDimension = (value) => `${value}"`;
  const formatArea = (value) => `${value.toFixed(1)} sq ft`;
  const formatPrice = (value) => `$${value.toFixed(2)}`;

  const quantity = item.quantity || 1;
  const unitPrice = item.pricing.finalPrice / quantity;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            Item {item.itemNumber} - {item.brand} {item.systemModel}
          </Text>
          {quantity > 1 && (
            <Text style={styles.quantityBadge}>
              Qty: {quantity}
            </Text>
          )}
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>
            {formatPrice(item.pricing.finalPrice)}
          </Text>
          {quantity > 1 && (
            <Text style={styles.unitPrice}>
              {formatPrice(unitPrice)} per unit
            </Text>
          )}
        </View>
      </View>

      {/* Location */}
      {item.location && (
        <Text style={styles.location}>Location: {item.location}</Text>
      )}

      <View style={styles.content}>
        {/* Configuration Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Configuration Preview</Text>
          <ConfigurationPreview configuration={item} />
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.grid}>
            {/* Configuration Details */}
            <View style={styles.column}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configuration Details</Text>
                {quantity > 1 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Quantity:</Text>
                    <Text style={styles.value}>{quantity} units</Text>
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>{item.systemType}</Text>
                </View>
                {item.systemType === 'Windows' && item.panels && item.panels.map((panel, idx) => (
                  <View key={idx} style={styles.row}>
                    <Text style={styles.label}>Panel {idx + 1}:</Text>
                    <Text style={styles.value}>
                      {panel.operationType} ({panel.width}")
                      {panel.operationType !== 'Fixed' && item.hasMosquitoNet && ' + Mosquito Net'}
                    </Text>
                  </View>
                ))}
                {item.systemType === 'Entrance Doors' && (
                  <>
                    <View style={styles.row}>
                      <Text style={styles.label}>Opening:</Text>
                      <Text style={styles.value}>{item.openingType}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Swing:</Text>
                      <Text style={styles.value}>{item.swingDirection}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Handle:</Text>
                      <Text style={styles.value}>{item.handleType}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Lock:</Text>
                      <Text style={styles.value}>{item.lockType}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* System Dimensions */}
            <View style={styles.column}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Dimensions</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Width:</Text>
                  <Text style={styles.value}>{formatDimension(item.dimensions.totalWidth)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Height:</Text>
                  <Text style={styles.value}>{formatDimension(item.dimensions.totalHeight)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Area:</Text>
                  <Text style={styles.value}>{formatArea(item.pricing.area)}</Text>
                </View>
              </View>

              {/* Finish Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Finish Details</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>{item.finish.type}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Style:</Text>
                  <Text style={styles.value}>{item.finish.color}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>RAL:</Text>
                  <Text style={styles.value}>{item.finish.ralColor}</Text>
                </View>
              </View>


            </View>
          </View>
        </View>
      </View>

      {/* Notes if any */}
      {item.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );
};

export default QuoteLineItem; 