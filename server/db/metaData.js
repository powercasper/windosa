// server/db/metaData.js - Single source of truth for all metadata

const systemBrands = [
  "Alumil",
  "Reynaers"
];



const systemHierarchy = {
    "Windows":              systemBrands,
    "Entrance Doors":       systemBrands,
    "Sliding Doors":        systemBrands
};

const systemArchitecture = {
  Alumil: {
    "Windows":            ["S67 Urban", "S77", "S77 PHOS"],
    "Entrance Doors":     ["SD77", "SD115"],
    "Sliding Doors":      ["SMARTIA M450", "SMARTIA M630", "SUPREME S650"]
  },
  Reynaers: {
    "Windows":            ["SlimLine 38 Classic","SlimLine 38 Cube","SlimLine 38 Ferro","SlimLine 68"],
    "Entrance Doors":     ["SlimLine 38", "SlimLine 68", "MasterLine 8","CS 77"],
    "Sliding Doors":      ["Hi-Finity", "SlimPatio 68"]
  }
};

const finishOptions = {
  "Powder Coated": ["Standard", "Matte", "Structura"],
  "Anodized":      ["Standard", "Brushed"]
};

const windowOperables = ["Fixed", "Tilt & Turn", "Casement", "Awning", "Tilt Only"];

const doorOperables = {
  openingTypes: ["Single Door", "Double Door", "Pivot Door"],
  swingDirections: {
    "Single Door":  ["Left Hand In", "Left Hand Out", "Right Hand In", "Right Hand Out"],
    "Double Door":  ["Active Left", "Active Right"],
    "Pivot Door":   ["Center Pivot", "Left Pivot", "Right Pivot"]
  },
  handleTypes:  ["Lever Handle", "Pull Handle", "Push Bar"],
  lockTypes:    ["Multi-Point Lock", "Single Point Lock", "Electric Strike", "Magnetic Lock"],
  thresholds:   ["Standard", "ADA Compliant", "Zero Threshold"],
  hingeTypes:   ["Standard", "3D Adjustable", "Concealed", "Pivot"]
};

