// client/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function ralToHex(ral, ralColors) {
  const m = ralColors.find(c => c.ral === ral.toUpperCase());
  return m ? m.hex : "#CCCCCC";
}

export default function App() {
  // ——————————————————————————————————————————
  // 1) All of our hooks (useState/useEffect) must be called in the same order,
  //    every render, before any early‐return
  // ——————————————————————————————————————————
  const [meta, setMeta] = useState(null);
  const [systemType, setSystemType] = useState("");
  const [brand, setBrand] = useState("");
  const [system, setSystem] = useState("");
  const [typology, setTypology] = useState("");
  const [form, setForm] = useState({ widthIn: 36, heightIn: 72, quantity: 1 });
  const [finish, setFinish] = useState("");
  const [finishStyle, setFinishStyle] = useState("");
  const [globalColor, setGlobalColor] = useState("RAL 9010");
  const [marginPercent, setMarginPercent] = useState(0);
  const [updateIndex, setUpdateIndex] = useState(null);
  const [ralColors, setRalColors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [itemColors, setItemColors] = useState({});

  useEffect(() => {
    // load all of our “meta” in one shot
    axios.get("http://localhost:3033/meta").then(res => {
      setMeta(res.data);
      // pick defaults
      setSystemType(res.data.systemTypes[0]);
      setFinish(Object.keys(res.data.finishOptions)[0]);
    });
    // load RAL color list
    fetch("https://raw.githubusercontent.com/martinring/ral-colors/main/ral-colors.json")
      .then(r => r.json())
      .then(setRalColors)
      .catch(console.error);
  }, []);

  // **these all run on every render**—no early returns!
  // once meta is available, we can derive defaults
  const validBrands = meta?.systemHierarchy[systemType] || [];
  const validSystems = meta?.systemArchitecture[brand]?.[systemType] || [];
  const finishStyles    = meta?.finishOptions[finish] || [];
  const operables       = systemType === "Windows"
    ? meta?.windowOperables
    : meta?.doorOperables;

  // pick first brand when systemType changes
  useEffect(() => {
    if (validBrands.length) setBrand(validBrands[0]);
  }, [systemType, validBrands]);

  // pick first system when brand or type changes
  useEffect(() => {
    if (validSystems.length) setSystem(validSystems[0]);
    else setSystem("");
  }, [brand, systemType, validSystems]);

  // pick first style when finish changes
  useEffect(() => {
    if (finishStyles.length) setFinishStyle(finishStyles[0]);
    else setFinishStyle("");
  }, [finish, finishStyles]);

  // rebuild panelType_N whenever typology changes
  useEffect(() => {
    setForm(f => {
      const base = { widthIn: f.widthIn, heightIn: f.heightIn, quantity: f.quantity };
      typology.split("").forEach((ch,i) => {
        base[`panelType_${i}`] =
          ch === "O"
            ? "Fixed"
            : f[`panelType_${i}`] || operables[0];
      });
      return base;
    });
  }, [typology, systemType, brand, operables]);

  // ——————————————————————————————————————————
  // 2) now we can early‐return while data is loading
  // ——————————————————————————————————————————
  if (!meta) {
    return <div className="p-6 text-center">Loading…</div>;
  }

  // fetch summary helper
  const fetchSummary = async () => {
    const res = await axios.get("http://localhost:3033/summary", {
      params: { margin: marginPercent }
    });
    setSummary(res.data);
  };

  // submit (add or update)
  const handleSubmit = async e => {
    e.preventDefault();
    const panelTypes = Object.fromEntries(
      Object.entries(form).filter(([k]) => k.startsWith("panelType_"))
    );
    const payload = {
      brand,
      system,
      typology,
      widthIn:  parseFloat(form.widthIn),
      heightIn: parseFloat(form.heightIn),
      quantity: parseInt(form.quantity, 10),
      panelTypes
    };
    if (updateIndex != null) {
      await axios.put(`http://localhost:3033/update-window/${updateIndex}`, payload);
      setUpdateIndex(null);
    } else {
      await axios.post("http://localhost:3033/add-window", payload);
    }
    // reset
    setTypology("");
    setForm({ widthIn: 36, heightIn: 72, quantity: 1 });
    setFinish(Object.keys(meta.finishOptions)[0]);
    setGlobalColor("RAL 9010");
    await fetchSummary();
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleEdit = idx => {
    const it = summary.itemized[idx];
    const [w,h] = it.Dimensions.split("x").map(Number);
    setForm({ widthIn: w, heightIn: h, quantity: it.Quantity });
    setTypology(it.Typology);
    setUpdateIndex(idx);
  };
  const handleDelete = async idx => {
    await axios.delete(`http://localhost:3033/delete-window/${idx}`);
    fetchSummary();
  };

  // ——————————————————————————————————————————
  // 3) finally, our real render
  // ——————————————————————————————————————————
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Pricing Tool</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* System Type */}
        <div>
          <label className="font-medium">System Type:</label>
          <select
            className="border p-2 w-full"
            value={systemType}
            onChange={e => setSystemType(e.target.value)}
          >
            {meta.systemTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {/* Brand */}
        <div>
          <label className="font-medium">System Brand:</label>
          <select
            className="border p-2 w-full"
            value={brand}
            onChange={e => setBrand(e.target.value)}
          >
            {validBrands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {/* Architectural System */}
        <div>
          <label className="font-medium">Architectural System:</label>
          <select
            className="border p-2 w-full"
            value={system}
            onChange={e => setSystem(e.target.value)}
          >
            {validSystems.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Typology */}
        <div>
          <label className="font-medium">
            Typology <span className="text-red-500">*</span> (X=operable, O=fixed, max 5)
          </label>
          <input
            className="border p-2 w-full"
            value={typology}
            onChange={e => setTypology(e.target.value.replace(/[^XO]/gi,"").slice(0,5))}
            placeholder="e.g. XOOX"
            required
          />
        </div>
        {/* Panel dropdowns */}
        {typology.split("").map((ch,i) => (
          <div key={i}>
            <label className="font-medium">Panel {i+1}:</label>
            {ch === "O" ? (
              <select className="border p-2 w-full" disabled>
                <option>Fixed</option>
              </select>
            ) : (
              <select
                name={`panelType_${i}`}
                value={form[`panelType_${i}`]}
                onChange={handleChange}
                className="border p-2 w-full"
              >
                {operables.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
        {/* Finish Category */}
        <div>
          <label className="font-medium">Finish Category:</label>
          <select
            className="border p-2 w-full"
            value={finish}
            onChange={e => setFinish(e.target.value)}
          >
            {Object.keys(meta.finishOptions).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {/* Finish Style */}
        <div>
          <label className="font-medium">Finish Style:</label>
          <select
            className="border p-2 w-full"
            value={finishStyle}
            onChange={e => setFinishStyle(e.target.value)}
          >
            {finishStyles.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {/* RAL */}
        <div>
          <label className="font-medium">Global RAL Color:</label>
          <input
            className="border p-2 w-full"
            value={globalColor}
            onChange={e => setGlobalColor(e.target.value)}
            placeholder="RAL 9010"
          />
        </div>
        {/* Width */}
        <div>
          <label className="font-medium">Width (in):</label>
          <input
            className="border p-2 w-full"
            name="widthIn"
            value={form.widthIn}
            onChange={handleChange}
          />
        </div>
        {/* Height */}
        <div>
          <label className="font-medium">Height (in):</label>
          <input
            className="border p-2 w-full"
            name="heightIn"
            value={form.heightIn}
            onChange={handleChange}
          />
        </div>
        {/* Qty */}
        <div>
          <label className="font-medium">Quantity:</label>
          <input
            className="border p-2 w-full"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
          />
        </div>
        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={!typology}
            className={`w-full p-2 rounded text-white ${
              typology ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {updateIndex != null ? "Update" : "Add"} {systemType}
          </button>
        </div>
      </form>

      {/* Margin */}
      <div className="mt-4">
        <label className="block mb-1 font-medium">Margin % on Grand Total:</label>
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={marginPercent}
          onChange={e => setMarginPercent(parseFloat(e.target.value)||0)}
          placeholder="Enter margin percent"
        />
        <button onClick={fetchSummary} className="bg-green-600 text-white p-2 w-full">
          Apply Margin
        </button>
      </div>

      {/* Panel Config Preview */}
      <div>
        <h3 className="font-semibold text-lg mt-6">Panel Configuration:</h3>
        <ul className="list-disc pl-6">
          {Object.entries(form)
            .filter(([k]) => k.startsWith("panelType_"))
            .map(([k,v]) => (
              <li key={k}>{k.replace("panelType_","Panel ")}: {v}</li>
            ))}
        </ul>
      </div>

      {/* Summary */}
      <h2 className="text-lg font-semibold">Order Summary</h2>
      {summary && (
        <>
          <ul className="list-disc pl-6 space-y-2">
            {summary.itemized.map((item, idx) => {
              const seq = Object.entries(item.PanelTypes || {})
                .sort(([a],[b]) => a.localeCompare(b))
                .map(([,t]) => t)
                .join(", ");

              const rawPerFt2 = parseFloat(item.TotalWithMargin) / parseFloat(item.AreaFt2);
              const perFt2PerPanel = Math.ceil((rawPerFt2 / item.Quantity) * 100) / 100;

              const colorHex = ralToHex(itemColors[idx]||globalColor, ralColors);

              return (
                <li key={idx} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-[40px] h-[40px] rounded border mr-3"
                      style={{ backgroundColor: colorHex }}
                    />
                    <div>
                      {item.Quantity}× {seq}, Dimensions: {item.Dimensions} → $
                      {item.TotalCost} + ${item.LaborCost} = ${item.GrandTotal} →
                      margin = ${item.TotalWithMargin} → ${perFt2PerPanel.toFixed(2)}/ft²
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleEdit(idx)} className="text-blue-600 underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(idx)} className="text-red-600 underline">
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Totals */}
          <div className="mt-4 space-y-1">
            <p><strong>Total Area:</strong> {summary.totalArea} ft²</p>
            <p><strong>Material Cost:</strong> ${summary.totalCost}</p>
            <p><strong>Labor Cost:</strong> ${summary.laborTotal}</p>
            <p><strong>Grand Total (w/ margin):</strong> ${summary.grandTotal}</p>
            <p><strong>Avg. Cost per ft²:</strong> ${summary.averageCostPerSqft}</p>
          </div>
        </>
      )}
    </div>
  );
}
