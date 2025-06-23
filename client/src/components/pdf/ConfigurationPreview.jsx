import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

// Helper function to determine handle location from swing direction
const getHandleLocation = (swingDirection) => {
  if (!swingDirection) return 'right';
  
  // For single doors, handle is on the side opposite to the hinges
  if (swingDirection.includes('Left Hand')) {
    return 'left';  // Left hand doors have handle on left side
  } else if (swingDirection.includes('Right Hand')) {
    return 'right'; // Right hand doors have handle on right side
  }
  
  // For pivot doors, typically handle is on the right
  return 'right';
};

// Helper function to get handle location for doors (prioritizes handleLocation over swing direction)
const getDoorHandleLocation = (configuration) => {
  // If handleLocation is explicitly set, use it
  if (configuration.handleLocation) {
    return configuration.handleLocation;
  }
  
  // Otherwise, derive from swing direction
  return getHandleLocation(configuration.swingDirection);
};

const styles = StyleSheet.create({
  container: {
    border: '1pt solid #ddd',
    borderRadius: 2,
    padding: 8,
    backgroundColor: '#f8f8f8',
    height: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    transform: 'translateX(-50%)',
  },
  heightLabel: {
    transform: 'rotate(-90deg)',
    transformOrigin: 'center center',
    left: -15,
    top: '50%',
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
    width: 4,
    height: 12,
    backgroundColor: '#1976d2',
    borderRadius: 1,
    top: '46%',
  },
  hinge: {
    position: 'absolute',
    width: 6,
    height: 3,
    backgroundColor: '#666',
    borderRadius: 0.5,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#666',
  },
  horizontalGrid: {
    height: '1pt',
    left: 0,
    right: 0,
  },
  verticalGrid: {
    width: '1pt',
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
  },
  transom: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    border: '1pt solid #ccc',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 4,
  },
  sidelight: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    border: '1pt solid #ccc',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 4,
  }
});

