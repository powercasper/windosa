import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    border: '1pt solid #ddd',
    borderRadius: 2,
    padding: 8,
    backgroundColor: '#f8f8f8',
    height: 150,
  },
  preview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  panel: {
    height: '100%',
    border: '1pt solid #666',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  panelContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelLabel: {
    fontSize: 7,
    textAlign: 'center',
  },
  dimensionLabel: {
    fontSize: 6,
    color: '#666',
    position: 'absolute',
  },
  widthLabel: {
    top: -10,
    left: '50%',
  },
  heightLabel: {
    transform: 'rotate(-90)',
    transformOrigin: 'left bottom',
    left: -10,
    bottom: '50%',
  },
  fixedPanel: {
    backgroundColor: '#f5f5f5',
    borderColor: '#999',
  },
  slidingPanel: {
    backgroundColor: '#ffffff',
    borderColor: '#666',
  },
  arrow: {
    position: 'absolute',
    fontSize: 8,
    color: '#1976d2',
  },
  arrowLeft: {
    left: 2,
  },
  arrowRight: {
    right: 2,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#999',
  },
  horizontalGrid: {
    height: '0.5pt',
    left: 0,
    right: 0,
  },
  verticalGrid: {
    width: '0.5pt',
    top: 0,
    bottom: 0,
  }
});

const ConfigurationPreview = ({ configuration }) => {
  const renderGridLines = (horizontal, vertical) => {
    const lines = [];
    
    // Horizontal lines
    for (let i = 1; i < horizontal; i++) {
      lines.push(
        <View
          key={`h${i}`}
          style={[
            styles.gridLine,
            styles.horizontalGrid,
            { top: `${(i / horizontal) * 100}%` }
          ]}
        />
      );
    }
    
    // Vertical lines
    for (let i = 1; i < vertical; i++) {
      lines.push(
        <View
          key={`v${i}`}
          style={[
            styles.gridLine,
            styles.verticalGrid,
            { left: `${(i / vertical) * 100}%` }
          ]}
        />
      );
    }
    
    return <View style={styles.gridLines}>{lines}</View>;
  };

  const renderPanels = () => {
    if (configuration.systemType === 'Windows') {
      return configuration.panels.map((panel, index) => {
        const width = (panel.width / configuration.panels.reduce((sum, p) => sum + p.width, 0)) * 100;
        return (
          <View
            key={index}
            style={[
              styles.panel,
              panel.operationType === 'Fixed' ? styles.fixedPanel : styles.slidingPanel,
              { width: `${width}%` }
            ]}
          >
            <View style={styles.panelContent}>
              <Text style={styles.panelLabel}>{panel.operationType}</Text>
              <Text style={styles.panelLabel}>{panel.width}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
            </View>
          </View>
        );
      });
    }

    if (configuration.systemType === 'Sliding Doors') {
      return configuration.panels.map((panel, index) => {
        const width = 100 / configuration.panels.length;
        return (
          <View
            key={index}
            style={[
              styles.panel,
              panel.type === 'Fixed' ? styles.fixedPanel : styles.slidingPanel,
              { width: `${width}%` }
            ]}
          >
            <View style={styles.panelContent}>
              <Text style={styles.panelLabel}>{panel.type}</Text>
              {panel.type === 'Sliding' && (
                <Text style={[styles.arrow, panel.direction === 'left' ? styles.arrowLeft : styles.arrowRight]}>
                  {panel.direction === 'left' ? '←' : '→'}
                </Text>
              )}
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
            </View>
          </View>
        );
      });
    }

    // Entrance Doors
    return (
      <View style={[styles.panel, { width: '100%' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.panelLabel}>{configuration.openingType}</Text>
          <Text style={styles.panelLabel}>{configuration.swingDirection}</Text>
          {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {/* Dimension Labels */}
        <Text style={[styles.dimensionLabel, styles.widthLabel]}>
          {configuration.dimensions.totalWidth}"
        </Text>
        <Text style={[styles.dimensionLabel, styles.heightLabel]}>
          {configuration.dimensions.totalHeight}"
        </Text>
        
        {renderPanels()}
      </View>
    </View>
  );
};

export default ConfigurationPreview; 