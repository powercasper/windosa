import React from 'react';
import { Box, Typography } from '@mui/material';

const ConfigurationPreviewUI = ({ configuration, maxHeight = '200px' }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      border: '2px solid #ccc',
      borderRadius: '4px',
      padding: '4px',
      bgcolor: '#fff',
      aspectRatio: configuration.dimensions?.width && configuration.dimensions?.height ? 
        `${(configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
          configuration.dimensions.width + 
          (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0)} / 
         ${configuration.dimensions.height + (configuration.transom?.enabled ? configuration.transom.height : 0)}` : '16/9',
      maxHeight,
      minHeight: '100px',
      width: '100%',
      position: 'relative',
    },
    transom: {
      display: 'flex',
      gap: '4px',
      height: configuration.transom?.enabled ? 
        `${(configuration.transom.height / (configuration.dimensions.height + configuration.transom.height)) * 100}%` : 'auto',
      width: '100%',
    },
    transomPanel: {
      padding: '2px',
      flex: 1,
      bgcolor: '#f5f5f5',
      color: '#000',
      textAlign: 'center',
      border: '1px solid #ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '20px',
    },
    mainSection: {
      display: 'flex',
      gap: '4px',
      flex: 1,
      height: configuration.transom?.enabled ? 
        `${(configuration.dimensions.height / (configuration.dimensions.height + configuration.transom.height)) * 100}%` : '100%',
      width: '100%',
      minHeight: '60px',
    },
    sidelight: {
      padding: '2px',
      bgcolor: '#f5f5f5',
      color: '#000',
      textAlign: 'center',
      border: '1px solid #ccc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40px',
    },
    panel: {
      padding: '2px',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      minHeight: '40px',
    },
    handle: {
      position: 'absolute',
      width: '4px',
      height: '12px',
      bgcolor: '#1976d2',
      borderRadius: '2px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    hinge: {
      position: 'absolute',
      width: '6px',
      height: '3px',
      bgcolor: '#666',
      borderRadius: '1px',
    },
    caption: {
      fontSize: '12px',
      color: '#666',
      textAlign: 'center',
      width: '100%',
    },
    gridLine: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      pointerEvents: 'none',
    },
  };

  const renderGrid = (panel) => {
    if (!configuration.grid?.enabled) return null;

    const verticalLines = [];
    const horizontalLines = [];

    // Vertical grid lines
    for (let i = 1; i < configuration.grid.horizontal; i++) {
      verticalLines.push(
        <Box
          key={`v-${i}`}
          sx={{
            ...styles.gridLine,
            left: `${(i * 100) / configuration.grid.horizontal}%`,
            top: 0,
            bottom: 0,
            width: '1px',
          }}
        />
      );
    }

    // Horizontal grid lines
    for (let i = 1; i < configuration.grid.vertical; i++) {
      horizontalLines.push(
        <Box
          key={`h-${i}`}
          sx={{
            ...styles.gridLine,
            top: `${(i * 100) / configuration.grid.vertical}%`,
            left: 0,
            right: 0,
            height: '1px',
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
        }}
      >
        {verticalLines}
        {horizontalLines}
      </Box>
    );
  };

  const renderPanels = () => {
    if (configuration.systemType === 'Windows' && configuration.panels) {
      return (
        <Box sx={styles.mainSection}>
          {configuration.panels.map((panel, index) => (
            <Box
              key={index}
              sx={{
                ...styles.panel,
                width: `${(panel.width / configuration.panels.reduce((sum, p) => sum + p.width, 0)) * 100}%`,
                bgcolor: panel.operationType === 'Fixed' ? '#f5f5f5' : '#bbdefb',
                borderColor: panel.operationType === 'Fixed' ? '#ccc' : '#1976d2',
                overflow: 'hidden', // Ensure grid lines don't overflow
              }}
            >
              {renderGrid(panel)}
              <Typography variant="caption" sx={styles.caption}>
                {panel.operationType}
                {panel.type === 'Sliding' ? ` (${panel.direction === 'left' ? '←' : '→'})` : ''}
              </Typography>
              {panel.operationType !== 'Fixed' && (
                <Box
                  sx={{
                    ...styles.handle,
                    [panel.handleLocation || 'right']: '3px',
                  }}
                />
              )}
              {/* Add hinges for non-fixed windows - opposite side to handle */}
              {panel.operationType !== 'Fixed' && (
                <>
                  <Box sx={{
                    ...styles.hinge,
                    [panel.handleLocation === 'left' ? 'right' : 'left']: '1px',
                    top: '20%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [panel.handleLocation === 'left' ? 'right' : 'left']: '1px',
                    top: '50%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [panel.handleLocation === 'left' ? 'right' : 'left']: '1px',
                    top: '80%'
                  }} />
                </>
              )}
            </Box>
          ))}
        </Box>
      );
    }

    if (configuration.systemType === 'Sliding Doors') {
      return (
        <Box sx={styles.mainSection}>
          {configuration.panels?.map((panel, index) => (
            <Box
              key={index}
              sx={{
                ...styles.panel,
                flex: 1,
                bgcolor: panel.type === 'Fixed' ? '#f5f5f5' : '#bbdefb',
                borderColor: panel.type === 'Fixed' ? '#ccc' : '#1976d2',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {configuration.grid?.enabled && renderGrid()}
              
              <Typography variant="caption" sx={styles.caption}>
                {panel.type}
                {panel.type === 'Sliding' && panel.direction && ` (${panel.direction === 'left' ? '←' : '→'})`}
              </Typography>
              
              {panel.type === 'Sliding' && (
                <Box
                  sx={{
                    ...styles.handle,
                    [panel.direction === 'left' ? 'right' : 'left']: '3px',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      );
    }

    if (configuration.systemType === 'Entrance Doors') {
      return (
        <Box sx={styles.mainSection}>
          {configuration.leftSidelight?.enabled && (
            <Box
              sx={{
                ...styles.sidelight,
                width: `${(configuration.leftSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                  configuration.dimensions.width + 
                  (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
              }}
            >
              <Typography variant="caption" sx={styles.caption}>
                Left ({configuration.leftSidelight.width}")
              </Typography>
            </Box>
          )}

          {configuration.openingType === 'Double Door' ? (
            // Double Door Configuration
            <Box sx={{ 
              display: 'flex', 
              flex: 1, 
              gap: '2px'
            }}>
              {/* Left Door Panel */}
              <Box
                sx={{
                  ...styles.panel,
                  flex: 1,
                  bgcolor: '#bbdefb',
                  borderColor: '#1976d2',
                  overflow: 'hidden',
                  borderRight: '2px solid',
                  borderRightColor: 'grey.400',
                }}
              >
                {configuration.grid?.enabled && renderGrid()}
                <Typography variant="caption" sx={styles.caption}>
                  Left Panel ({configuration.dimensions.width / 2}")
                </Typography>
                <Box
                  sx={{
                    ...styles.handle,
                    right: '3px',
                  }}
                />
                {/* Hinges for left panel - on left side (opposite to handle) */}
                <Box sx={{ ...styles.hinge, left: '1px', top: '15%' }} />
                <Box sx={{ ...styles.hinge, left: '1px', top: '46%' }} />
                <Box sx={{ ...styles.hinge, left: '1px', top: '77%' }} />
              </Box>

              {/* Right Door Panel */}
              <Box
                sx={{
                  ...styles.panel,
                  flex: 1,
                  bgcolor: '#bbdefb',
                  borderColor: '#1976d2',
                  overflow: 'hidden',
                  borderLeft: '2px solid',
                  borderLeftColor: 'grey.400',
                }}
              >
                {configuration.grid?.enabled && renderGrid()}
                <Typography variant="caption" sx={styles.caption}>
                  Right Panel ({configuration.dimensions.width / 2}")
                </Typography>
                <Box
                  sx={{
                    ...styles.handle,
                    left: '3px',
                  }}
                />
                {/* Hinges for right panel - on right side (opposite to handle) */}
                <Box sx={{ ...styles.hinge, right: '1px', top: '15%' }} />
                <Box sx={{ ...styles.hinge, right: '1px', top: '46%' }} />
                <Box sx={{ ...styles.hinge, right: '1px', top: '77%' }} />
              </Box>
            </Box>
          ) : (
            // Single Door Configuration
            <Box
              sx={{
                ...styles.panel,
                flex: 1,
                bgcolor: '#bbdefb',
                borderColor: '#1976d2',
                overflow: 'hidden',
              }}
            >
              {configuration.grid?.enabled && renderGrid()}
              <Typography variant="caption" sx={styles.caption}>
                Door ({configuration.dimensions.width}")
              </Typography>
              {configuration.doorSwing && (
                <Box
                  sx={{
                    ...styles.handle,
                    [configuration.doorSwing]: '3px',
                  }}
                />
              )}
              {/* Hinges on opposite side to handle */}
              {configuration.doorSwing && (
                <>
                  <Box sx={{
                    ...styles.hinge,
                    [configuration.doorSwing === 'left' ? 'right' : 'left']: '1px',
                    top: '15%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [configuration.doorSwing === 'left' ? 'right' : 'left']: '1px',
                    top: '46%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [configuration.doorSwing === 'left' ? 'right' : 'left']: '1px',
                    top: '77%'
                  }} />
                </>
              )}
            </Box>
          )}

          {configuration.rightSidelight?.enabled && (
            <Box
              sx={{
                ...styles.sidelight,
                width: `${(configuration.rightSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                  configuration.dimensions.width + 
                  (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
              }}
            >
              <Typography variant="caption" sx={styles.caption}>
                Right ({configuration.rightSidelight.width}")
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={styles.container}>
      {configuration.transom?.enabled && (
        <Box sx={styles.transom}>
          <Box sx={styles.transomPanel}>
            <Typography variant="caption" sx={styles.caption}>
              Transom ({configuration.transom.height}")
            </Typography>
          </Box>
        </Box>
      )}
      {renderPanels()}
    </Box>
  );
};

export default ConfigurationPreviewUI; 