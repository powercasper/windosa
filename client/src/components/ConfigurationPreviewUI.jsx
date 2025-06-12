import React from 'react';
import { Box, Typography } from '@mui/material';

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

const ConfigurationPreviewUI = ({ configuration, maxHeight = '200px' }) => {
  // Calculate total dimensions for better scaling
  const calculateDimensions = () => {
    let totalWidth = 0;
    let totalHeight = 0;
    
    if (configuration.systemType === 'Windows' && configuration.panels) {
      totalWidth = configuration.panels.reduce((sum, panel) => sum + panel.width, 0);
      totalHeight = configuration.dimensions?.height || 48;
    } else if (configuration.systemType === 'Sliding Doors') {
      totalWidth = configuration.dimensions?.width || 72;
      totalHeight = configuration.dimensions?.height || 80;
    } else if (configuration.systemType === 'Entrance Doors') {
      totalWidth = (configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                   configuration.dimensions.width + 
                   (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0);
      totalHeight = configuration.dimensions.height + 
                    (configuration.transom?.enabled ? configuration.transom.height : 0);
    }
    
    return { totalWidth, totalHeight };
  };

  const { totalWidth, totalHeight } = calculateDimensions();
  
  // Calculate constrained aspect ratio to prevent extreme ratios
  const rawAspectRatio = totalWidth && totalHeight ? totalWidth / totalHeight : 1.5;
  const constrainedAspectRatio = Math.max(0.4, Math.min(3.5, rawAspectRatio));
  
  // Calculate responsive dimensions based on constraints
  const getOptimalDimensions = () => {
    const baseMaxHeight = parseInt(maxHeight) || 200;
    
    if (rawAspectRatio < 0.5) {
      // Very tall/narrow - ensure minimum width while respecting height
      const minWidth = 120;
      const optimalHeight = Math.min(baseMaxHeight * 1.3, 300);
      return {
        width: Math.max(minWidth, optimalHeight * constrainedAspectRatio),
        height: optimalHeight,
        aspectRatio: constrainedAspectRatio
      };
    } else if (rawAspectRatio > 2.5) {
      // Very wide - ensure reasonable height while respecting width
      const minHeight = 80;
      const optimalHeight = Math.max(minHeight, baseMaxHeight * 0.8);
      return {
        width: optimalHeight * constrainedAspectRatio,
        height: optimalHeight,
        aspectRatio: constrainedAspectRatio
      };
    } else {
      // Normal proportions
      return {
        width: baseMaxHeight * constrainedAspectRatio,
        height: baseMaxHeight,
        aspectRatio: constrainedAspectRatio
      };
    }
  };

  const { width: containerWidth, height: containerHeight, aspectRatio } = getOptimalDimensions();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      border: '2px solid #ccc',
      borderRadius: '4px',
      padding: '4px',
      bgcolor: '#fff',
      width: `${containerWidth}px`,
      height: `${containerHeight}px`,
      minWidth: '120px',
      minHeight: '80px',
      maxWidth: '500px',
      maxHeight: `${Math.min(containerHeight, 350)}px`,
      position: 'relative',
      margin: '0 auto', // Center the preview
    },
    transom: {
      display: 'flex',
      gap: '4px',
      height: configuration.transom?.enabled ? 
        `${Math.max(15, (configuration.transom.height / totalHeight) * 100)}%` : 'auto',
      width: '100%',
      minHeight: configuration.transom?.enabled ? '20px' : 'auto',
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
      minHeight: '18px',
      fontSize: Math.max(9, Math.min(12, containerHeight / 20)),
    },
    mainSection: {
      display: 'flex',
      gap: '4px',
      flex: 1,
      height: configuration.transom?.enabled ? 
        `${Math.min(85, ((totalHeight - (configuration.transom?.height || 0)) / totalHeight) * 100)}%` : '100%',
      width: '100%',
      minHeight: '40px',
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
      minHeight: '30px',
      fontSize: Math.max(8, Math.min(11, containerHeight / 25)),
    },
    panel: {
      padding: '2px',
      border: '1px solid',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      minHeight: '30px',
      fontSize: Math.max(8, Math.min(11, containerHeight / 25)),
    },
    handle: {
      position: 'absolute',
      width: Math.max(3, Math.min(6, containerWidth / 40)),
      height: Math.max(8, Math.min(15, containerHeight / 20)),
      bgcolor: '#1976d2',
      borderRadius: '2px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    hinge: {
      position: 'absolute',
      width: Math.max(4, Math.min(8, containerWidth / 30)),
      height: Math.max(2, Math.min(4, containerHeight / 60)),
      bgcolor: '#666',
      borderRadius: '1px',
    },
    caption: {
      fontSize: Math.max(8, Math.min(12, containerHeight / 20)),
      color: '#666',
      textAlign: 'center',
      width: '100%',
      lineHeight: 1.2,
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

  // Render grid for sidelights with their own grid configuration
  const renderSidelightGrid = (sidelightConfig) => {
    if (!sidelightConfig?.grid?.enabled) return null;

    const verticalLines = [];
    const horizontalLines = [];

    // Vertical grid lines
    for (let i = 1; i < sidelightConfig.grid.horizontal; i++) {
      verticalLines.push(
        <Box
          key={`v-${i}`}
          sx={{
            ...styles.gridLine,
            left: `${(i * 100) / sidelightConfig.grid.horizontal}%`,
            top: 0,
            bottom: 0,
            width: '1px',
          }}
        />
      );
    }

    // Horizontal grid lines
    for (let i = 1; i < sidelightConfig.grid.vertical; i++) {
      horizontalLines.push(
        <Box
          key={`h-${i}`}
          sx={{
            ...styles.gridLine,
            top: `${(i * 100) / sidelightConfig.grid.vertical}%`,
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

  // Render grid for transom with its own grid configuration
  const renderTransomGrid = (transomConfig) => {
    if (!transomConfig?.grid?.enabled) return null;

    const verticalLines = [];
    const horizontalLines = [];

    // Vertical grid lines
    for (let i = 1; i < transomConfig.grid.horizontal; i++) {
      verticalLines.push(
        <Box
          key={`v-${i}`}
          sx={{
            ...styles.gridLine,
            left: `${(i * 100) / transomConfig.grid.horizontal}%`,
            top: 0,
            bottom: 0,
            width: '1px',
          }}
        />
      );
    }

    // Horizontal grid lines
    for (let i = 1; i < transomConfig.grid.vertical; i++) {
      horizontalLines.push(
        <Box
          key={`h-${i}`}
          sx={{
            ...styles.gridLine,
            top: `${(i * 100) / transomConfig.grid.vertical}%`,
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
              {/* Add operation description for clarity */}
              {panel.operationType !== 'Fixed' && (
                <Typography variant="caption" sx={{
                  ...styles.caption, 
                  fontSize: Math.max(6, styles.caption.fontSize * 0.8), 
                  color: '#888', 
                  marginTop: '-1px'
                }}>
                  {panel.operationType === 'Casement' && '(open out)'}
                  {panel.operationType === 'Awning' && '(open out)'}
                  {panel.operationType === 'Tilt Only' && '(open in)'}
                  {panel.operationType === 'Tilt & Turn' && '(open in)'}
                </Typography>
              )}
              {panel.operationType !== 'Fixed' && (
                <Box
                  sx={{
                    ...styles.handle,
                    ...(panel.operationType === 'Awning' 
                      ? { left: '45%', top: '85%', transform: 'none' }
                      : { [panel.handleLocation || 'right']: '2px' }
                    )
                  }}
                />
              )}
              {/* Add hinges for non-fixed windows */}
              {panel.operationType !== 'Fixed' && (
                <>
                  {panel.operationType === 'Awning' ? (
                    // Top hinges for awning windows
                    <>
                      <Box sx={{ ...styles.hinge, left: '20%', top: '1px' }} />
                      <Box sx={{ ...styles.hinge, left: '45%', top: '1px' }} />
                      <Box sx={{ ...styles.hinge, left: '70%', top: '1px' }} />
                    </>
                  ) : panel.operationType === 'Tilt Only' ? (
                    // Bottom hinges for tilt-only windows
                    <>
                      <Box sx={{ ...styles.hinge, left: '20%', bottom: '1px' }} />
                      <Box sx={{ ...styles.hinge, left: '45%', bottom: '1px' }} />
                      <Box sx={{ ...styles.hinge, left: '70%', bottom: '1px' }} />
                    </>
                  ) : panel.operationType === 'Tilt & Turn' ? (
                    // Side hinges for tilt and turn windows (opposite side to handle)
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
                  ) : (
                    // Side hinges for other window types
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
                    [panel.direction === 'left' ? 'right' : 'left']: '2px',
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
                position: 'relative',
              }}
            >
              {renderSidelightGrid(configuration.leftSidelight)}
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
                  Left Panel ({(configuration.dimensions.width / 2).toFixed(0)}")
                </Typography>
                <Box
                  sx={{
                    ...styles.handle,
                    right: '2px',
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
                  Right Panel ({(configuration.dimensions.width / 2).toFixed(0)}")
                </Typography>
                <Box
                  sx={{
                    ...styles.handle,
                    left: '2px',
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
              {configuration.swingDirection && (
                <>
                  {/* Handle based on swing direction */}
                  <Box
                    sx={{
                      ...styles.handle,
                      [getHandleLocation(configuration.swingDirection)]: '2px',
                    }}
                  />
                  {/* Hinges on opposite side to handle */}
                  <Box sx={{
                    ...styles.hinge,
                    [getHandleLocation(configuration.swingDirection) === 'left' ? 'right' : 'left']: '1px',
                    top: '15%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [getHandleLocation(configuration.swingDirection) === 'left' ? 'right' : 'left']: '1px',
                    top: '46%'
                  }} />
                  <Box sx={{
                    ...styles.hinge,
                    [getHandleLocation(configuration.swingDirection) === 'left' ? 'right' : 'left']: '1px',
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
                position: 'relative',
              }}
            >
              {renderSidelightGrid(configuration.rightSidelight)}
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
          <Box sx={{ ...styles.transomPanel, position: 'relative' }}>
            {renderTransomGrid(configuration.transom)}
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