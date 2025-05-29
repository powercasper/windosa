// server/db/metaData.js
//
// ─── METADATA ──────────────────────────────────────────────────────────────────
//

const systemBrands = [
  "Alumil",
  "Aluprof",
  "Cortizo",
  "Reynaers",
  "Schuco"
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
  Aluprof: {
    Windows:           ["MB-60","MB-70","MB-86","MB-104 Passive"],
    "Entrance Doors":  ["MB-70 Doors","MB-86 Doors","MB-104 Doors"],
    "Sliding Doors":   ["MB-Slide"],
    "Folding Doors":   ["MB-86 Fold Line"],
    "Curtain Wall Systems":["MB-SR50N","MB-TT50","MB-SR60"]
  },
  Cortizo: {
    Windows:           ["COR 60","COR 70 Industrial","COR 80 Hidden Sash"],
    "Entrance Doors":  ["Millennium 2000","Millennium 70"],
    "Sliding Doors":   ["COR Vision"],
    "Folding Doors":   ["BiFold Plus"],
    "Curtain Wall Systems":["TP52","ST52","CW CT70"]
  },
  Reynaers: {
    Windows:           ["SlimLine 38 Classic","SlimLine 38 Cube","SlimLine 38 Ferro","SlimLine 68"],
    "Entrance Doors":  ["SlimLine 38", "SlimLine 68", "MasterLine 8","CS 77"],
    "Sliding Doors":   ["Hi-Finity"],
    "Folding Doors":   ["CF 77","CF 68"],
    "Curtain Wall Systems":["CW 50","Element Façade"]
  },
  Schuco: {
    Windows:           ["AWS 65","AWS 75.SI+","AWS 90.SI+"],
    "Entrance Doors":  ["ADS 65","ADS 75.SI+"],
    "Sliding Doors":   ["ASS 70.HI"],
    "Folding Doors":   ["ASS 70 FD","ASS 80 FD.HI"],
    "Curtain Wall Systems":["FW 50+","FW 60+"]
  }
};

const finishOptions = {
  "Powder Coated": ["Standard","Matte","Structura"],
  Anodized:       ["Standard","Brushed"]
};

const windowOperables = ["Tilt & Turn","Casement","Awning","Tilt Only"];
const doorOperables   = ["Hinged Left Open In","Hinged Right Open Out","Hinged Right Open In","Hinged Left Open Out"];

