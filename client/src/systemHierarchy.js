// systemHierarchy.js
import React from "react";

const systemHierarchy = {
  Windows: ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Entrance Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
  "Sliding Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"]
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

const systemArchitecture = {
    Alumil: {
        Windows: ["S67", "S67 PHOS", "S67 Urban", "S77", "S77 PHOS", "M9660", "M9660 PHOS"],
        "Entrance Doors": ["SD67", "SD77", "SD115"],
    "Sliding Doors": ["SMARTIA M450", "SMARTIA M630", "SMARTIA S650"]
      },
      Aluprof: {
    Windows: ["MB-70", "MB-79", "MB-86"],
    "Entrance Doors": ["MB-70", "MB-79", "MB-86"],
    "Sliding Doors": ["MB-77HS", "MB-59HS"]
      },
      Cortizo: {
    Windows: ["COR-70", "COR-80"],
    "Entrance Doors": ["COR-70", "COR-80"],
    "Sliding Doors": ["4600", "4700"]
      },
      Reynaers: {
        Windows: ["SlimLine 38 Classic", "SlimLine 38 Cube", "SlimLine 38 Ferro", "SlimLine 68"],
    "Entrance Doors": ["SlimLine 38", "SlimLine 68", "MasterLine 8", "CS 77"],
    "Sliding Doors": ["Hi-Finity"]
      },
      Schuco: {
    Windows: ["AWS 75", "AWS 90"],
    "Entrance Doors": ["ADS 75", "ADS 90"],
    "Sliding Doors": ["ASS 70.HI", "ASS 77 PD.HI"]
      }
};