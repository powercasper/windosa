import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useSystemSelection,
  systemHierarchy,
  systemArchitecture,
  finishOptions
} from "./systemHierarchy";

function ralToHex(ral, ralColors) {
  const m = ralColors.find(c => c.ral === ral.toUpperCase());
  return m ? m.hex : "#CCCCCC";
}

export default function App() {
  const {
    systemType,
    setSystemType,
    brand,
    setBrand,
    system,
    setSystem,
    typology,
    setTypology,
    systemTypesList,
    validBrands
  } = useSystemSelection();

  // derive valid architectural systems
  const validSystems = systemArchitecture[brand]?.[systemType] || [];

  // form state
  const [form, setForm] = useState({
    widthIn: 36,
    heightIn: 72,
    quantity: 1
  });
  const [finish, setFinish] = useState("Powder Coated");
  const [finishStyle, setFinishStyle] = useState("Standard");
  const [globalColor, setGlobalColor] = useState("RAL 9010");
  const [marginPercent, setMarginPercent] = useState(0);
  const [updateIndex, setUpdateIndex] = useState(null);

  // data state
  const [ralColors, setRalColors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [itemColors, setItemColors] = useState({});

  // 1) pick default systemType
  useEffect(() => {
    if (systemTypesList.length) setSystemType(systemTypesList[0]);
  }, [systemTypesList, setSystemType]);

  // 2) when type changes, pick first brand
  useEffect(() => {
    if (validBrands.length) setBrand(validBrands[0]);
  }, [systemType, validBrands, setBrand]);

  // 3) when brand/type changes, pick first architectural system
  useEffect(() => {
    if (validSystems.length) setSystem(validSystems[0]);
    else setSystem("");
  }, [brand, systemType, validSystems, setSystem]);

  // 4) load RAL list
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/martinring/ral-colors/main/ral-colors.json"
    )
      .then(r => r.json())
      .then(setRalColors)
      .catch(console.error);
  }, []);

  // 5) whenever typology changes, rebuild panelType entries in form
  useEffect(() => {
    setForm(f => {
      const base = {
        widthIn: f.widthIn,
        heightIn: f.heightIn,
        quantity: f.quantity
      };
      typology.split("").forEach((ch, i) => {
        base[`panelType_${i}`] = ch === "O" ? "Fixed" : f[`panelType_${i}`] || "Tilt & Turn";
      });
      return base;
    });
  }, [typology]);

  const fetchSummary = async () => {
    const res = await axios.get("http://localhost:3033/summary", {
      params: { margin: marginPercent }
    });
    setSummary(res.data);
  };

  const handleSubmit = async () => {
    const panelTypes = Object.fromEntries(
      Object.entries(form).filter(([k]) => k.startsWith("panelType_"))
    );
    // the 'type' we send is ignored by server when panelTypes present,
    // but we still send something:
    const payload = {
      brand,
      system,
      typology,
      widthIn: parseFloat(form.widthIn),
      heightIn: parseFloat(form.heightIn),
      quantity: parseInt(form.quantity, 10),
      panelTypes
    };

    if (updateIndex !== null) {
      await axios.put(
        `http://localhost:3033/update-window/${updateIndex}`,
        payload
      );
      setUpdateIndex(null);
      
    } else {
      await axios.post("http://localhost:3033/add-window", payload);
    }

    // setTypology(systemType === "Windows" ? "O" : "");
    await fetchSummary();
    // reset form & typology
    setForm({ widthIn: 36, heightIn: 72, quantity: 1 });
    setTypology("");
    setFinish("Powder Coated");
    setFinishStyle("Standard");
    setGlobalColor("RAL 9010");
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async idx => {
    await axios.delete(`http://localhost:3033/delete-window/${idx}`);
    fetchSummary();
  };

  const handleEdit = idx => {
    const win = summary.itemized[idx];
    const [w, h] = win.Dimensions.split("x").map(Number);
    setForm({ widthIn: w, heightIn: h, quantity: win.Quantity });
    setTypology(win.Typology);
    setUpdateIndex(idx);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Window Pricing Tool</h1>

      {/* System / Finish / Dims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">System Type:</label>
          <select
            value={systemType}
            onChange={e => setSystemType(e.target.value)}
            className="border p-2 w-full"
          >
            {systemTypesList.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">System Brand:</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="border p-2 w-full"
          >
            {validBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Architectural System:</label>
          <select
            value={system}
            onChange={e => setSystem(e.target.value)}
            className="border p-2 w-full"
          >
            {validSystems.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Typology field */}
        <div>
          <label className="font-medium">
            Typology <span className="text-red-500">*</span> (X=operable, O=fixed, max 5):
          </label>
          <input
            value={typology}
            onChange={e =>
              setTypology(e.target.value.replace(/[^XO]/gi, "").slice(0, 5))
            }
            className="border p-2 w-full"
            placeholder="e.g. XOOX"
            required
          />
        </div>

        {/* Panel dropdowns */}
      {typology.split("").map((ch, i) => (
        <div key={i} className="flex items-center gap-2">
          <label className="font-medium">Panel {i + 1}:</label>
          {ch === "O" ? (
            <select
              name={`panelType_${i}`}
              value="Fixed"
              disabled
              className="border p-2 flex-1"
            >
              <option>Fixed</option>
            </select>
          ) : (
            <select
              name={`panelType_${i}`}
              value={form[`panelType_${i}`]}
              onChange={handleChange}
              className="border p-2 flex-1"
            >
              <option>Tilt & Turn</option>
              <option>Casement</option>
              <option>Awning</option>
              <option>Tilt Only</option>
            </select>
          )}
        </div>
      ))}

        <div>
          <label className="font-medium">Finish Category:</label>
          <select
            value={finish}
            onChange={e => setFinish(e.target.value)}
            className="border p-2 w-full"
          >
            {Object.keys(finishOptions).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Finish Style:</label>
          <select
            value={finishStyle}
            onChange={e => setFinishStyle(e.target.value)}
            className="border p-2 w-full"
          >
            {finishOptions[finish].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Global RAL Color:</label>
          <input
            type="text"
            value={globalColor}
            onChange={e => setGlobalColor(e.target.value)}
            className="border p-2 w-full"
            placeholder="RAL 9010"
          />
        </div>

        <div>
          <label className="font-medium">Width (in):</label>
          <input
            name="widthIn"
            value={form.widthIn}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="font-medium">Height (in):</label>
          <input
            name="heightIn"
            value={form.heightIn}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label className="font-medium">Quantity:</label>
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!typology}                // ← disable unless typology has at least one character
        className={`w-full p-2 rounded text-white 
          ${typology ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
      >
        {updateIndex !== null ? "Update Window" : "Add Window"}
      </button>

      {/* margin */}
      <div className="mt-4">
        <label className="block mb-1 font-medium">
          Margin % on Grand Total:
        </label>
        <input
          type="number"
          value={marginPercent}
          onChange={e => setMarginPercent(parseFloat(e.target.value) || 0)}
          className="border p-2 w-full mb-2"
          placeholder="Enter margin percent"
        />
        <button
          onClick={fetchSummary}
          className="bg-green-600 text-white p-2 w-full"
        >
          Apply Margin
        </button>
      </div>

      {/* Panel config summary */}
      <div>
        <h3 className="font-semibold text-lg mt-6">
          Panel Configuration:
        </h3>
        <ul className="list-disc pl-6">
          {Object.entries(form)
            .filter(([k]) => k.startsWith("panelType_"))
            .map(([k, v]) => (
              <li key={k}>
                {k.replace("panelType_", "Panel ")}: {v}
              </li>
            ))}
        </ul>
      </div>

      {/* Order summary */}
      <h2 className="text-lg font-semibold">Order Summary</h2>
      {summary && (
        <>
          <ul className="list-disc pl-6">
            {summary.itemized.map((item, idx) => {
              // build panel sequence string
              const seq = Object.entries(item.PanelTypes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([_, t]) => t)
                .join(", ");
              const perFt2 = (
                parseFloat(item.TotalWithMargin) /
                parseFloat(item.AreaFt2)
              ).toFixed(2);
              const hex = ralToHex(itemColors[idx] || globalColor, ralColors);

              return (
                <li
                  key={idx}
                  className="mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-[50px] h-[50px] rounded border mr-3"
                      style={{ backgroundColor: hex }}
                    />
                    <div>
                      {item.Quantity}× {seq}, Dimentsions(WxH): {item.Dimensions} → $
                      {item.TotalCost} + ${item.LaborCost} = $
                      {item.GrandTotal} → margin = ${item.TotalWithMargin} → $
                      {perFt2/item.Quantity}/ft²
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(idx)}
                      className="text-blue-600 underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="text-red-600 underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* totals */}
          <div className="mt-4 space-y-1">
            <p>
              <strong>Total Area:</strong> {summary.totalArea} ft²
            </p>
            <p>
              <strong>Material Cost:</strong> ${summary.totalCost}
            </p>
            <p>
              <strong>Labor Cost:</strong> ${summary.laborTotal}
            </p>
            <p>
              <strong>Grand Total (w/ margin):</strong> $
              {summary.grandTotal}
            </p>
            <p>
              <strong>Avg. Cost per ft²:</strong> $
              {summary.averageCostPerSqft}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
