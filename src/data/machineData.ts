// Mock industrial fleet/machine data for Datapx1.
// All numbers are illustrative and meant for demo purposes.

export interface Machine {
  id: string;
  name: string;
  type: string;
  line: string;
  location: string;
  status: "Running" | "Idle" | "Maintenance" | "Fault";
  oee: number;            // 0-100
  availability: number;   // 0-100
  performance: number;    // 0-100
  quality: number;        // 0-100
  temperature: number;    // °C
  vibration: number;      // mm/s
  pressure: number;       // bar
  uptimeHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  riskScore: number;      // 0-100 (higher = more at risk)
}

export const fleetMachines: Machine[] = [
  { id: "M-101", name: "CNC Mill Alpha", type: "CNC Milling", line: "Line A", location: "Plant 1 — Bay 2", status: "Running",     oee: 84, availability: 92, performance: 91, quality: 99, temperature: 62, vibration: 2.1, pressure: 5.4, uptimeHours: 412, lastMaintenance: "2026-03-22", nextMaintenance: "2026-05-22", riskScore: 18 },
  { id: "M-102", name: "Press Beta",     type: "Hydraulic Press", line: "Line A", location: "Plant 1 — Bay 3", status: "Running", oee: 78, availability: 88, performance: 89, quality: 99, temperature: 71, vibration: 3.4, pressure: 6.8, uptimeHours: 388, lastMaintenance: "2026-03-10", nextMaintenance: "2026-05-10", riskScore: 32 },
  { id: "M-103", name: "Robot Arm Gamma", type: "Pick & Place", line: "Line B", location: "Plant 1 — Bay 5", status: "Maintenance", oee: 0,  availability: 0,  performance: 0,  quality: 0,  temperature: 38, vibration: 0.0, pressure: 0.0, uptimeHours: 0,   lastMaintenance: "2026-04-15", nextMaintenance: "2026-04-18", riskScore: 65 },
  { id: "M-104", name: "Welder Delta",    type: "Robotic Welding", line: "Line B", location: "Plant 1 — Bay 6", status: "Running", oee: 82, availability: 90, performance: 92, quality: 99, temperature: 84, vibration: 2.7, pressure: 4.2, uptimeHours: 401, lastMaintenance: "2026-03-28", nextMaintenance: "2026-05-28", riskScore: 22 },
  { id: "M-105", name: "Conveyor Epsilon", type: "Conveyor System", line: "Line C", location: "Plant 1 — Floor", status: "Idle",   oee: 35, availability: 45, performance: 78, quality: 99, temperature: 41, vibration: 1.2, pressure: 2.1, uptimeHours: 180, lastMaintenance: "2026-02-20", nextMaintenance: "2026-04-25", riskScore: 48 },
  { id: "M-106", name: "Lathe Zeta",      type: "CNC Lathe", line: "Line C", location: "Plant 2 — Bay 1", status: "Fault",   oee: 12, availability: 18, performance: 65, quality: 98, temperature: 96, vibration: 6.8, pressure: 7.9, uptimeHours: 22,  lastMaintenance: "2026-01-15", nextMaintenance: "OVERDUE", riskScore: 88 },
  { id: "M-107", name: "Injection Eta",   type: "Injection Molding", line: "Line D", location: "Plant 2 — Bay 2", status: "Running", oee: 88, availability: 94, performance: 93, quality: 99, temperature: 195, vibration: 1.8, pressure: 12.4, uptimeHours: 432, lastMaintenance: "2026-04-01", nextMaintenance: "2026-06-01", riskScore: 14 },
  { id: "M-108", name: "Grinder Theta",   type: "Surface Grinder", line: "Line D", location: "Plant 2 — Bay 3", status: "Running", oee: 76, availability: 86, performance: 88, quality: 99, temperature: 68, vibration: 3.1, pressure: 5.0, uptimeHours: 372, lastMaintenance: "2026-03-15", nextMaintenance: "2026-05-15", riskScore: 28 },
];

// 24h telemetry sample for a machine
export const telemetry24h = Array.from({ length: 24 }, (_, h) => ({
  time: `${String(h).padStart(2, "0")}:00`,
  temperature: 55 + Math.sin(h / 3) * 8 + Math.random() * 3,
  vibration: 2 + Math.cos(h / 4) * 0.8 + Math.random() * 0.4,
  pressure: 5 + Math.sin(h / 5) * 1.2 + Math.random() * 0.3,
  output: 40 + Math.sin(h / 6) * 12 + Math.random() * 6,
}));

// Connectors catalog
export interface Connector {
  id: string;
  name: string;
  category: "ERP" | "MES" | "SCADA" | "IoT / Telemetry" | "Database" | "Cloud Storage" | "Quality";
  description: string;
  status: "Connected" | "Available";
  lastSync?: string;
  records?: string;
  icon: string; // initials for placeholder
}

