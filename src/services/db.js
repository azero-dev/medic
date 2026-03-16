import { openDB } from 'idb';

const DB_NAME = 'medicamentos-pwa';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('medications')) {
        const medStore = db.createObjectStore('medications', { keyPath: 'id', autoIncrement: true });
        medStore.createIndex('name', 'name');
        medStore.createIndex('active', 'active');
      }
      if (!db.objectStoreNames.contains('doses')) {
        const doseStore = db.createObjectStore('doses', { keyPath: 'id', autoIncrement: true });
        doseStore.createIndex('medicationId', 'medicationId');
        doseStore.createIndex('date', 'date');
        doseStore.createIndex('time', 'time');
      }
    },
  });
}

export async function getAllMedications() {
  const db = await initDB();
  return db.getAll('medications');
}

export async function getMedication(id) {
  const db = await initDB();
  return db.get('medications', id);
}

export async function addMedication(medication) {
  const db = await initDB();
  return db.add('medications', medication);
}

export async function updateMedication(id, medication) {
  const db = await initDB();
  return db.put('medications', { ...medication, id });
}

export async function deleteMedication(id) {
  const db = await initDB();
  await db.delete('medications', id);
  const doses = await db.getAllFromIndex('doses', 'medicationId', id);
  for (const dose of doses) {
    await db.delete('doses', dose.id);
  }
}

export async function getDosesForDate(date) {
  const db = await initDB();
  const allDoses = await db.getAll('doses');
  return allDoses.filter(dose => dose.date === date);
}

export async function getDose(id) {
  const db = await initDB();
  return db.get('doses', id);
}

export async function addDose(dose) {
  const db = await initDB();
  return db.add('doses', dose);
}

export async function updateDose(id, dose) {
  const db = await initDB();
  return db.put('doses', { ...dose, id });
}

export async function getDosesForDateRange(startDate, endDate) {
  const db = await initDB();
  const allDoses = await db.getAll('doses');
  return allDoses.filter(dose => dose.date >= startDate && dose.date <= endDate);
}
