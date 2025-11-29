import { PATIENTS } from './simulated_database';

let db = null;
let SQL = null;

// Initialize SQLite database
export const initDatabase = async () => {
  if (db) return db;

  try {
    // Dynamic import to avoid Vite parsing issues
    const initSqlJs = (await import('sql.js')).default;

    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Check if database exists in localStorage
    const savedDb = localStorage.getItem('mystree_sqlite_db');

    if (savedDb) {
      try {
        const binary = atob(savedDb);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          buffer[i] = binary.charCodeAt(i);
        }
        db = new SQL.Database(buffer);
      } catch (error) {
        console.error('Error loading database from localStorage:', error);
        // Create new database if loading fails
        db = new SQL.Database();
        createTables();
        insertInitialData();
        saveDatabase();
      }
    } else {
      // Create new database
      db = new SQL.Database();
      createTables();
      insertInitialData();
      saveDatabase();
    }

    return db;
  } catch (err) {
    console.error("Failed to initialize database", err);
    return null;
  }
};

// Create tables
const createTables = () => {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      ID TEXT PRIMARY KEY,
      Name TEXT NOT NULL,
      Age INTEGER NOT NULL,
      Role TEXT NOT NULL,
      BP TEXT,
      Heart_Rate INTEGER,
      Temperature_F REAL,
      SpO2_Percent INTEGER,
      Weight_KG REAL,
      Activity_Level TEXT,
      Stress_Index TEXT,
      Avg_Sleep TEXT,
      Dietary_Note TEXT,
      Cycle_Status TEXT,
      Active_Complaint TEXT,
      AI_Risk_Score TEXT,
      Partner_Alert_Enabled INTEGER DEFAULT 0
    )
  `);
};

// Insert initial data
const insertInitialData = () => {
  if (!db) return;
  // Check if data already exists
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM patients');
  checkStmt.step();
  const count = checkStmt.getAsObject().count;
  checkStmt.free();

  if (count > 0) {
    return; // Data already exists
  }

  // Insert initial patient data
  const patients = [
    ['user_001', 'Anjali', 45, 'Patient', '145/90', 88, 99.1, 98, 78, 'Sedentary (Office Job)', 'High (8/10)', '5.5 hours/night', 'High Sugar Intake (Pre-diabetic risk)', 'Irregular (Perimenopausal symptoms)', 'Rapidly growing painful lesion on leg', '5 (RED)', 0],
    ['user_002', 'Priya', 24, 'Patient', '118/75', 92, 98.6, 99, 55, 'Moderate (Yoga 2x/week)', 'Severe Anxiety (Hypochondria tendencies)', '6 hours (Trouble falling asleep)', 'Vegetarian; irregular meals', 'Late by 12 days (Potential stress delay)', 'Small bump in genital area; worried about cancer', '3 (YELLOW)', 0],
    ['user_003', 'Sneha', 19, 'Patient', '110/70', 58, 98.4, 100, 60, 'High (College Athlete)', 'Low (Stable)', '8 hours (Good quality)', 'High Protein; Excellent Hydration (>2.5L)', 'Regular (28 days)', 'None', '0 (GREEN)', 0],
    ['user_004', 'Riya', 28, 'Patient', '125/80', 82, 98.9, 99, 65, 'Low today (Fatigue reported)', 'Elevated (PMDD Trigger)', '9 hours (Hypersomnia phase)', 'Caffeine intake high (>3 cups)', 'Day 26 (Late Luteal Phase)', 'None', 'N/A', 1]
  ];

  const stmt = db.prepare(`
    INSERT INTO patients (
      ID, Name, Age, Role, BP, Heart_Rate, Temperature_F, SpO2_Percent, 
      Weight_KG, Activity_Level, Stress_Index, Avg_Sleep, Dietary_Note, 
      Cycle_Status, Active_Complaint, AI_Risk_Score, Partner_Alert_Enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  patients.forEach(patient => {
    stmt.run(patient);
  });

  stmt.free();
};

// Save database to localStorage
const saveDatabase = () => {
  if (!db) return;
  try {
    const data = db.export();
    // Convert Uint8Array to base64 for browser storage
    const binary = Array.from(data, byte => String.fromCharCode(byte)).join('');
    const base64 = btoa(binary);
    localStorage.setItem('mystree_sqlite_db', base64);
  } catch (e) {
    console.error("Failed to save database", e);
  }
};

// Get patient by ID
export const getPatientById = (patientId) => {
  if (!db) return null;

  // Map old IDs to new IDs
  const idMap = {
    'p1': 'user_001',
    'p2': 'user_002',
    'p3': 'user_003',
    'p4': 'user_004'
  };

  const mappedId = idMap[patientId] || patientId;

  try {
    const stmt = db.prepare('SELECT * FROM patients WHERE ID = ?');
    stmt.bind([mappedId]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }

    stmt.free();
  } catch (e) {
    console.error("Error getting patient", e);
  }
  return null;
};

// Get all patients
export const getAllPatients = () => {
  if (!db) return [];

  try {
    const stmt = db.prepare('SELECT * FROM patients');
    const patients = [];

    while (stmt.step()) {
      patients.push(stmt.getAsObject());
    }

    stmt.free();
    return patients;
  } catch (e) {
    console.error("Error getting all patients", e);
    return [];
  }
};

// Update patient
export const updatePatient = (patientId, updates) => {
  if (!db) return;

  const idMap = {
    'p1': 'user_001',
    'p2': 'user_002',
    'p3': 'user_003',
    'p4': 'user_004'
  };

  const mappedId = idMap[patientId] || patientId;

  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const sql = `UPDATE patients SET ${setClause} WHERE ID = ?`;

    const stmt = db.prepare(sql);
    stmt.run([...values, mappedId]);
    stmt.free();

    saveDatabase();
  } catch (e) {
    console.error("Error updating patient", e);
  }
};

// Auto-save on changes
export const autoSave = () => {
  saveDatabase();
};