export const connectorCatalog: Connector[] = [
  { id: "sap_s4", name: "SAP S/4HANA", category: "ERP", description: "Enterprise resource planning — orders, BOM, inventory.", status: "Connected", lastSync: "2m ago", records: "4.2M", icon: "SA" },
  { id: "oracle_erp", name: "Oracle Fusion ERP", category: "ERP", description: "Financials, procurement and supply chain data.", status: "Available", icon: "OR" },
  { id: "ms_dynamics", name: "Microsoft Dynamics 365", category: "ERP", description: "Operations, finance and supply chain.", status: "Available", icon: "MS" },
  { id: "siemens_mes", name: "Siemens Opcenter MES", category: "MES", description: "Manufacturing execution — production orders, genealogy.", status: "Connected", lastSync: "5m ago", records: "1.8M", icon: "SI" },
  { id: "rockwell_mes", name: "Rockwell FactoryTalk", category: "MES", description: "Production tracking and OEE.", status: "Available", icon: "RW" },
  { id: "ge_proficy", name: "GE Proficy SCADA", category: "SCADA", description: "Real-time supervisory control and data acquisition.", status: "Connected", lastSync: "live", records: "stream", icon: "GE" },
  { id: "wonderware", name: "AVEVA Wonderware", category: "SCADA", description: "Plant SCADA & HMI telemetry.", status: "Available", icon: "AV" },
  { id: "mqtt_broker", name: "MQTT Broker", category: "IoT / Telemetry", description: "Stream sensor data via MQTT topics.", status: "Connected", lastSync: "live", records: "stream", icon: "MQ" },
  { id: "opc_ua", name: "OPC UA Server", category: "IoT / Telemetry", description: "Industrial machine telemetry standard.", status: "Connected", lastSync: "live", records: "stream", icon: "OP" },
  { id: "azure_iot", name: "Azure IoT Hub", category: "IoT / Telemetry", description: "Cloud IoT device management & telemetry.", status: "Available", icon: "AZ" },
  { id: "aws_iot", name: "AWS IoT Core", category: "IoT / Telemetry", description: "Managed IoT message broker.", status: "Available", icon: "AW" },
  { id: "postgres", name: "PostgreSQL", category: "Database", description: "Relational data warehouse / OLTP.", status: "Connected", lastSync: "10m ago", records: "820K", icon: "PG" },
  { id: "snowflake", name: "Snowflake", category: "Database", description: "Cloud data warehouse.", status: "Available", icon: "SN" },
  { id: "s3", name: "Amazon S3", category: "Cloud Storage", description: "Bulk file & log storage.", status: "Available", icon: "S3" },
  { id: "minitab", name: "Minitab QC", category: "Quality", description: "Statistical quality control data.", status: "Available", icon: "MT" },
];

// Raw sample dataset for Data Processing page
export const rawDatasetColumns = [
  "timestamp", "machine_id", "temperature_c", "vibration_mms", "pressure_bar", "output_units", "scrap_count", "shift",
];

export const rawDatasetRows = Array.from({ length: 12 }, (_, i) => {
  const machines = ["M-101", "M-102", "M-104", "M-105", "M-107", "M-108"];
  const shifts = ["A", "B", "C"];
  return [
    `2026-04-17 ${String(8 + i).padStart(2, "0")}:00`,
    machines[i % machines.length],
    (55 + Math.random() * 40).toFixed(1),
    (1.5 + Math.random() * 4).toFixed(2),
    (3 + Math.random() * 10).toFixed(2),
    Math.round(35 + Math.random() * 25),
    Math.round(Math.random() * 4),
    shifts[i % 3],
  ];
});

// Statistical summary
export const statisticalSummary = [
  { feature: "temperature_c", mean: 71.4, median: 69.8, std: 12.6, min: 38.0, max: 195.0, missing: 0.4 },
  { feature: "vibration_mms", mean: 2.94, median: 2.71, std: 1.42, min: 0.00, max: 6.80, missing: 0.0 },
  { feature: "pressure_bar", mean: 5.48, median: 5.20, std: 2.81, min: 0.00, max: 12.40, missing: 1.2 },
  { feature: "output_units", mean: 47.2, median: 48.0, std: 9.8, min: 0, max: 72, missing: 0.0 },
  { feature: "scrap_count", mean: 1.32, median: 1.0, std: 1.18, min: 0, max: 6, missing: 0.0 },
];

// Feature correlation with target (output_units)
export const featureImportance = [
  { feature: "temperature_c", importance: 0.32, correlation: -0.41 },
  { feature: "vibration_mms", importance: 0.28, correlation: -0.58 },
  { feature: "pressure_bar", importance: 0.18, correlation: 0.22 },
  { feature: "shift_encoded", importance: 0.12, correlation: 0.14 },
  { feature: "machine_age_yrs", importance: 0.10, correlation: -0.31 },
];

// Distribution buckets for a feature
export const temperatureDistribution = [
  { bucket: "30-50", count: 12 },
  { bucket: "50-70", count: 48 },
  { bucket: "70-90", count: 64 },
  { bucket: "90-110", count: 22 },
  { bucket: "110-150", count: 8 },
  { bucket: "150+", count: 6 },
];
