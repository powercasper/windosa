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
    "Sliding Doors":   ["SMARTIA M450","SMARTIA M630", "SMARTIA S650"]
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
  "Fixed": 4,
  "Tilt & Turn": 5,
  "Casement": 5,
  "Awning": 5,
  "Tilt Only": 5,
  "Hinged Left Open In": 20,
  "Hinged Right Open Out": 20,
  "Hinged Right Open In": 20,
  "Hinged Left Open Out": 20,
  "Pivot": 25,
  "Sliding →": 10,
  "Sliding ←": 10,
  "Sliding Fixed": 10,
  "Folding": 10
};

const unitCostPerSqft = {
  Alumil: {
    // Windows
    "S67":            { Fixed:22.7,  "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "S67 PHOS":       { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "S67 Urban":      { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "S77":            { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "S77 PHOS":       { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    "M9660":          { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "M9660 PHOS":     { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    // Entrance Doors
    SD67:  { 
      "Single Door": 65,
      "Double Door": 70,
      "Fixed": 30 // Keep fixed panel rate for sidelights
    },
    SD77:  { 
      "Single Door": 75,
      "Double Door": 80,
      "Fixed": 32, // Keep fixed panel rate for sidelights
      "Pivot Door": 85 // Added higher rate for pivot configuration
    },
    SD115: { 
      "Pivot Door": 90, // Main pivot door rate
      "Fixed": 35 // Fixed panel rate for sidelights
    },
    // Sliding Doors
    "SMARTIA M450": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
    "SMARTIA M630": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
    "SMARTIA S650": {
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
    }
  },
  Reynaers: {
    // Windows
    "SlimLine 38 Classic":            { Fixed:22.7,  "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "SlimLine 38 Cube":       { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "SlimLine 38 Ferro":      { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "SlimLine 68 Window":            { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    // Entrance Doors
    "SlimLine 38 Door":            { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "MasterLine 8":           { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "CS 77":                  { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
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

export {
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