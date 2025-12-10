// Inspection Checklist - Structural Steelworks

export const wellbeingQuestions = [
  {
    id: 1,
    text: "RFI No.",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 2,
    text: "PROJECT",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 3,
    text: "DATE",
    type: "date", 
    section: "Project Information",
    optional: false,
  },
  {
    id: 4,
    text: "STRUCTURAL STEEL SPECIALIST",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 5,
    text: "LOCATION / GRIDLINES",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 6,
    text: "STEEL GRADE",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 7,
    text: "CLASS OF STEEL (CHECK CONSULTANT DRAWING)",
    type: "short-answer",
    section: "Project Information",
    optional: false,
  },
  {
    id: 8,
    text: "FINISHING SPECIFICATION",
    type: "radio",
    options: ["HOT DIPPED GALVANISED", "PAINTING", "VERMICULITE", "INTUMESCENT"],
    section: "Project Information",
    optional: false,
  },
  {
    id: 9,
    text: "STRUCTURAL ELEMENT",
    type: "radio",
    options: ["BEAM", "COLUMN", "OTHERS"],
    section: "Project Information",
    optional: false,
  },
  // Site Preparation
  {
    id: 11,
    text: " Weight of the steel element (to make sure of tower crane lifting capacity)",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },
  {
    id: 12,
    text: " Temporary propping of the steel elements (YES/NO)",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },
  {
    id: 13,
    text: " Lifting position / lifting gears",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },
  {
    id: 14,
    text: "Approved lane / road closure from LTA (if crane parking is at road)",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },
  {
    id: 15,
    text: " Crane sitting platform with PE calculation & COS",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },
  {
    id: 16,
    text: " LEW engagement (as per contract requirement)",
    type: "dual-response-date",
    section: "Site Preparation",
    optional: false,
  },

  // Surface Preparation
  {
    id: 17,
    text: " Anchor Bolts: Position (mm) (at top of concrete) [Criteria: ± 5mm]",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
  {
    id: 18,
    text: " Bolt Level / Double Nut < 3 threads or more: Bolt Size (mm) (as specified)",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
  {
    id: 19,
    text: " Bolt Level / Double Nut: Hole Size (mm) and thickness (mm)",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
  {
    id: 20,
    text: " Cleanliness of the drill holes",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
  {
    id: 21,
    text: " Non-shrink Grout Bedding: Grade (N/mm2 same or higher than concrete)",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
  {
    id: 22,
    text: " Non-shrink Grout Bedding: Thickness as specified",
    type: "dual-response-date",
    section: "Surface Preparation",
    optional: false,
  },
];

export const slug = "structural-steelworks";
export const assessmentId = "super-user-assignment-id"; // Using ID from WelcomePage mock for consistency
