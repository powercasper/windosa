const initialConfiguration = {
  finish: {
    type: '',
    color: '',
    ralColor: null
  }
};

const QuoteForm = () => {
  const validateSystemConfiguration = (config) => {
    const errors = {};
    
    // Validate finish
    if (!config.finish.type) {
      errors.finish_type = true;
    }
    if (!config.finish.color) {
      errors.finish_color = true;
    }
    if (config.finish.type === 'Powder Coated' && !config.finish.ralColor) {
      errors.finish_ralColor = true;
    }

    return errors;
  };

  // ... rest of the component ...
}; 