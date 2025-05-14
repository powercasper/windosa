// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

class WindowOrder {
  constructor() {
    this.windows = [];
    this.unitCostPerSqft = {
      Alumil: {
        "S67": { Fixed: 22.7, "Tilt & Turn": 37.3, Casement: 30, Awning: 28, "Tilt Only": 35 },
        "S77": { Fixed: 24.54, "Tilt & Turn": 41, Casement: 32, Awning: 29, "Tilt Only": 38 },
        "S67 PHOS": { Fixed: 25, "Tilt & Turn": 42, Casement: 31, Awning: 30, "Tilt Only": 37 },
        "S77 PHOS": { Fixed: 27, "Tilt & Turn": 45, Casement: 33, Awning: 31, "Tilt Only": 39 }
      },
      Reynaers: {
        "SL38 Classic": { Fixed: 22.7, "Tilt & Turn": 37.3, Casement: 30, Awning: 28, "Tilt Only": 35 },
        "SL38 Cubic": { Fixed: 24.54, "Tilt & Turn": 41, Casement: 32, Awning: 29, "Tilt Only": 38 },
        "SL38 Ferro": { Fixed: 25, "Tilt & Turn": 42, Casement: 31, Awning: 30, "Tilt Only": 37 },
        "SL68": { Fixed: 27, "Tilt & Turn": 45, Casement: 33, Awning: 31, "Tilt Only": 39 }
      }
      // etc for other brands/systems…
    };
    this.laborRates = {
      Fixed: 3.5,
      "Tilt & Turn": 4.65,
      Casement: 4.0,
      Awning: 3.75,
      "Tilt Only": 4.3
    };
  }

  addWindow({ brand, system, typology, widthIn, heightIn, quantity, panelTypes }) {
    const areaFt2 = (widthIn * heightIn) / 144;

    let costPerSqft, laborRate;
    const panels = Object.values(panelTypes || {});
    if (panels.length) {
      // average across panels
      const cps = panels.map(t => this.unitCostPerSqft[brand]?.[system]?.[t] || 0);
      costPerSqft = cps.reduce((a, b) => a + b, 0) / cps.length;
      const lrs = panels.map(t => this.laborRates[t] || 0);
      laborRate = lrs.reduce((a, b) => a + b, 0) / lrs.length;
    } else {
      // fallback if no panels provided
      costPerSqft = this.unitCostPerSqft[brand]?.[system]?.Fixed || 0;
      laborRate = this.laborRates.Fixed;
    }

    const costPerWindow = costPerSqft * areaFt2;
    const laborCost = laborRate * areaFt2;
    const totalCost = (costPerWindow + laborCost) * quantity;

    this.windows.push({
      Brand: brand,
      System: system,
      Typology: typology,
      Dimensions: `${widthIn}x${heightIn}`,
      Quantity: quantity,
      AreaFt2: areaFt2.toFixed(2),
      CostPerWindow: costPerWindow.toFixed(2),
      LaborCost: laborCost.toFixed(2),
      TotalCost: (costPerWindow * quantity).toFixed(2),
      GrandTotal: totalCost.toFixed(2),
      PanelTypes: panelTypes || {}
    });
  }

  updateWindow(index, payload) {
    if (!this.windows[index]) throw new Error("Window not found");
    this.windows.splice(index, 1);
    this.addWindow(payload);
  }

  deleteWindow(index) {
    if (!this.windows[index]) throw new Error("Window not found");
    this.windows.splice(index, 1);
  }

  getItemizedBreakdown(margin = 0) {
    const factor = 1 + margin / 100;
    return this.windows.map((w, i) => {
      const grand = parseFloat(w.GrandTotal);
      return {
        ...w,
        TotalWithMargin: (grand * factor).toFixed(2),
        PanelTypes: w.PanelTypes || {}
      };
    });
  }

  getTotals(margin = 0) {
    const items = this.getItemizedBreakdown(margin);
    const totalCost = items.reduce((sum, w) => sum + parseFloat(w.TotalCost), 0);
    const totalWithMargin = items.reduce((sum, w) => sum + parseFloat(w.TotalWithMargin), 0);
    const totalArea = this.windows.reduce((sum, w) => sum + parseFloat(w.AreaFt2) * w.Quantity, 0);
    return {
      totalCost: totalCost.toFixed(2),
      laborTotal: items.reduce((s, w) => s + parseFloat(w.LaborCost), 0).toFixed(2),
      totalArea: totalArea.toFixed(2),
      averageCostPerSqft: (totalWithMargin / totalArea).toFixed(2),
      grandTotal: totalWithMargin.toFixed(2)
    };
  }
}

const order = new WindowOrder();

app.post("/add-window", (req, res) => {
  try {
    order.addWindow(req.body);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/update-window/:idx", (req, res) => {
  try {
    order.updateWindow(+req.params.idx, req.body);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/delete-window/:idx", (req, res) => {
  try {
    order.deleteWindow(+req.params.idx);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/summary", (req, res) => {
  const m = parseFloat(req.query.margin) || 0;
  const itemized = order.getItemizedBreakdown(m);
  const totals = order.getTotals(m);
  res.json({ itemized, ...totals });
});

app.listen(3033, () =>
  console.log("Window pricing API running on port 3033")
);
