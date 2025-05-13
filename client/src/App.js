import React, { useState } from "react";
import axios from "axios";

import { useEffect } from "react";

function ralToHex(ral, ralColors) {
  const match = ralColors.find(c => c.ral === ral.toUpperCase());
  return match ? match.hex : "#CCCCCC";
}

export default function App() {
  const [form, setForm] = useState({ type: "Fixed", widthIn: 36, heightIn: 72, quantity: 1 });
  const [globalColor, setGlobalColor] = useState("RAL 9010");
  const [summary, setSummary] = useState(null);
  const [itemColors, setItemColors] = useState({});
  const [ralColors, setRalColors] = useState([]);
  const [updateIndex, setUpdateIndex] = useState(null);
  const [marginPercent, setMarginPercent] = useState(0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchRAL = async () => {
      try {
        const res = await fetch("https://raw.githubusercontent.com/martinring/ral-colors/main/ral-colors.json");
        const data = await res.json();
        setRalColors(data);
      } catch (err) {
        console.error("Failed to load RAL colors", err);
      }
    };
    fetchRAL();
  }, []);

  const fetchSummary = async () => {
    const res = await axios.get("http://localhost:3033/summary", { params: { margin: marginPercent } });
    setSummary(res.data);
  };

  const handleSubmit = async () => {
    if (updateIndex !== null) {
      await axios.put(`http://localhost:3033/update-window/${updateIndex}`, {
        type: form.type,
        widthIn: parseFloat(form.widthIn),
        heightIn: parseFloat(form.heightIn),
        quantity: parseInt(form.quantity)
      });
      setUpdateIndex(null);
    } else {
      await axios.post("http://localhost:3033/add-window", {
        type: form.type,
        widthIn: parseFloat(form.widthIn),
        heightIn: parseFloat(form.heightIn),
        quantity: parseInt(form.quantity)
      });
    }
    fetchSummary();
  };

  const handleDelete = async (index) => {
    await axios.delete(`http://localhost:3033/delete-window/${index}`);
    fetchSummary();
  };

  const handleEdit = (index) => {
    const win = summary.itemized[index];
    const [w, h] = win.Dimensions.split("x").map(Number);
    setForm({ type: win.Type, widthIn: w, heightIn: h, quantity: win.Quantity });
    setUpdateIndex(index);
  };

  return (<>
      <h1 className="text-xl font-bold mb-4">Window Pricing Tool</h1>
      <div>
        <label className="font-medium">System Brand:</label>
        <select name="brand" onChange={handleChange} className="border p-2">
          <option value="Alumil">Alumil</option>
          <option value="Reynaers">Reynaers</option>
        </select>

        <label className="font-medium">System:</label>
        <select name="system" onChange={handleChange} className="border p-2">
          <option value="S67">S67</option>
          <option value="S77">S77</option>
          <option value="S67 PHOS">S67 PHOS</option>
          <option value="S77 PHOS">S77 PHOS</option>
        </select>

        <label className="font-medium">Window Typology:</label>
        <select name="type" value={form.type} onChange={handleChange} className="border p-2">
          <option value="Fixed">Fixed</option>
          <option value="Tilt & Turn">Tilt & Turn</option>
          <option value="Casement">Casement</option>
          <option value="Top Hung Awning">Top Hung Awning</option>
          <option value="Bottom Hung Tilt">Bottom Hung Tilt</option>
        </select>
        <input name="widthIn" value={form.widthIn} onChange={handleChange} className="border p-2" placeholder="Width (in)" />
        <input name="heightIn" value={form.heightIn} onChange={handleChange} className="border p-2" placeholder="Height (in)" />
        <input name="quantity" value={form.quantity} onChange={handleChange} className="border p-2" placeholder="Quantity" />
        <button onClick={handleSubmit} className="bg-blue-600 text-white p-2">
          {updateIndex !== null ? "Update Window" : "Add Window"}
        </button>
      </div>
        <div className="mt-4">
        <label className="block mb-1 font-medium">Margin % on Grand Total:</label>
        <input
          type="number"
          value={marginPercent}
          onChange={(e) => setMarginPercent(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Enter margin percent"
        />
        <button onClick={fetchSummary} className="bg-green-600 text-white p-2 w-full">Apply Margin</button>
      </div>

      {summary && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          <ul className="list-disc pl-6">
            {summary.itemized.map((item, i) => {
              const sellingPricePerSqft = (parseFloat(item.TotalWithMargin) / parseFloat(item.AreaFt2)).toFixed(2);
              const itemColor = itemColors[i] || globalColor;
              const colorHex = ralToHex(itemColor, ralColors);
              return (
                <li key={i} className="mb-1 flex items-center">
                  <div
                    className="w-[50px] h-[50px] min-w-[50px] min-h-[50px] md:w-20 md:h-20 rounded shadow border mr-3 flex-shrink-0"
                    style={{ backgroundColor: colorHex }}
                  ></div>
                  <input
                    type="text"
                    value={itemColors[i] || globalColor}
                    onChange={(e) => setItemColors({ ...itemColors, [i]: e.target.value })}
                    className="ml-2 border p-1 w-28"
                    placeholder="RAL code"
                  />
                  {item.Quantity} x {item.Type} {item.Dimensions} → ${item.TotalCost} + ${item.LaborCost} labor = ${item.GrandTotal} → with margin = ${item.TotalWithMargin} → per ft² = ${sellingPricePerSqft}
                  <button onClick={() => handleEdit(i)} className="ml-2 text-blue-600 underline">Edit</button>
                  <button onClick={() => handleDelete(i)} className="ml-2 text-red-600 underline">Delete</button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2">Total Area: {summary.totalArea} ft²</p>
          <p>Material Total Cost: ${summary.totalCost}</p>
          <p>Labor Cost: ${summary.laborTotal}</p>
          <p>Grand Total: ${summary.grandTotal}</p>
          
          <p>Selling Price Total with Margin: ${(summary.grandTotal / (1 - marginPercent / 100)).toFixed(2)}</p>
          <p>Avg. Cost per ft²: ${summary.averageCostPerSqft}</p>
          <p>Selling Price Total with Margin: ${(summary.grandTotal / (1 - marginPercent / 100)).toFixed(2)}</p>
          <p>Selling Price per ft² with Margin: ${((summary.grandTotal / summary.totalArea) / (1 - marginPercent / 100)).toFixed(2)}</p>
        </div>
      )}
    </>)
}
