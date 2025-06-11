import React from 'react';
import { View, Text } from '@react-pdf/renderer';

const ConfigurationPreview = ({ configuration, maxHeight = '200px' }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4pt',
      borderWidth: 2,
      borderColor: '#ccc',
      borderRadius: '4pt',
      padding: '4pt',
      backgroundColor: '#fff',
      aspectRatio: configuration.dimensions?.width && configuration.dimensions?.height ? 
        `${(configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
          configuration.dimensions.width + 
          (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0)} / 
         ${configuration.dimensions.height + (configuration.transom?.enabled ? configuration.transom.height : 0)}` : '16/9',
      maxHeight,
    },
    transom: {
      display: 'flex',
      gap: '4pt',
      height: configuration.transom?.enabled ? 
        `${(configuration.transom.height / (configuration.dimensions.height + configuration.transom.height)) * 100}%` : 'auto',
    },
    transomPanel: {
      padding: '2pt',
      flex: 1,
      backgroundColor: '#f5f5f5',
      color: '#000',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainSection: {
      display: 'flex',
      gap: '4pt',
      flex: 1,
      height: configuration.transom?.enabled ? 
        `${(configuration.dimensions.height / (configuration.dimensions.height + configuration.transom.height)) * 100}%` : '100%',
    },
    sidelight: {
      padding: '2pt',
      backgroundColor: '#f5f5f5',
      color: '#000',
      textAlign: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    panel: {
      padding: '2pt',
      borderWidth: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    handle: {
      position: 'absolute',
      width: '2pt',
      height: '8pt',
      backgroundColor: '#1976d2',
      borderRadius: '1pt',
    },
    caption: {
      fontSize: '6pt',
      color: '#666',
    },
  };

  const renderPanels = () => {
    if (configuration.systemType === 'Windows' && configuration.panels) {
      return (
        <View style={styles.mainSection}>
          {configuration.panels.map((panel, index) => (
            <View
              key={index}
              style={{
                ...styles.panel,
                width: `${(panel.width / configuration.panels.reduce((sum, p) => sum + p.width, 0)) * 100}%`,
                backgroundColor: panel.operationType === 'Fixed' ? '#f5f5f5' : '#bbdefb',
                borderColor: panel.operationType === 'Fixed' ? '#ccc' : '#1976d2',
              }}
            >
              <Text style={styles.caption}>
                {panel.operationType}
                {panel.type === 'Sliding' ? ` (${panel.direction === 'left' ? '←' : '→'})` : ''}
              </Text>
              {panel.operationType !== 'Fixed' && (
                <View
                  style={{
                    ...styles.handle,
                    [panel.handleLocation || 'right']: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginRight: panel.handleLocation === 'right' ? '1pt' : 'auto',
                    marginLeft: panel.handleLocation === 'left' ? '1pt' : 'auto',
                  }}
                />
              )}
            </View>
          ))}
        </View>
      );
    }

    if (configuration.systemType === 'Entrance Doors') {
      return (
        <View style={styles.mainSection}>
          {configuration.leftSidelight?.enabled && (
            <View
              style={{
                ...styles.sidelight,
                width: `${(configuration.leftSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                  configuration.dimensions.width + 
                  (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
              }}
            >
              <Text style={styles.caption}>
                Left ({configuration.leftSidelight.width}")
              </Text>
            </View>
          )}

          <View
            style={{
              ...styles.panel,
              flex: 1,
              backgroundColor: '#bbdefb',
              borderColor: '#1976d2',
            }}
          >
            <Text style={styles.caption}>
              Door ({configuration.dimensions.width}")
            </Text>
            {configuration.doorSwing && (
              <View
                style={{
                  ...styles.handle,
                  [configuration.doorSwing]: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginRight: configuration.doorSwing === 'right' ? '1pt' : 'auto',
                  marginLeft: configuration.doorSwing === 'left' ? '1pt' : 'auto',
                }}
              />
            )}
          </View>

          {configuration.rightSidelight?.enabled && (
            <View
              style={{
                ...styles.sidelight,
                width: `${(configuration.rightSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                  configuration.dimensions.width + 
                  (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
              }}
            >
              <Text style={styles.caption}>
                Right ({configuration.rightSidelight.width}")
              </Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {configuration.transom?.enabled && (
        <View style={styles.transom}>
          <View style={styles.transomPanel}>
            <Text style={styles.caption}>
              Transom ({configuration.transom.height}")
            </Text>
          </View>
        </View>
      )}
      {renderPanels()}
    </View>
  );
};

export default ConfigurationPreview; 