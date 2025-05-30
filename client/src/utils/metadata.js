// client/src/utils/metadata.js

const systemBrands = [
  "Alumil",
  "Reynaers"
];

const systemHierarchy = {
    Windows:                systemBrands,
    "Entrance Doors":       systemBrands,
    "Sliding Doors":        systemBrands,
    "Folding Doors":        systemBrands,
    "Curtain Wall Systems": systemBrands
};

const systemArchitecture = {
  Alumil: {
    Windows:           ["S67","S67 PHOS","S67 Urban","S77","S77 PHOS","M9660","M9660 PHOS"],
    "Entrance Doors":  ["SD67","SD77","SD115"],
    "Sliding Doors":   ["SMARTIA M450","SMARTIA M630"],
    "Folding Doors":   ["SMARTIA M19800","SUPREME SF85"],
    "Curtain Wall Systems":["SMARTIA M6","SUPREME S86 PHOS"]
  },
  Reynaers: {
    Windows:           ["SlimLine 38 Classic","SlimLine 38 Cube","SlimLine 38 Ferro","SlimLine 68"],
    "Entrance Doors":  ["SlimLine 38", "SlimLine 68", "MasterLine 8","CS 77"],
    "Sliding Doors":   ["Hi-Finity"],
    "Folding Doors":   ["CF 77","CF 68"],
    "Curtain Wall Systems":["CW 50","Element Façade"]
  }
};

const finishOptions = {
  "Powder Coated": ["Standard","Matte","Structura"],
  Anodized:       ["Standard","Brushed"]
};

const windowOperables = ["Fixed", "Tilt & Turn", "Casement", "Awning", "Tilt Only"];
const doorOperables   = ["Hinged Left Open In","Hinged Right Open Out","Hinged Right Open In","Hinged Left Open Out"];

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
    SD67:  { Fixed:30, "Hinged Left Open In":45, "Hinged Right Open In":45, "Hinged Left Open Out":46, "Hinged Right Open Out":46 },
    SD77:  { Fixed:32, "Hinged Left Open In":48, "Hinged Right Open In":48, "Hinged Left Open Out":49, "Hinged Right Open Out":49 },
    SD115: { Fixed:35, "Hinged Left Open In":52, "Hinged Right Open In":52, "Hinged Left Open Out":53, "Hinged Right Open Out":53 },
    // Sliding Doors
    "SMARTIA M450": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
    "SMARTIA M630": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
  }
};

export {
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  unitCostPerSqft,
  systemBrands
}; 