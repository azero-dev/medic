import { useState, useEffect, useCallback } from 'react';
import { getAllMedications, addMedication, updateMedication, deleteMedication } from '../services/db';

export function useMedications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMedications = useCallback(async () => {
    try {
      const meds = await getAllMedications();
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const createMedication = async (medication) => {
    const newMed = { ...medication, active: true, createdAt: new Date().toISOString() };
    const id = await addMedication(newMed);
    await loadMedications();
    return id;
  };

  const editMedication = async (id, medication) => {
    await updateMedication(id, medication);
    await loadMedications();
  };

  const removeMedication = async (id) => {
    await deleteMedication(id);
    await loadMedications();
  };

  const getMedicationById = (id) => {
    return medications.find(m => m.id === parseInt(id));
  };

  return {
    medications,
    loading,
    createMedication,
    editMedication,
    removeMedication,
    getMedicationById,
    refresh: loadMedications
  };
}
