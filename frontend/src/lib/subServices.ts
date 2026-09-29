export const SUB_SERVICES: Record<string, string[]> = {
  "AC Repair & Service": ["AC Service", "AC Installation", "AC Gas Charging", "AC Copper Pipe Fitting", "AC Repair", "AC Uninstallation"],
  "AC Pipe Line": ["Copper Pipe Fitting", "Drain Pipe Fitting", "Pipe Insulation / Sleeves", "Wiring with Pipe Line", "Pipe Line Repair / Leakage"],
  "Washing Machine Repair": ["Washing Machine Service", "Not Spinning / Not Draining", "Water Leakage", "Motor / PCB Repair", "Drum / Bearing Noise", "Installation / Uninstallation"],
  "Microwave Repair": ["Microwave Not Heating", "Magnetron Replacement", "Door / Switch Repair", "Turntable / Plate Issue", "PCB / Display Repair", "General Service"],
  "Geyser Repair & Service": ["Geyser Installation", "Geyser Repair", "Heating Element Replacement", "Thermostat Repair", "Water Leakage", "Geyser Service / Descaling"],
  "Water Purifier Repair & Service": ["RO Service", "Filter / Membrane Change", "RO Installation", "Low Water Flow", "Water Leakage", "UV / Pump Repair", "AMC"],
  "Water Dispenser Repair & Services": ["Dispenser Service", "Not Cooling / Not Heating", "Water Leakage", "Compressor / Gas Charging", "Tap / Valve Repair", "Installation"],
  "Water Cooler Repair & Services": ["Water Cooler Service", "Gas Charging", "Compressor Repair", "Not Cooling", "Water Leakage", "Installation / Shifting"],
  Electrician: ["Wiring / Rewiring", "Switch & Socket Fitting", "Fan Installation / Repair", "Light / Fitting Installation", "MCB / DB Board Work", "Inverter Connection", "Electrical Fault Repair"],
};

export const subServicesFor = (service?: string) => (service ? SUB_SERVICES[service] || [] : []);