//
// ─── PRICING TABLES ─────────────────────────────────────────────────────────────
//
const unitCostPerSqft = {
  Alumil: {
    // — Windows —
    "S67":            { Fixed:22.7,  "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "S67 PHOS":       { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "S67 Urban":      { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "S77":            { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "S77 PHOS":       { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    "M9660":          { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "M9660 PHOS":     { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    // — Entrance Doors —
    SD67:  { Fixed:30, "Hinged Left Open In":45, "Hinged Right Open In":45, "Hinged Left Open Out":46, "Hinged Right Open Out":46 },
    SD77:  { Fixed:32, "Hinged Left Open In":48, "Hinged Right Open In":48, "Hinged Left Open Out":49, "Hinged Right Open Out":49 },
    SD115: { Fixed:35, "Hinged Left Open In":52, "Hinged Right Open In":52, "Hinged Left Open Out":53, "Hinged Right Open Out":53 },
    // — Sliding Doors —
    "SMARTIA M450": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
    "SMARTIA M630": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
  },
  Aluprof: {
    // Windows
    "MB-60":         { Fixed:23,  "Tilt & Turn":38, Casement:31, Awning:29, "Tilt Only":36 },
    "MB-70":         { Fixed:24,  "Tilt & Turn":39, Casement:32, Awning:30, "Tilt Only":37 },
    "MB-86":         { Fixed:25,  "Tilt & Turn":40, Casement:33, Awning:31, "Tilt Only":38 },
    "MB-104 Passive":{ Fixed:26,  "Tilt & Turn":41, Casement:34, Awning:32, "Tilt Only":39 },
    // Entrance Doors
    "MB-70 Doors":   { Fixed:31, "Hinged Left Open In":47, "Hinged Right Open In":47, "Hinged Left Open Out":48, "Hinged Right Open Out":48 },
    "MB-86 Doors":   { Fixed:33, "Hinged Left Open In":50, "Hinged Right Open In":50, "Hinged Left Open Out":51, "Hinged Right Open Out":51 },
    "MB-104 Doors":  { Fixed:35, "Hinged Left Open In":53, "Hinged Right Open In":53, "Hinged Left Open Out":54, "Hinged Right Open Out":54 },
    // Sliding Doors
    "MB-Slide": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
  },
  Cortizo: {
    // Windows
    "COR 60":             { Fixed:23.5, "Tilt & Turn":38.5, Casement:31.5, Awning:29.5, "Tilt Only":36.5 },
    "COR 70 Industrial":  { Fixed:24.5, "Tilt & Turn":39.5, Casement:32.5, Awning:30.5, "Tilt Only":37.5 },
    "COR 80 Hidden Sash": { Fixed:25.5, "Tilt & Turn":40.5, Casement:33.5, Awning:31.5, "Tilt Only":38.5 },
    // Entrance Doors
    "Millennium 2000":    { Fixed:32,   "Hinged Left Open In":48, "Hinged Right Open In":48, "Hinged Left Open Out":49, "Hinged Right Open Out":49 },
    "Millennium 70":      { Fixed:34,   "Hinged Left Open In":51, "Hinged Right Open In":51, "Hinged Left Open Out":52, "Hinged Right Open Out":52 },
    // Sliding Doors
    "COR Vision": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
  },
  Reynaers: {
    // Windows
    "SlimLine 38 Classic":{ Fixed:22.7,  "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "SlimLine 38 Cube":   { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "SlimLine 38 Ferro":  { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "SlimLine 68":        { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    // Entrance Doors
    "SlimLine 38":        { Fixed:31,   "Hinged Left Open In":47, "Hinged Right Open In":47, "Hinged Left Open Out":48, "Hinged Right Open Out":48 },
    "SlimLine 68":        { Fixed:33,   "Hinged Left Open In":50, "Hinged Right Open In":50, "Hinged Left Open Out":51, "Hinged Right Open Out":51 },
    "MasterLine 8":       { Fixed:31,   "Hinged Left Open In":47, "Hinged Right Open In":47, "Hinged Left Open Out":48, "Hinged Right Open Out":48 },
    "CS 77":              { Fixed:33,   "Hinged Left Open In":50, "Hinged Right Open In":50, "Hinged Left Open Out":51, "Hinged Right Open Out":51 },
    // Sliding Doors
    "Hi-Finity":          {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65},
  Schuco: {
    // Windows
    "AWS 65":     { Fixed:23, "Tilt & Turn":38, Casement:31, Awning:29, "Tilt Only":36 },
    "AWS 75.SI+": { Fixed:24, "Tilt & Turn":39, Casement:32, Awning:30, "Tilt Only":37 },
    "AWS 90.SI+": { Fixed:25, "Tilt & Turn":40, Casement:33, Awning:31, "Tilt Only":38 },
    // Entrance Doors
    "ADS 65":     { Fixed:30, "Hinged Left Open In":46, "Hinged Right Open In":46, "Hinged Left Open Out":47, "Hinged Right Open Out":47 },
    "ADS 75.SI+": { Fixed:32, "Hinged Left Open In":49, "Hinged Right Open In":49, "Hinged Left Open Out":50, "Hinged Right Open Out":50 },
    // Sliding Doors
    "ASS 70.HI": {"OX": 40.62, "XX": 43.33, "OXX": 41.45, "XXX": 43.44, "OXXO": 31.16, "OXXX": 32.83, "XXXX": 33.65}
  }}
}

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

module.exports = {
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  unitCostPerSqft
}