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
    
    // Vertical lines (based on horizontal divisions)
    for (let i = 1; i < horizontal; i++) {
      lines.push(
        <View
          key={`v${i}`}
          style={[
            styles.gridLine,
            styles.verticalGrid,
            { left: `${(i / horizontal) * 100}%` }
          ]}
        />
      );
    }
    
    // Horizontal lines (based on vertical divisions)
    for (let i = 1; i < vertical; i++) {
      lines.push(
        <View
          key={`h${i}`}
          style={[
            styles.gridLine,
            styles.horizontalGrid,
            { top: `${(i / vertical) * 100}%` }
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
              {/* Add operation description for clarity */}
              {panel.operationType !== 'Fixed' && (
                <Text style={[styles.panelLabel, { fontSize: 5, color: '#888' }]}>
                  {panel.operationType === 'Casement' && '(open out)'}
                  {panel.operationType === 'Awning' && '(open out)'}
                  {panel.operationType === 'Tilt Only' && '(open in)'}
                  {panel.operationType === 'Tilt & Turn' && '(open in)'}
                </Text>
              )}
              <Text style={styles.panelLabel}>{Math.round(panel.width)}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              {/* Add handle for non-fixed windows */}
              {panel.operationType !== 'Fixed' && (
                <View style={[
                  styles.handle, 
                  panel.operationType === 'Awning' 
                    ? { left: '45%', top: '85%' }  // Bottom center for awning
                    : { [panel.handleLocation || 'right']: 3 }  // Side position for others
                ]} />
              )}
              {/* Add hinges for non-fixed windows */}
              {panel.operationType !== 'Fixed' && (
                <>
                  {panel.operationType === 'Awning' ? (
                    // Top hinges for awning windows
                    <>
                      <View style={[styles.hinge, { left: '20%', top: 1 }]} />
                      <View style={[styles.hinge, { left: '45%', top: 1 }]} />
                      <View style={[styles.hinge, { left: '70%', top: 1 }]} />
                    </>
                  ) : panel.operationType === 'Tilt Only' ? (
                    // Bottom hinges for tilt-only windows
                    <>
                      <View style={[styles.hinge, { left: '20%', bottom: 1 }]} />
                      <View style={[styles.hinge, { left: '45%', bottom: 1 }]} />
                      <View style={[styles.hinge, { left: '70%', bottom: 1 }]} />
                    </>
                  ) : panel.operationType === 'Tilt & Turn' ? (
                    // Side hinges for tilt and turn windows (opposite side to handle)
                    <>
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '20%' }
                      ]} />
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '50%' }
                      ]} />
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '80%' }
                      ]} />
                    </>
                  ) : (
                    // Side hinges for other window types
                    <>
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '20%' }
                      ]} />
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '50%' }
                      ]} />
                      <View style={[
                        styles.hinge, 
                        { [panel.handleLocation === 'left' ? 'right' : 'left']: 1, top: '80%' }
                      ]} />
                    </>
                  )}
                </>
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
                  {/* Direction Text - Shows sliding direction */}
                  <Text style={{
                    fontSize: 8, 
                    fontWeight: 'bold',
                    color: '#1976d2',
                    position: 'absolute',
                    top: '70%',
                    left: '40%',
                  }}>
                    {panel.direction === 'left' ? 'LEFT' : 'RIGHT'}
                  </Text>

                  {/* Handle for sliding door - positioned opposite to sliding direction */}
                  <View style={[
                    styles.handle, 
                    { [panel.direction === 'left' ? 'right' : 'left']: 3 }
                  ]} />
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
              <Text style={styles.panelLabel}>{Math.round(configuration.dimensions.width / 2)}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              {/* Right handle for left panel */}
              <View style={[styles.handle, { right: 3 }]} />
              {/* Hinges for left panel - on left side (opposite to handle) */}
              <View style={[styles.hinge, { left: 1, top: '15%' }]} />
              <View style={[styles.hinge, { left: 1, top: '46%' }]} />
              <View style={[styles.hinge, { left: 1, top: '77%' }]} />
            </View>
          </View>

          {/* Right Door Panel */}
          <View style={[styles.panel, styles.doorPanel, styles.rightDoorPanel]}>
            <View style={styles.panelContent}>
              <Text style={styles.panelLabel}>Right Panel</Text>
              <Text style={styles.panelLabel}>{Math.round(configuration.dimensions.width / 2)}"</Text>
              {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
              {/* Left handle for right panel */}
              <View style={[styles.handle, { left: 3 }]} />
              {/* Hinges for right panel - on right side (opposite to handle) */}
              <View style={[styles.hinge, { right: 1, top: '15%' }]} />
              <View style={[styles.hinge, { right: 1, top: '46%' }]} />
              <View style={[styles.hinge, { right: 1, top: '77%' }]} />
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
            <Text style={styles.panelLabel}>{Math.round(configuration.dimensions.width)}"</Text>
            {configuration.grid?.enabled && renderGridLines(configuration.grid.horizontal, configuration.grid.vertical)}
            {/* Handle based on configuration */}
            <View style={[
              styles.handle, 
              { [configuration.handleLocation === 'left' ? 'left' : 'right']: 3 }
            ]} />
            {/* Hinges on opposite side to handle */}
            <View style={[
              styles.hinge, 
              { [configuration.handleLocation === 'left' ? 'right' : 'left']: 1, top: '15%' }
            ]} />
            <View style={[
              styles.hinge, 
              { [configuration.handleLocation === 'left' ? 'right' : 'left']: 1, top: '46%' }
            ]} />
            <View style={[
              styles.hinge, 
              { [configuration.handleLocation === 'left' ? 'right' : 'left']: 1, top: '77%' }
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
        {configuration.dimensions?.totalWidth && (
          <Text style={[styles.dimensionLabel, styles.widthLabel]}>
            {Math.round(configuration.dimensions.totalWidth)}"
          </Text>
        )}
        {configuration.dimensions?.totalHeight && (
          <Text style={[styles.dimensionLabel, styles.heightLabel]}>
            {Math.round(configuration.dimensions.totalHeight)}"
          </Text>
        )}
        
        {renderPanels()}
      </View>
    </View>
  );
};

export default ConfigurationPreview; 