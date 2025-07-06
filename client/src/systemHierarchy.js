// systemHierarchy.js
import React from "react";

const systemHierarchy = {
  Windows: ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Entrance Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Sliding Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Window Wall": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"]
  };
  
  export const finishOptions = {
    "Powder Coated": ["Standard", "Matte", "Structura"],
    Anodized: ["Standard", "Brushed"]
  };
  
  export function useSystemSelection() {
    const [systemType, setSystemType] = React.useState("Windows");
    const [brand, setBrand] = React.useState("Alumil");
    const [system, setSystem] = React.useState("");
    const [typology, setTypology] = React.useState("");
    
  
    const systemTypesList = Object.keys(systemHierarchy);
    const validBrands = systemHierarchy[systemType];

    // whenever you switch *back* to Windows, reset typology to "O"
    React.useEffect(() => {
      if (systemType === "Windows") {
        setTypology("");
      } else {
        setTypology("");
      }
    }, [systemType]);
  
    return {
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
    };
  }