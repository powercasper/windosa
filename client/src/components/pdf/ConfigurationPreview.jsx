import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    border: '1pt solid #ddd',
    borderRadius: 2,
    padding: 8,
    backgroundColor: '#f8f8f8',
    height: 150,
    width: '100%',
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
  doorPanel: {
    backgroundColor: '#bbdefb',
    borderColor: '#1976d2',
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
  handle: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#1976d2',
    top: '50%',
    transform: 'translateY(-50%)',
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
  },
  doubleDoorContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    gap: 1,
  },
  leftDoorPanel: {
    flex: 1,
    borderRight: '1pt solid #999',
  },
  rightDoorPanel: {
    flex: 1,
    borderLeft: '1pt solid #999',
  }
});

const ConfigurationPreview = ({ configuration }) => {
  // Calculate dynamic aspect ratio based on actual dimensions
  const getAspectRatio = () => {
    if (!configuration.dimensions?.width || !configuration.dimensions?.height) {
      return 1.6; // Default 16:10 ratio
    }
    
    const totalWidth = (configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                      configuration.dimensions.width + 
                      (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0);
    const totalHeight = configuration.dimensions.height + 
                       (configuration.transom?.enabled ? configuration.transom.height : 0);
    
    return totalWidth / totalHeight;
  };

  const aspectRatio = getAspectRatio();
  const containerHeight = 150;
  const containerWidth = containerHeight * aspectRatio;
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
              
              {/* Handle for operable windows */}
              {panel.operationType !== 'Fixed' && (
                <View style={[
                  styles.handle, 
                  { [panel.handleLocation === 'left' ? 'left' : 'right']: 1 }
                ]} />
              )}
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
                <>
                  {/* Movement Arrow - Positioned to show direction from current position */}
                  <Text style={[
                    styles.arrow, 
                    { 
                      fontSize: 14, 
                      fontWeight: 'bold',
                      color: '#1976d2',
                      position: 'absolute',
                      top: '20%',
                      [panel.direction === 'left' ? 'right' : 'left']: '15%',
                    }
                  ]}>
                    {panel.direction === 'left' ? '←' : '→'}
                  </Text>
                  
                  {/* Sash Current Position Indicator */}
                  <View style={{
                    position: 'absolute',
                    bottom: '25%',
                    [panel.direction === 'left' ? 'right' : 'left']: '10%',
                    width: 2,
                    height: '25%',
                    backgroundColor: '#1976d2',
                    opacity: 0.6,
                  }} />
                  
                  {/* Direction Label - Positioned near movement destination */}
                  <Text style={[
                    styles.panelLabel,
                    {
                      fontSize: 4,
                      fontWeight: 'bold',
                      color: '#1976d2',
                      position: 'absolute',
                      bottom: '8%',
                      [panel.direction === 'left' ? 'left' : 'right']: '8%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      padding: 1,
                      border: '0.5pt solid #1976d2',
                    }
                  ]}>
                    {panel.direction === 'left' ? '← TO LEFT' : 'TO RIGHT →'}
                  </Text>
                </>
              )}
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
            </View>
          </View>
        );
      });
    }

    // Entrance Doors
    if (configuration.openingType === 'Double Door') {
      // Double Door Configuration
      return (
        <View style={styles.doubleDoorContainer}>
          {/* Left Door Panel */}
          <View style={[styles.panel, styles.doorPanel, styles.leftDoorPanel]}>
            <View style={styles.panelContent}>
              <Text style={styles.panelLabel}>Left Panel</Text>
              <Text style={styles.panelLabel}>{(configuration.dimensions.width / 2).toFixed(1)}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              {/* Right handle for left panel */}
              <View style={[styles.handle, { right: 1 }]} />
            </View>
          </View>

          {/* Right Door Panel */}
          <View style={[styles.panel, styles.doorPanel, styles.rightDoorPanel]}>
            <View style={styles.panelContent}>
              <Text style={styles.panelLabel}>Right Panel</Text>
              <Text style={styles.panelLabel}>{(configuration.dimensions.width / 2).toFixed(1)}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              {/* Left handle for right panel */}
              <View style={[styles.handle, { left: 1 }]} />
            </View>
          </View>
        </View>
      );
    } else {
      // Single Door Configuration
      return (
        <View style={[styles.panel, styles.doorPanel, { width: '100%' }]}>
          <View style={styles.panelContent}>
            <Text style={styles.panelLabel}>{configuration.openingType}</Text>
            <Text style={styles.panelLabel}>{configuration.dimensions.width}"</Text>
            {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
            {/* Handle based on configuration */}
            <View style={[
              styles.handle, 
              { [configuration.handleLocation === 'left' ? 'left' : 'right']: 1 }
            ]} />
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { width: Math.min(containerWidth, 300) }]}>
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