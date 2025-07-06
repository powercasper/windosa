import { useMemo } from 'react';

export const useFormValidation = (configuration) => {
  return useMemo(() => {
    const hasValidDimensions = configuration.dimensions?.height > 0 && configuration.dimensions?.width > 0;
    const hasValidFinish = configuration.finish?.type && 
                          configuration.finish?.color && 
                          configuration.finish?.ralColor && 
                          configuration.finish?.ralColor.length === 4;
    const hasValidModel = !!configuration.systemModel;

    if (configuration.systemType === 'Windows') {
      const hasValidPanels = configuration.panels?.length > 0 && 
        configuration.panels.every(panel => 
          panel.width > 0 && panel.operationType
        );
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidPanels;
    } 
    
    if (configuration.systemType === 'Entrance Doors') {
      const hasValidDoorConfig = configuration.openingType && 
                                configuration.swingDirection && 
                                configuration.handleType && 
                                configuration.lockType && 
                                configuration.threshold && 
                                configuration.hingeType;
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidDoorConfig;
    } 
    
    if (configuration.systemType === 'Sliding Doors') {
      const hasValidOperationType = !!configuration.operationType;
      const hasValidPanels = configuration.panels?.length > 0 && 
        configuration.panels.every(panel => 
          panel.type && (!panel.type || panel.type === 'Fixed' || (panel.type === 'Sliding' && panel.direction))
        );
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidOperationType && hasValidPanels;
    }

    if (configuration.systemType === 'Window Wall') {
      const hasValidGrid = configuration.grid?.cells?.length > 0;
      const hasValidCells = configuration.grid?.cells?.every(cell => 
        cell.type && cell.config?.dimensions?.width > 0 && cell.config?.dimensions?.height > 0
      );
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidGrid && hasValidCells;
    }

    return false;
  }, [configuration]);
}; 