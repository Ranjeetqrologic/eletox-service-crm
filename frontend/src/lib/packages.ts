// Service packages & rates shown on service detail pages (source: Eletox rate card)
export type ServicePackage = { name: string; price: string; gst?: string; desc?: string; img?: string };
export const SERVICE_TITLES: Record<string, string> = {
  "ac-repair-service": "AC Repair & Service",
  "ac-pipe-line": "AC Pipe Line",
  "washing-machine-repair": "Washing Machine Repair",
  "microwave-repair": "Microwave Repair",
  "geyser-repair-service": "Geyser Repair & Service",
  "water-purifier-repair": "Water Purifier Repair & Service",
  "water-dispenser-repair": "Water Dispenser Repair & Services",
  "water-cooler-repair": "Water Cooler Repair & Services",
  "electrician": "Electrician"
};
export const PACKAGES: Record<string, ServicePackage[]> = {
  "ac-repair-service": [
    {"name": "Split Jet spray Service", "price": "499", "gst": "18% GST", "desc": "POWERSAVER Save more on your electricity bill With advanced Foam-Jet technology for Superior cleaning & better saving", "img": "/eletox-assets/packages/split-jet-spray-service.png"},
    {"name": "Window AC Jet spray Service", "price": "499", "gst": "18% GST", "img": "/eletox-assets/packages/window-ac-jet-spray-service.jpg"},
    {"name": "Lite AC Service", "price": "449", "gst": "18% GST", "img": "/eletox-assets/packages/lite-ac-service.jpg"},
    {"name": "Split AC Installation", "price": "999", "gst": "18% GST", "img": "/eletox-assets/packages/split-ac-installation.jpg"},
    {"name": "Window AC Installation", "price": "699", "gst": "18% GST", "img": "/eletox-assets/packages/window-ac-installation.png"},
    {"name": "AC Uninstallation", "price": "499", "gst": "18% GST", "img": "/eletox-assets/packages/ac-uninstallation.jpg"},
    {"name": "AC Gas Charging", "price": "2799", "gst": "18% GST", "img": "/eletox-assets/packages/ac-gas-charging.jpg"},
    {"name": "AC Copper pipe wall underground fitting with sleeves, wire, drain pipe", "price": "300 Per Fit", "gst": "18% GST", "img": "/eletox-assets/packages/ac-copper-pipe-wall-underground-fitting-with-sleeves-wire-drain-pipe.jpg"},
    {"name": "AMC Warranty Unit Condition", "price": "On Visit", "gst": "18% GST", "img": "/eletox-assets/packages/amc-warranty-unit-condition.jpg"},
  ],
  "ac-pipe-line": [
    {"name": "AC Copper pipe wall underground fitting with sleeves, wire, drain pipe", "price": "300 Per Fit", "gst": "18% GST", "img": "/eletox-assets/packages/ac-copper-pipe-wall-underground-fitting-with-sleeves-wire-drain-pipe.jpg"},
    {"name": "Drain Pipe / Sleeves / Wiring Fitting", "price": "On Visit", "gst": "18% GST", "img": "/eletox-assets/packages/ac-copper-pipe-wall-underground-fitting-with-sleeves-wire-drain-pipe.jpg"},
  ],
  "washing-machine-repair": [
    {"name": "Fully Automatic (Top Load) Service Charge", "price": "349", "gst": "18% GST", "img": "/eletox-assets/packages/fully-automatic-echeel-topload-service-charge.jpg"},
    {"name": "Semi-automatic washing machine check-up", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/semi-automatic-washing-machine-check-up.png"},
    {"name": "Fully Automatic (Front Load) Service Charge", "price": "349", "gst": "18% GST", "img": "/eletox-assets/packages/fully-automatic-echeel-front-load-service-charge.jpg"},
    {"name": "Washing Machine Installation / Uninstallation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/washing-machine-installation-uninstallation.jpg"},
  ],
  "microwave-repair": [
    {"name": "Microwave Service Charge", "price": "349", "gst": "18% GST", "img": "/eletox-assets/packages/miprowave-service-charge.png"},
    {"name": "Microwave Repair (Not Heating / PCB / Door)", "price": "On Visit", "gst": "18% GST", "desc": "Spare part cost extra after inspection.", "img": "/eletox-assets/packages/miprowave-service-charge.png"},
  ],
  "geyser-repair-service": [
    {"name": "Geyser Installation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/geyser-installation.png"},
    {"name": "Geyser Uninstallation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/geyser-uninstallation.png"},
    {"name": "Geyser Service Charge", "price": "499", "gst": "18% GST", "img": "/eletox-assets/packages/services-charge.jpg"},
  ],
  "water-purifier-repair": [
    {"name": "Water Purifier Service charge", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/water-purifier-service-charge.jpg"},
    {"name": "Water Purifier installation", "price": "399", "gst": "18% GST", "img": "/eletox-assets/packages/wateng-purifier-installation.jpg"},
    {"name": "Water Purifier uninstallation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/wateng-purifier-uninstallation.jpg"},
  ],
  "water-dispenser-repair": [
    {"name": "Water Dispenser Service Charge", "price": "399", "gst": "18% GST", "img": "/eletox-assets/packages/water-dispenser-service-charge.png"},
    {"name": "Other", "price": "On Visit", "gst": "18% GST", "img": "/eletox-assets/packages/other.jpg"},
  ],
  "water-cooler-repair": [
    {"name": "Water Coolers Service Charge", "price": "399", "gst": "18% GST", "img": "/eletox-assets/packages/water-coolers-service-charge.png"},
    {"name": "Other", "price": "On Visit", "gst": "18% GST", "img": "/eletox-assets/packages/other.jpg"},
  ],
  "electrician": [
    {"name": "Socket Replacement", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/socket-replacement.png"},
    {"name": "Switchboard repair", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/switchboard-repair.png"},
    {"name": "Fan Repair", "price": "269", "gst": "18% GST", "img": "/eletox-assets/packages/fan-repair.jpg"},
    {"name": "Ceiling fan Installation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/ceiling-fan-installation.jpg"},
    {"name": "Stabilizer installation", "price": "299", "gst": "18% GST", "img": "/eletox-assets/packages/stabilizer-installation.png"},
    {"name": "Other", "price": "On Visit", "gst": "18% GST", "img": "/eletox-assets/packages/other.jpg"},
  ],
};

export const packagesFor = (slug?: string) => (slug ? PACKAGES[slug] || [] : []);
export const slugForTitle = (title?: string) => Object.keys(SERVICE_TITLES).find((k) => SERVICE_TITLES[k] === title);
