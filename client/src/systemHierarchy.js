// systemHierarchy.js
import React from "react";

export const systemHierarchy = {
    "Windows": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Entrance Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Sliding Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Folding Doors": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"],
    "Curtain Wall Systems": ["Alumil", "Aluprof", "Cortizo", "Reynaers", "Schuco"]
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

  export const systemArchitecture = {
    Alumil: {
        Windows: ["S67", "S67 PHOS", "S67 Urban", "S77", "S77 PHOS", "M9660", "M9660 PHOS"],
        "Entrance Doors": ["SD67", "SD77", "SD115"],
        "Sliding Doors": ["SMARTIA S350", "SMARTIA S560", "SUPREME S700"],
        "Folding Doors": ["SMARTIA M19800", "SUPREME SF85"],
        "Curtain Wall Systems": ["SMARTIA M6", "SUPREME S86 PHOS"]
      },
      Aluprof: {
        Windows: ["MB-60", "MB-70", "MB-86", "MB-104 Passive"],
        "Entrance Doors": ["MB-70 Doors", "MB-86 Doors", "MB-104 Doors"],
        "Sliding Doors": ["MB-59 Slide", "MB-Slide", "MB-77HS"],
        "Folding Doors": ["MB-86 Fold Line"],
        "Curtain Wall Systems": ["MB-SR50N", "MB-TT50", "MB-SR60"]
      },
      Cortizo: {
        Windows: ["COR 60", "COR 70 Industrial", "COR 80 Hidden Sash"],
        "Entrance Doors": ["Millennium 2000", "Millennium 70"],
        "Sliding Doors": ["COR Vision", "4200 Slide", "Galene"],
        "Folding Doors": ["BiFold Plus"],
        "Curtain Wall Systems": ["TP52", "ST52", "CW CT70"]
      },
      Reynaers: {
        Windows: ["SlimLine 38 Classic", "SlimLine 38 Cube", "SlimLine 38 Ferro", "SlimLine 68"],
        "Entrance Doors": ["MasterLine 8", "CS 77"],
        "Sliding Doors": ["CP 130", "CP 155", "Hi-Finity"],
        "Folding Doors": ["CF 77", "CF 68"],
        "Curtain Wall Systems": ["CW 50", "Element Façade"]
      },
      Schuco: {
        Windows: ["AWS 65", "AWS 75.SI+", "AWS 90.SI+"],
        "Entrance Doors": ["ADS 65", "ADS 75.SI+"],
        "Sliding Doors": ["ASS 50", "ASS 70.HI", "ASS 77 PD"],
        "Folding Doors": ["ASS 70 FD", "ASS 80 FD.HI"],
        "Curtain Wall Systems": ["FW 50+", "FW 60+"]
      }
  }