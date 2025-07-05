import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import ConfigurationPreview from './ConfigurationPreview';

const styles = StyleSheet.create({
  container: {
    border: '1pt solid #eee',
    borderRadius: 3,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'column',
    gap: 10,
  },
  // Main header for the item
  titleBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1.5pt solid #1976d2',
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 9,
    color: '#333',
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'right',
  },
  unitPrice: {
    fontSize: 8,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  // Main content area
  content: {
    flexDirection: 'row',
    gap: 15,
  },
  // Left side: Preview
  previewSection: {
    width: '40%',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 3,
  },
  // Right side: All details
  detailsSection: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  // A single section of details (e.g., Configuration, Dimensions)
  specSection: {
    
  },
  specTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34495e',
    borderBottom: '1pt solid #e0e0e0',
    paddingBottom: 3,
    marginBottom: 5,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  specLabel: {
    width: 90,
    fontSize: 8,
    color: '#666',
  },
  specValue: {
    flex: 1,
    fontSize: 8,
    color: '#000',
  },
  // Notes at the bottom
  notesSection: {
    marginTop: 5,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    borderTop: '1pt solid #eee'
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666',
  }
});

const Spec = ({ label, children }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}:</Text>
    <Text style={styles.specValue}>{children}</Text>
  </View>
);

const QuoteLineItem = ({ item, position }) => {
  const formatDimension = (value) => `${value}"`;
  const formatArea = (value) => `${value.toFixed(1)} sq ft`;
  const formatPrice = (value) => `$${value.toFixed(2)}`;

  const quantity = item.quantity || 1;
  const unitPrice = item.pricing.finalPrice / quantity;
  
  const description = item.systemType === 'Windows'
    ? `Window - ${item.panels.map(p => p.operationType).join('/')}`
    : item.systemType === 'Entrance Doors'
    ? `Entrance Door - ${item.openingType}`
    : `Sliding Door - ${item.operationType}`;

  return (
    <View style={styles.container}>
      {/* --- Main Title Block --- */}
      <View style={styles.titleBlock}>
        <View>
          <Text style={styles.title}>{`Item ${String(position).padStart(3, '0')}: ${item.brand} ${item.systemModel}`}</Text>
          <Text style={styles.subtitle}>{description}</Text>
          {item.location && <Text style={styles.subtitle}>Location: {item.location}</Text>}
        </View>
        <View>
          <Text style={styles.price}>{formatPrice(item.pricing.finalPrice)}</Text>
          {quantity > 1 && <Text style={styles.unitPrice}>({formatPrice(unitPrice)}/unit)</Text>}
        </View>
      </View>

      {/* --- Main Content --- */}
      <View style={styles.content}>
        {/* Left: Preview */}
        <View style={styles.previewSection}>
          <ConfigurationPreview configuration={item} />
        </View>

        {/* Right: Details */}
        <View style={styles.detailsSection}>
          {/* Dimensions Section */}
          <View style={styles.specSection}>
            <Text style={styles.specTitle}>Dimensions & Quantity</Text>
            <Spec label="Quantity">{quantity} unit(s)</Spec>
            <Spec label="Total Width">{formatDimension(item.dimensions.totalWidth)}</Spec>
            <Spec label="Total Height">{formatDimension(item.dimensions.totalHeight)}</Spec>
            <Spec label="Total Area">{formatArea(item.pricing.area)}</Spec>
          </View>
          
          {/* Configuration Section */}
          <View style={styles.specSection}>
            <Text style={styles.specTitle}>Configuration</Text>
            {item.systemType === 'Windows' && item.panels.map((panel, idx) => (
              <Spec key={idx} label={`Panel ${idx + 1}`}>
                {panel.operationType} ({formatDimension(panel.width)})
                {panel.hasMosquitoNet && " + Mosquito Net"}
                {panel.hasOpeningLimiter && " + Opening Limiter"}
              </Spec>
            ))}
            {item.systemType === 'Sliding Doors' && item.panels?.map((panel, idx) => (
               <Spec key={idx} label={`Panel ${idx + 1}`}>
                {panel.type} ({panel.direction ? (panel.direction === 'left' ? '←' : '→') : ''})
              </Spec>
            ))}
            {item.systemType === 'Entrance Doors' && (
              <>
                <Spec label="Swing">{item.swingDirection}</Spec>
                {item.leftSidelight?.enabled && <Spec label="Left Sidelight">{formatDimension(item.leftSidelight.width)}</Spec>}
                {item.rightSidelight?.enabled && <Spec label="Right Sidelight">{formatDimension(item.rightSidelight.width)}</Spec>}
                {item.transom?.enabled && <Spec label="Transom">{formatDimension(item.transom.height)}</Spec>}
              </>
            )}
          </View>
          
          {/* Details Section */}
          <View style={styles.specSection}>
            <Text style={styles.specTitle}>Details</Text>
            <Spec label="Finish">{item.finish.type} - {item.finish.color} {item.finish.type === 'RAL' ? `(${item.finish.ralColor})` : ''}</Spec>
            <Spec label="Glass Type">{item.glassType}</Spec>
            {item.grid?.enabled && <Spec label="Grid">{item.grid.horizontal}H x {item.grid.vertical}V</Spec>}
            {item.systemType === 'Entrance Doors' && (
              <>
                <Spec label="Handle">{item.handleType}</Spec>
                <Spec label="Lock">{item.lockType}</Spec>
                <Spec label="Hinge">{item.hingeType}</Spec>
                <Spec label="Threshold">{item.threshold}</Spec>
              </>
            )}
          </View>

          {/* Glass Specifications Section */}
          {item.glassDetails?.specifications ? (
            <View style={styles.specSection}>
              <Text style={styles.specTitle}>Glass Specifications</Text>
              <Spec label="Product">{item.glassDetails.productCode || item.glassDetails.type}</Spec>
              <Spec label="Construction">{item.glassDetails.specifications.construction}</Spec>
              <Spec label="Light Trans.">{item.glassDetails.specifications.lightTransmittance}%</Spec>
              <Spec label="Solar Factor">{item.glassDetails.specifications.solarHeatGainCoefficient}</Spec>
              <Spec label="Thermal U">{item.glassDetails.specifications.thermalTransmission}</Spec>
              <Spec label="Acoustic">{item.glassDetails.specifications.acousticRating}</Spec>
            </View>
          ) : (
            <View style={styles.specSection}>
              <Text style={styles.specTitle}>Glass</Text>
              <Spec label="Type">{item.glassType || 'Standard'}</Spec>
              <Spec label="Description">{item.glassDetails?.description || 'Standard insulated glass unit'}</Spec>
            </View>
          )}

          {/* Performance Highlights Section */}
          {item.glassDetails?.specifications && (
            <View style={styles.specSection}>
              <Text style={styles.specTitle}>Performance Highlights</Text>
              <Spec label="Energy Rating">{item.glassDetails.specifications.energyRating || 'A+'}</Spec>
              <Spec label="Category">{item.glassDetails.category}</Spec>
              <Spec label="Benefits">Enhanced comfort, energy savings, superior performance</Spec>
            </View>
          )}
        </View>
      </View>

      {/* --- Notes Section --- */}
      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );
};

export default QuoteLineItem; 