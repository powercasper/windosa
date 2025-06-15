// client/src/utils/metadata.js

const systemBrands = [
  "Alumil",
  "Reynaers"
];

const systemHierarchy = {
    Windows:                systemBrands,
    "Entrance Doors":       systemBrands,
    "Sliding Doors":        systemBrands
};

const systemArchitecture = {
  Alumil: {
    Windows:           ["S67","S67 PHOS","S67 Urban","S77","S77 PHOS","M9660","M9660 PHOS"],
    "Entrance Doors":  ["SD67","SD77","SD115"],
    "Sliding Doors":   ["SMARTIA M450","SMARTIA M630", "SUPREME S650"]
  },
  Reynaers: {
    Windows:           ["SlimLine 38 Classic","SlimLine 38 Cube","SlimLine 38 Ferro","SlimLine 68"],
    "Entrance Doors":  ["SlimLine 38", "SlimLine 68", "MasterLine 8","CS 77"],
    "Sliding Doors":   ["Hi-Finity", "SlimPatio 68"]
  }
};

const finishOptions = {
  "Powder Coated": ["Standard","Matte","Structura"],
  Anodized:       ["Standard","Brushed"]
};

const windowOperables = ["Fixed", "Tilt & Turn", "Casement", "Awning", "Tilt Only"];

const doorModelCapabilities = {
  "SD67": ["Single Door", "Double Door"],
  "SD77": ["Single Door", "Double Door", "Pivot Door"],
  "SD115": ["Pivot Door"]
};

const doorOperables = {
  openingTypes: ["Single Door", "Double Door", "Pivot Door"],
  swingDirections: {
    "Single Door": ["Left Hand In", "Left Hand Out", "Right Hand In", "Right Hand Out"],
    "Double Door": ["Active Left", "Active Right"],
    "Pivot Door": ["Center Pivot", "Left Pivot", "Right Pivot"]
  },
  handleTypes: ["Lever Handle", "Pull Handle", "Push Bar"],
  lockTypes: ["Multi-Point Lock", "Single Point Lock", "Electric Strike", "Magnetic Lock"],
  thresholds: ["Standard", "ADA Compliant", "Zero Threshold"],
  hingeTypes: ["Standard", "3D Adjustable", "Concealed", "Pivot"]
};

const laborRates = {
  "Fixed": 3,
  "Tilt & Turn": 3.7,
  "Casement": 3.7,
  "Awning": 3.7,
  "Tilt Only": 3.7,
  "Hinged Left Open In": 20,
  "Hinged Right Open Out": 20,
  "Hinged Right Open In": 20,
  "Hinged Left Open Out": 20,
  "Door Hinged Glass": 21.75,
  "Door Hinged Panel": 21.75,
  "Pivot": 29.00,
  "Sliding →": 8.70,
  "Sliding ←": 8.70,
  "Sliding Fixed": 8.70,
  "Folding": 8.70
};

const unitCostPerSqft = {
  Alumil: {
    // Windows
    "S67":            { Fixed:16,   "Tilt & Turn":31,   Casement:30, Awning:28, "Tilt Only":33 },
    "S67 PHOS":       { Fixed:16,   "Tilt & Turn":31,   Casement:31, Awning:30, "Tilt Only":33 },
    "S67 Urban":      { Fixed:17,   "Tilt & Turn":32,   Casement:31, Awning:30, "Tilt Only":33 },
    "S77":            { Fixed:17,   "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":33 },
    "S77 PHOS":       { Fixed:17,   "Tilt & Turn":32,   Casement:33, Awning:31, "Tilt Only":33 },
    "M9660":          { Fixed:15,   "Tilt & Turn":30,   Casement:32, Awning:29, "Tilt Only":33 },
    "M9660 PHOS":     { Fixed:15,   "Tilt & Turn":30,   Casement:33, Awning:31, "Tilt Only":33 },
    // Entrance Doors
    SD67:  { 
      "Single Door": 65,
      "Double Door": 70,
      "Fixed": 17 // Keep fixed panel rate for sidelights
    },
    SD77:  { 
      "Single Door": 75,
      "Double Door": 80,
      "Fixed": 17, // Keep fixed panel rate for sidelights
      "Pivot Door": 85 // Added higher rate for pivot configuration
    },
    SD115: { 
      "Pivot Door": 90, // Main pivot door rate
      "Fixed": 35 // Fixed panel rate for sidelights
    },
    // Sliding Doors
    "SMARTIA M450": {"OX": 27.42, "XX": 29.50, "OXX": 28.69, "XXX": 30.49, "OXXO": 18.59, "OXXX": 20.39, "XXXX": 20.98},
    "SMARTIA M630": {"OX": 27.42, "XX": 29.50, "OXX": 28.69, "XXX": 30.49, "OXXO": 18.59, "OXXX": 20.39, "XXXX": 20.98},
    "SUPREME S650": {
      "OX": 40.62,
      "XX": 43.33,
      "OXX": 41.45,
      "XXX": 43.44,
      "OXXO": 31.16,
      "OXXX": 41.51,
      "XXXX": 33.6,
      "OXXXX": 33.9,  // 1 fixed + 4 sliding
      "XXXXO": 33.9,  // 4 sliding + 1 fixed
      "OXXXO": 33.5,  // 2 fixed + 3 sliding
      "OOXXX": 33.2,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 33.2,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 34.32,
      "XXXXXX": 35.5,  // 6 sliding panels
      "OOXXOO": 33.8   // 2 sliding panels with fixed ends and sides
    }
  },
  Reynaers: {
    // Windows
    "SlimLine 38 Classic":      { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":33 },
    "SlimLine 38 Cube":         { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":33 },
    "SlimLine 38 Ferro":        { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":35 },
    "SlimLine 68 Window":       { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":35 },
    // Entrance Doors
    "SlimLine 38 Door":         { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":35 },
    "MasterLine 8":             { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":35 },
    "CS 77":                    { Fixed:17, "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":35 },
    // Sliding Doors
    "Hi-Finity": {
      "OX": 40.62,
      "XX": 43.33,
      "OXX": 41.45,
      "XXX": 43.44,
      "OXXO": 31.16,
      "OXXX": 32.83,
      "XXXX": 33.6,
      "OXXXX": 33.9,  // 1 fixed + 4 sliding
      "XXXXO": 33.9,  // 4 sliding + 1 fixed
      "OXXXO": 33.5,  // 2 fixed + 3 sliding
      "OOXXX": 33.2,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 33.2,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 34.32,
      "XXXXXX": 35.5,  // 6 sliding panels
      "OOXXOO": 33.8   // 2 sliding panels with fixed ends and sides
    },
    "SlimPatio 68": {
      "OX": 40.62,
      "XX": 43.33,
      "OXX": 41.45,
      "XXX": 43.44,
      "OXXO": 31.16,
      "OXXX": 32.83,
      "XXXX": 33.6,
      "OXXXX": 33.9,  // 1 fixed + 4 sliding
      "XXXXO": 33.9,  // 4 sliding + 1 fixed
      "OXXXO": 33.5,  // 2 fixed + 3 sliding
      "OOXXX": 33.2,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 33.2,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 34.32,
      "XXXXXX": 35.5,  // 6 sliding panels
      "OOXXOO": 33.8   // 2 sliding panels with fixed ends and sides
    },
  }
};

module.exports = {
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  doorModelCapabilities,
  unitCostPerSqft,
  systemBrands
}; 