const ConfigurationPreview = ({ configuration }) => {
  // --- Define Max Dimensions for the Preview Area ---
  const MAX_WIDTH = 200;  // Corresponds to '40%' of the page width in QuoteLineItem
  const MAX_HEIGHT = 140; // Fixed height in the container style, with some padding

  // Calculate the aspect ratio of the actual system
  const getSystemDimensions = () => {
    if (!configuration.dimensions) {
      return { totalWidth: 16, totalHeight: 10 }; // Default 16:10 ratio
    }
    
    let totalWidth, totalHeight;

    if (configuration.systemType === 'Entrance Doors') {
      if (configuration.dimensions.totalWidth && configuration.dimensions.totalHeight) {
        totalWidth = configuration.dimensions.totalWidth;
        totalHeight = configuration.dimensions.totalHeight;
      } else {
        totalWidth = (configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                     configuration.dimensions.width + 
                     (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0);
        totalHeight = configuration.dimensions.height + 
                      (configuration.transom?.enabled ? configuration.transom.height : 0);
      }
    } else if (configuration.systemType === 'Windows' && configuration.panels) {
      totalWidth = configuration.panels.reduce((sum, panel) => sum + panel.width, 0);
      totalHeight = configuration.dimensions.height;
    } else {
      totalWidth = configuration.dimensions.width;
      totalHeight = configuration.dimensions.height;
    }
    
    return { totalWidth, totalHeight };
  };

  const { totalWidth, totalHeight } = getSystemDimensions();
  const aspectRatio = totalWidth > 0 && totalHeight > 0 ? totalWidth / totalHeight : 1;

  // --- Calculate Scaled Dimensions to Fit Max Area ---
  let scaledWidth = MAX_WIDTH;
  let scaledHeight = MAX_WIDTH / aspectRatio;

  if (scaledHeight > MAX_HEIGHT) {
    scaledHeight = MAX_HEIGHT;
    scaledWidth = MAX_HEIGHT * aspectRatio;
  }
  
  if (scaledWidth > MAX_WIDTH) {
    scaledWidth = MAX_WIDTH;
    scaledHeight = MAX_WIDTH / aspectRatio;
  }

  // --- Dynamic Styling for the Scaled Preview ---
  const dynamicPreviewStyle = {
    width: scaledWidth,
    height: scaledHeight,
    position: 'relative',
  };

  const mainPreviewStyle = {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 2,
  };

  const renderGridLines = (horizontal, vertical) => {
    const lines = [];
    for (let i = 1; i < horizontal; i++) {
      lines.push(<View key={`v${i}`} style={[styles.gridLine, styles.verticalGrid, { left: `${(i / horizontal) * 100}%` }]} />);
    }
    for (let i = 1; i < vertical; i++) {
      lines.push(<View key={`h${i}`} style={[styles.gridLine, styles.horizontalGrid, { top: `${(i / vertical) * 100}%` }]} />);
    }
    return <View style={styles.gridLines}>{lines}</View>;
  };

  const renderSidelightGrid = (sidelightConfig) => {
    if (sidelightConfig?.grid?.enabled) {
      return renderGridLines(sidelightConfig.grid.horizontal, sidelightConfig.grid.vertical);
    }
    return null;
  };
  
  const renderPanels = () => {
    const isWindows = configuration.systemType === 'Windows';
    const totalPanelWidth = isWindows ? configuration.panels.reduce((sum, p) => sum + (p.width || 0), 0) : null;
    if (!configuration.panels || configuration.panels.length === 0) {
      return <View style={mainPreviewStyle}><Text style={styles.panelLabel}>No Panel Data</Text></View>;
    }
    if (isWindows && totalPanelWidth === 0) {
      return <View style={mainPreviewStyle}><Text style={styles.panelLabel}>Invalid Panel Data</Text></View>;
    }
    return (
      <View style={mainPreviewStyle}>
        {configuration.panels.map((panel, index) => {
          const panelWidthPercent = isWindows ? (panel.width / totalPanelWidth) * 100 : 100 / configuration.panels.length;
          return (
            <View key={index} style={[styles.panel, panel.type === 'Fixed' || panel.operationType === 'Fixed' ? styles.fixedPanel : styles.slidingPanel, { width: `${panelWidthPercent}%` }]}>
              <View style={styles.panelContent}>
                <Text style={styles.panelLabel}>{panel.type || panel.operationType}</Text>
                {panel.direction && <Text style={styles.arrow}>{panel.direction === 'left' ? '←' : '→'}</Text>}
                {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderEntranceDoor = () => {
    const { leftSidelight, rightSidelight, transom, dimensions, openingType, grid } = configuration;
    const mainDoorWidth = dimensions.width;
    const { totalWidth: doorTotalWidth, totalHeight: doorTotalHeight } = getSystemDimensions();
    return (
      <View style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
        {transom?.enabled && (
          <View style={[styles.transom, { height: (transom.height / doorTotalHeight) * 100 + '%' }]}>
            {renderSidelightGrid(transom)}
            <Text style={styles.panelLabel}>Transom</Text>
          </View>
        )}
        <View style={[mainPreviewStyle, { height: (dimensions.height / doorTotalHeight) * 100 + '%' }]}>
          {leftSidelight?.enabled && (
            <View style={[styles.sidelight, { width: (leftSidelight.width / doorTotalWidth) * 100 + '%' }]}>
              {renderSidelightGrid(leftSidelight)}
              <Text style={styles.panelLabel}>Left</Text>
            </View>
          )}
          <View style={{ width: (mainDoorWidth / doorTotalWidth) * 100 + '%', height: '100%' }}>
            {openingType === 'Double Door' ? (
              <View style={styles.doubleDoorContainer}>
                <View style={[styles.panel, styles.doorPanel, styles.leftDoorPanel]}>
                  <Text style={styles.panelLabel}>Left</Text>
                  {grid?.enabled && renderGridLines(grid.horizontal, grid.vertical)}
                </View>
                <View style={[styles.panel, styles.doorPanel, styles.rightDoorPanel]}>
                  <Text style={styles.panelLabel}>Right</Text>
                  {grid?.enabled && renderGridLines(grid.horizontal, grid.vertical)}
                </View>
              </View>
            ) : (
              <View style={[styles.panel, styles.doorPanel]}>
                <Text style={styles.panelLabel}>{openingType}</Text>
                {grid?.enabled && renderGridLines(grid.horizontal, grid.vertical)}
              </View>
            )}
          </View>
          {rightSidelight?.enabled && (
            <View style={[styles.sidelight, { width: (rightSidelight.width / doorTotalWidth) * 100 + '%' }]}>
              {renderSidelightGrid(rightSidelight)}
              <Text style={styles.panelLabel}>Right</Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={dynamicPreviewStyle}>
        {configuration.systemType === 'Sliding Doors' && renderPanels()}
        {configuration.systemType === 'Windows' && renderPanels()}
        {configuration.systemType === 'Entrance Doors' && renderEntranceDoor()}

        <Text style={[styles.dimensionLabel, styles.widthLabel]}>
          {`${Math.round(totalWidth)}"`}
        </Text>
        <Text style={[styles.dimensionLabel, styles.heightLabel]}>
          {`${Math.round(totalHeight)}"`}
        </Text>
      </View>
    </View>
  );
};

export default ConfigurationPreview; 