const doorModelCapabilities = {
  "SD67":   ["Single Door", "Double Door"],
  "SD77":   ["Single Door", "Double Door", "Pivot Door"],
  "SD115":  ["Pivot Door"]
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
    "S67 Urban":      { Fixed:17,   "Tilt & Turn":32,   Casement:31, Awning:30, "Tilt Only":33 },
    "S77":            { Fixed:17,   "Tilt & Turn":32,   Casement:32, Awning:29, "Tilt Only":33 },
    "S77 PHOS":       { Fixed:17,   "Tilt & Turn":32,   Casement:33, Awning:31, "Tilt Only":33 },
    // Entrance Doors
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
      "OXXX": 30.78,
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

const unitCostPerLinearInch = {
  Alumil: {
    // Windows
    "S67 Urban":      { Fixed:0.77,   "Tilt & Turn":1.88,   Casement:1.88, Awning:1.88, "Tilt Only":1.88, grid: 0.35 },
    "S77":            { Fixed:0.77,   "Tilt & Turn":1.88,   Casement:1.88, Awning:1.88, "Tilt Only":1.88, grid: 0.35 },
    "S77 PHOS":       { Fixed:0.77,   "Tilt & Turn":1.88,   Casement:1.88, Awning:1.88, "Tilt Only":1.88, grid: 0.35 },
    // Entrance Doors
    SD77:  { 
      "Single Door": 3.5,
      "Double Door": 6,
      "grid": 0.35,
      "Fixed": 0.77, // Keep fixed panel rate for sidelights
      "Pivot Door": 5.85 // Added higher rate for pivot configuration
    },
    SD115: { 
      "grid": 0.35,
      "Pivot Door": 7, // Main pivot door rate
      "Fixed": 0.77 // Fixed panel rate for sidelights
    },
    // Sliding Doors
    "SMARTIA M450": {"OX": 4.75, "XX": 5.2, "OXX": 6.35, "XXX": 6.2, "OXXO": 4.30, "OXXX": 4.60, "XXXX": 4.80},
    "SMARTIA M630": {"OX": 4.75, "XX": 5.2, "OXX": 6.35, "XXX": 6.2, "OXXO": 4.30, "OXXX": 4.60, "XXXX": 4.80},
    "SUPREME S650": {
      "OX": 4.75, "XX": 5.2, "OXX": 6.35, "XXX": 6.2, "OXXO": 4.30, "OXXX": 4.60, "XXXX": 4.80,
      "OXXXX": 6.50,  // 1 fixed + 4 sliding
      "XXXXO": 6.50,  // 4 sliding + 1 fixed
      "OXXXO": 6.50,  // 2 fixed + 3 sliding
      "OOXXX": 6.50,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 6.50,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 6.50,
      "XXXXXX": 6.50,  // 6 sliding panels
      "OOXXOO": 6.50  // 2 sliding panels with fixed ends and sides
    }
  },
  Reynaers: {
    // Windows
    // 
    "MasterLine 8":             { Fixed:1.08,   "Tilt & Turn":2.77,   Casement:2.77, Awning:2.77, "Tilt Only":2.77, grid: 0.5 },
    "ConceptSystem 77":         { Fixed:0.78,   "Tilt & Turn":2.60,   Casement:2.60, Awning:2.60, "Tilt Only":2.60, grid: 0.5 },
    "SlimLine 38 Classic":      { Fixed:0.98,   "Tilt & Turn":2.73,   Casement:2.73, Awning:2.73, "Tilt Only":2.73, grid: 0.5 },
    "SlimLine 38 Cube":         { Fixed:0.89,   "Tilt & Turn":2.64,   Casement:2.64, Awning:2.64, "Tilt Only":2.64, grid: 0.5 },
    "SlimLine 38 Ferro":        { Fixed:0.77,   "Tilt & Turn":1.88,   Casement:1.88, Awning:1.88, "Tilt Only":1.88, grid: 0.5 },
    "SlimLine 68 Window":       { Fixed:0.77,   "Tilt & Turn":1.88,   Casement:1.88, Awning:1.88, "Tilt Only":1.88, grid: 0.5 },
    // Entrance Doors
    "SlimLine 38 Door":         { 
      grid: 0.35,
      "Single Door": 3.5,
      "Double Door": 6,
      "Fixed": 0.77 // Keep fixed panel rate for sidelights
    },
    "MasterLine 8":             { 
      grid: 0.35,
      "Single Door": 3.5,
      "Double Door": 6,
      "Fixed": 0.77 // Keep fixed panel rate for sidelights
    },
    "CS 77":                    { 
      grid: 0.35,
      "Single Door": 3.5,
      "Double Door": 6,
      "Fixed": 0.77 // Keep fixed panel rate for sidelights
    },
    // Sliding Doors
    "Hi-Finity": {
      "OX": 9.47, "XX": 5.2, "OXX": 12.35, "XXX": 6.2, "OXXO": 11.75, "OXXX": 4.60, "XXXX": 4.80,
      "OXXXX": 6.50,  // 1 fixed + 4 sliding
      "XXXXO": 6.50,  // 4 sliding + 1 fixed
      "OXXXO": 6.50,  // 2 fixed + 3 sliding
      "OOXXX": 6.50,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 6.50,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 6.50,
      "XXXXXX": 6.50,  // 6 sliding panels
      "OOXXOO": 6.50  // 2 sliding panels with fixed ends and sides
    },
    "SlimPatio 68": {
      "OX": 4.75, "XX": 5.2, "OXX": 6.35, "XXX": 6.2, "OXXO": 4.30, "OXXX": 4.60, "XXXX": 4.80,
      "OXXXX": 6.50,  // 1 fixed + 4 sliding
      "XXXXO": 6.50,  // 4 sliding + 1 fixed
      "OXXXO": 6.50,  // 2 fixed + 3 sliding
      "OOXXX": 6.50,  // 2 fixed + 3 sliding (grouped)
      "XXXOO": 6.50,  // 3 sliding + 2 fixed (grouped)
      "OXXXXO": 6.50,
      "XXXXXX": 6.50,  // 6 sliding panels
      "OOXXOO": 6.50  // 2 sliding panels with fixed ends and sides
    },
  }
};

const windowHardwareOptions = [
  {
    type: 'ALUMIL 7mm PIN HANDLES',
    colors: [
      'WHITE',
      'BROWN',
      'BLACK MATT',
      'LIGHT SILVER',
      'BRONZE',
      'TITANIUM'
    ],
    description: `Aluminium 7mm pin handles with Alumil Patented design and logo for opening, tilt-and-turn, sliding and curtain wall systems.\n\nSecurity Secustic® mechanism to prevent reverse (outside) rotation of the handle and offer anti-burglar protection.\nRotation from 0ο to 180ο with stop position at 90ο.\n\n4 versions available: Standard, Full metal cover, Cranked, Long.\nAvailable also in pairs for in-out application (without Secustic).\nFlush handle available for the outside.\nPin fixed on handle.\n\nMATERIALS: Full aluminium main body, Polyamide base, Base cover plastic (Standard / Long) or metal (Metal cover / Cranked), Galvanized pin.\n\nSURFACE COATING: White powder coating RAL 9016, Black powder coating RAL 9712 mat, Brown powder coating RAL 8707, Silver / Titanium / Bronze anodization, Special colors upon request.\n\nCERTIFICATION: Certified according to EN 13126-3:2012-02. Durability: Grade 3/180 -> 10,000 cycles, 15,000 cycles - Independent test. Corrosion resistance: Grade 5 -> 480 hours salt-spray test [EN 1670]. 10 Year operational Guarantee. Alumil 5 Year Guarantee.`
  },
  {
    type: 'ALUMIL CREMONES',
    colors: [
      'WHITE',
      'BLACK MATT',
      'SILVER ANODIC ICE'
    ],
    description: `Cremones for casement and tilt/turn windows with Alumil Patented design and logo.\n\nTwo fork version for casement windows. One fork version for tilt/turn windows using the Alumil “Standard” t/t euro groove mechanism. Applicable to all Alumil 15/20 euro groove hinged systems. Engraved Alumil logo on the body.\n\nMATERIALS: Main body, lever, internal mechanism and forks made of die casted zamak (EN 1774). Inox counter plate. Inox TCEI 5MAx10mm allen screws.\n\nSURFACE COATING: White powder coating RAL 9016, Black matte powder coating RAL 9005 mat, Silver powder coating (anodic ice).\n\nCERTIFICATION: Certified according to EN 13126-3:2011. Durability: Grade 5 -> 25,000 cycles. Corrosion resistance: Grade 4 -> 240 hours salt-spray test [EN 1670]. Alumil 5 Year Guarantee.`
  }
];

module.exports = {
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  doorModelCapabilities,
  unitCostPerSqft,
  systemBrands,
  unitCostPerLinearInch,
  windowHardwareOptions
}; 