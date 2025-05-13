const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

class WindowOrder {
  constructor() {
    this.windows = [];
    this.unitCostPerSqft = {
      "Alumil": {
        "S67": { "Fixed": 22.70, "Tilt & Turn": 37.30 },
        "S77": { "Fixed": 24.54, "Tilt & Turn": 41.00 },
        "S67 PHOS": { "Fixed": 25.00, "Tilt & Turn": 42.00 },
        "S77 PHOS": { "Fixed": 27.00, "Tilt & Turn": 45.00 }
      },
      "Reynaers": {
        "S67": { "Fixed": 26.00, "Tilt & Turn": 39.50 },
        "S77": { "Fixed": 28.00, "Tilt & Turn": 43.75 }
      }
    };
    this.laborRates = { "Fixed": 3.5, "Tilt & Turn": 4.65, "Casement": 4.0, "Top Hung Awning": 3.75, "Bottom Hung Tilt": 4.2 };
  }

  addWindow({ brand, system, type, widthIn, heightIn, quantity }) {
    const areaFt2 = (widthIn * heightIn) / 144;
    const costPerSqft = this.unitCostPerSqft[brand]?.[system]?.[type] || 25;
    const laborRate = this.laborRates[type] || 3.5;

    const costPerWindow = costPerSqft * areaFt2;
    const laborCost = laborRate * areaFt2;
    const totalCost = (costPerWindow + laborCost) * quantity;

    this.windows.push({ brand, system, type, widthIn, heightIn, quantity, areaFt2, costPerWindow, laborCost, totalCost });
  }

  updateWindow(index, update) {
    if (!this.windows[index]) throw new Error("Window not found");
    this.windows.splice(index, 1);
    this.addWindow(update);
  }

  deleteWindow(index) {
    if (!this.windows[index]) throw new Error("Window not found");
    this.windows.splice(index, 1);
  }

  getItemizedBreakdown(margin = 0) {
    const marginFactor = 1 + margin / 100;
    return this.windows.map((win, i) => {
      const total = (win.costPerWindow + win.laborCost) * win.quantity;
      const totalWithMargin = total * marginFactor;
      return {
        Index: i,
        Brand: win.brand,
        System: win.system,
        Type: win.type,
        Dimensions: `${win.widthIn}x${win.heightIn}`,
        Quantity: win.quantity,
        AreaFt2: win.areaFt2.toFixed(2),
        CostPerWindow: win.costPerWindow.toFixed(2),
        LaborCost: (win.laborCost * win.quantity).toFixed(2),
        TotalCost: (win.costPerWindow * win.quantity).toFixed(2),
        GrandTotal: total.toFixed(2),
        TotalWithMargin: totalWithMargin.toFixed(2)
      };
    });
  }

  getTotalCost() {
    return this.windows.reduce((sum, w) => sum + w.costPerWindow * w.quantity, 0).toFixed(2);
  }
  getTotalLaborCost() {
    return this.windows.reduce((sum, w) => sum + w.laborCost * w.quantity, 0).toFixed(2);
  }
  getTotalArea() {
    return this.windows.reduce((sum, w) => sum + w.areaFt2 * w.quantity, 0).toFixed(2);
  }
  getAverageCostPerSqft() {
    const total = parseFloat(this.getTotalCost()) + parseFloat(this.getTotalLaborCost());
    return (total / parseFloat(this.getTotalArea())).toFixed(2);
  }
  getGrandTotal() {
    return (parseFloat(this.getTotalCost()) + parseFloat(this.getTotalLaborCost())).toFixed(2);
  }
}

const order = new WindowOrder();

app.post("/add-window", (req, res) => {
  try {
    order.addWindow(req.body);
    res.status(200).json({ message: "Window added successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/update-window/:index", (req, res) => {
  try {
    order.updateWindow(parseInt(req.params.index), req.body);
    res.status(200).json({ message: "Window updated successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/delete-window/:index", (req, res) => {
  try {
    order.deleteWindow(parseInt(req.params.index));
    res.status(200).json({ message: "Window deleted successfully." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/summary", (req, res) => {
  const margin = parseFloat(req.query.margin || 0);
  res.json({
    itemized: order.getItemizedBreakdown(margin),
    totalCost: order.getTotalCost(),
    laborTotal: order.getTotalLaborCost(),
    totalArea: order.getTotalArea(),
    averageCostPerSqft: order.getAverageCostPerSqft(),
    grandTotal: order.getGrandTotal()
  });
});

app.listen(3033, () => console.log("Window pricing API running on port 3033"));