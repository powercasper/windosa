// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

//
// ─── METADATA ──────────────────────────────────────────────────────────────────
//
const systemHierarchy = {
  Windows:             ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Entrance Doors":    ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Sliding Doors":     ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Folding Doors":     ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Curtain Wall Systems":["Alumil","Aluprof","Cortizo","Reynaers","Schuco"]
};

const systemArchitecture = {
  Alumil: {
    Windows:           ["S67","S67 PHOS","S67 Urban","S77","S77 PHOS","M9660","M9660 PHOS"],
    "Entrance Doors":  ["SD67","SD77","SD115"],
    "Sliding Doors":   ["SMARTIA S350","SMARTIA S560","SUPREME S700"],
    "Folding Doors":   ["SMARTIA M19800","SUPREME SF85"],
    "Curtain Wall Systems":["SMARTIA M6","SUPREME S86 PHOS"]
  },
  Aluprof: {
    Windows:           ["MB-60","MB-70","MB-86","MB-104 Passive"],
    "Entrance Doors":  ["MB-70 Doors","MB-86 Doors","MB-104 Doors"],
    "Sliding Doors":   ["MB-59 Slide","MB-Slide","MB-77HS"],
    "Folding Doors":   ["MB-86 Fold Line"],
    "Curtain Wall Systems":["MB-SR50N","MB-TT50","MB-SR60"]
  },
  Cortizo: {
    Windows:           ["COR 60","COR 70 Industrial","COR 80 Hidden Sash"],
    "Entrance Doors":  ["Millennium 2000","Millennium 70"],
    "Sliding Doors":   ["COR Vision","4200 Slide","Galene"],
    "Folding Doors":   ["BiFold Plus"],
    "Curtain Wall Systems":["TP52","ST52","CW CT70"]
  },
  Reynaers: {
    Windows:           ["SlimLine 38 Classic","SlimLine 38 Cube","SlimLine 38 Ferro","SlimLine 68"],
    "Entrance Doors":  ["MasterLine 8","CS 77"],
    "Sliding Doors":   ["CP 130","CP 155","Hi-Finity"],
    "Folding Doors":   ["CF 77","CF 68"],
    "Curtain Wall Systems":["CW 50","Element Façade"]
    
  },
  Schuco: {
    Windows:           ["AWS 65","AWS 75.SI+","AWS 90.SI+"],
    "Entrance Doors":  ["ADS 65","ADS 75.SI+"],
    "Sliding Doors":   ["ASS 50","ASS 70.HI","ASS 77 PD"],
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
    "S67":        { Fixed:22.7, "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "S77":        { Fixed:24.54, "Tilt & Turn":41, Casement:32, Awning:29, "Tilt Only":38 },
    "S67 PHOS":   { Fixed:25,   "Tilt & Turn":42, Casement:31, Awning:30, "Tilt Only":37 },
    "S77 PHOS":   { Fixed:27,   "Tilt & Turn":45, Casement:33, Awning:31, "Tilt Only":39 },
    // — Entrance Doors —
    SD67:  { Fixed:30, "Hinged Left Open In":45, "Hinged Right Open In":45, "Hinged Left Open Out":46, "Hinged Right Open Out":46 },
    SD77:  { Fixed:32, "Hinged Left Open In":48, "Hinged Right Open In":48, "Hinged Left Open Out":49, "Hinged Right Open Out":49 },
    SD115: { Fixed:35, "Hinged Left Open In":52, "Hinged Right Open In":52, "Hinged Left Open Out":53, "Hinged Right Open Out":53 },
    // … (you can add Sliding, Folding, Curtain Wall here) …
  },
  Aluprof: {
    // Windows (existing dummy values)
    "MB-60":         { Fixed:23,  "Tilt & Turn":38, Casement:31, Awning:29, "Tilt Only":36 },
    "MB-70":         { Fixed:24,  "Tilt & Turn":39, Casement:32, Awning:30, "Tilt Only":37 },
    "MB-86":         { Fixed:25,  "Tilt & Turn":40, Casement:33, Awning:31, "Tilt Only":38 },
    "MB-104 Passive":{ Fixed:26,  "Tilt & Turn":41, Casement:34, Awning:32, "Tilt Only":39 },
    // Entrance Doors (dummy)
    "MB-70 Doors":   { Fixed:31,  "Hinged Left Open In":47, "Hinged Right Open In":47, "Hinged Left Open Out":48, "Hinged Right Open Out":48 },
    "MB-86 Doors":   { Fixed:33,  "Hinged Left Open In":50, "Hinged Right Open In":50, "Hinged Left Open Out":51, "Hinged Right Open Out":51 },
    "MB-104 Doors":  { Fixed:35,  "Hinged Left Open In":53, "Hinged Right Open In":53, "Hinged Left Open Out":54, "Hinged Right Open Out":54 },
  },
  Cortizo: {
    // Windows
    "COR 60":               { Fixed:23.5, "Tilt & Turn":38.5, Casement:31.5, Awning:29.5, "Tilt Only":36.5 },
    "COR 70 Industrial":    { Fixed:24.5, "Tilt & Turn":39.5, Casement:32.5, Awning:30.5, "Tilt Only":37.5 },
    "COR 80 Hidden Sash":   { Fixed:25.5, "Tilt & Turn":40.5, Casement:33.5, Awning:31.5, "Tilt Only":38.5 },
    // Entrance Doors (dummy)
    "Millennium 2000":      { Fixed:32, "Hinged Left Open In":48, "Hinged Right Open In":48, "Hinged Left Open Out":49, "Hinged Right Open Out":49 },
    "Millennium 70":        { Fixed:34, "Hinged Left Open In":51, "Hinged Right Open In":51, "Hinged Left Open Out":52, "Hinged Right Open Out":52 },
  },
  Reynaers: {
    // Windows
    "SlimLine 38 Classic":  { Fixed:22.7,  "Tilt & Turn":37.3, Casement:30, Awning:28, "Tilt Only":35 },
    "SlimLine 38 Cube":     { Fixed:24.54, "Tilt & Turn":41,   Casement:32, Awning:29, "Tilt Only":38 },
    "SlimLine 38 Ferro":    { Fixed:25,    "Tilt & Turn":42,   Casement:31, Awning:30, "Tilt Only":37 },
    "SlimLine 68":          { Fixed:27,    "Tilt & Turn":45,   Casement:33, Awning:31, "Tilt Only":39 },
    // Entrance Doors
    "MasterLine 8":         { Fixed:31,   "Hinged Left Open In":47, "Hinged Right Open In":47, "Hinged Left Open Out":48, "Hinged Right Open Out":48 },
    "CS 77":                { Fixed:33,   "Hinged Left Open In":50, "Hinged Right Open In":50, "Hinged Left Open Out":51, "Hinged Right Open Out":51 },
  },
  Schuco: {
    // Windows
    "AWS 65":    { Fixed:23,  "Tilt & Turn":38, Casement:31, Awning:29, "Tilt Only":36 },
    "AWS 75.SI+":{ Fixed:24,  "Tilt & Turn":39, Casement:32, Awning:30, "Tilt Only":37 },
    "AWS 90.SI+":{ Fixed:25,  "Tilt & Turn":40, Casement:33, Awning:31, "Tilt Only":38 },
    // Entrance Doors (dummy)
    "ADS 65":    { Fixed:30,  "Hinged Left Open In":46, "Hinged Right Open In":46, "Hinged Left Open Out":47, "Hinged Right Open Out":47 },
    "ADS 75.SI+":{ Fixed:32,  "Hinged Left Open In":49, "Hinged Right Open In":49, "Hinged Left Open Out":50, "Hinged Right Open Out":50 },
  }
};

const laborRates = {
  Fixed:3.5,
  "Tilt & Turn":4.65,
  Casement:4.0,
  Awning:3.75,
  "Tilt Only":4.3,
  "Hinged Left Open In":20,
  "Hinged Right Open Out":20,
  "Hinged Right Open In":20,
  "Hinged Left Open Out":20
};

//
// ─── ORDER STORAGE & CALCULATION ────────────────────────────────────────────────
//
class Order {
  constructor() {
    this.items = [];
  }

  addOrUpdate(idx, payload) {
    if (idx != null && this.items[idx]) {
      this.items.splice(idx, 1);
    }
    this.items.push(payload);
  }

  delete(idx) {
    this.items.splice(idx, 1);
  }

  getItemized(margin = 0) {
    const factor = 1/(1 - margin/100);
    return this.items.map((it,i) => {
      const area = (it.widthIn * it.heightIn) / 144;
      const panels = Object.values(it.panelTypes||{});
      let cpSqft, lr;

      if (panels.length) {
        // average across chosen panels
        const costs = panels.map(p => unitCostPerSqft[it.brand]?.[it.system]?.[p] || 0);
        cpSqft = costs.reduce((a,b)=>a+b,0)/costs.length;
        const labs = panels.map(p => laborRates[p] || 0);
        lr = labs.reduce((a,b)=>a+b,0)/labs.length;
      } else {
        cpSqft = unitCostPerSqft[it.brand]?.[it.system]?.Fixed || 0;
        lr = laborRates.Fixed;
      }

      const costWin = cpSqft * area;
      const labor   = lr * area;
      const subtotal = (costWin + labor) * it.quantity;
      const withM = subtotal * factor;

      return {
        Index: i,
        Brand: it.brand,
        System: it.system,
        Typology: it.typology,
        Dimensions: `${it.widthIn}x${it.heightIn}`,
        Quantity: it.quantity,
        AreaFt2: area.toFixed(2),
        CostPerWindow: costWin.toFixed(2),
        LaborCost: (labor * it.quantity).toFixed(2),
        TotalCost: (costWin * it.quantity).toFixed(2),
        GrandTotal: subtotal.toFixed(2),
        TotalWithMargin: withM.toFixed(2),
        PanelTypes: it.panelTypes || {}
      };
    });
  }

  getTotals(margin = 0) {
    const items = this.getItemized(margin);
    const totalCost = items.reduce((sum,w)=>sum+parseFloat(w.TotalCost),0);
    const totalWithMargin = items.reduce((sum,w)=>sum+parseFloat(w.TotalWithMargin),0);
    const totalArea = items.reduce((sum,w)=>sum+parseFloat(w.AreaFt2)*w.Quantity,0);

    return {
      totalCost: totalCost.toFixed(2),
      laborTotal: items.reduce((s,w)=>s+parseFloat(w.LaborCost),0).toFixed(2),
      totalArea: totalArea.toFixed(2),
      averageCostPerSqft: (totalWithMargin/totalArea).toFixed(2),
      grandTotal: totalWithMargin.toFixed(2)
    };
  }
}

const order = new Order();

//
// ─── ROUTES ─────────────────────────────────────────────────────────────────────
//

// Metadata for client dropdowns, finishes, panel types, etc.
app.get("/meta", (req,res) => {
  res.json({
    systemTypes:    Object.keys(systemHierarchy),
    systemHierarchy,
    systemArchitecture,
    finishOptions,
    windowOperables,
    doorOperables
  });
});

// Create or update
app.post("/add-window", (req,res)=>{ order.addOrUpdate(null, req.body);       res.sendStatus(200); });
app.put("/update-window/:idx", (req,res)=>{ order.addOrUpdate(+req.params.idx, req.body); res.sendStatus(200); });

// Delete
app.delete("/delete-window/:idx", (req,res)=>{ order.delete(+req.params.idx);       res.sendStatus(200); });

// Summary with margin, itemized + totals
app.get("/summary", (req,res) => {
  const m = parseFloat(req.query.margin) || 0;
  const itemized = order.getItemized(m);
  const totals   = order.getTotals(m);
  res.json({ itemized, ...totals });
});

// Start
app.listen(3033, () => console.log("Window pricing API running on port 3033"));
