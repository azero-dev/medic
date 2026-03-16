import { useState, useEffect, useCallback, useRef } from 'react';
import { format, parse, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDosesForDate, addDose, getDose, updateDose } from '../services/db';

export function useDoses(date, medications) {
  const [doses, setDoses] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadDoses = useCallback(async () => {
    try {
      const medsForDay = medications.filter(m => {
        if (!m.active) return false;
        const dayOfWeek = date.getDay();
        const dayMap = [0, 1, 2, 3, 4, 5, 6];
        return m.days.includes(dayMap[dayOfWeek]);
      });

      const existingDoses = await getDosesForDate(dateStr);
      const medIdsWithDoses = new Set(existingDoses.map(d => `${d.medicationId}-${d.time}`));

      let allDoses = [...existingDoses];

      for (const med of medsForDay) {
        for (const time of med.times) {
          const key = `${med.id}-${time}`;
          if (!medIdsWithDoses.has(key)) {
            allDoses.push({
              medicationId: med.id,
              medicationName: med.name,
              medicationDose: med.dose,
              time,
              date: dateStr,
              taken: false,
              takenAt: null
            });
          }
        }
      }

      allDoses = allDoses.map(d => {
        const med = medications.find(m => m.id === d.medicationId);
        return {
          ...d,
          medicationName: med?.name || d.medicationName,
          medicationDose: med?.dose || d.medicationDose
        };
      });

      allDoses.sort((a, b) => a.time.localeCompare(b.time));
      setDoses(allDoses);
    } catch (error) {
      console.error('Error loading doses:', error);
    } finally {
      setLoading(false);
    }
  }, [dateStr, medications]);

  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  const markAsTaken = async (doseIndex) => {
    const dose = doses[doseIndex];
    if (!dose.id) {
      await addDose({ ...dose, taken: true, takenAt: new Date().toISOString() });
    } else {
      await updateDose(dose.id, { ...dose, taken: true, takenAt: new Date().toISOString() });
    }
    await loadDoses();
  };

  const markAsNotTaken = async (doseIndex) => {
    const dose = doses[doseIndex];
    if (dose.id) {
      await updateDose(dose.id, { ...dose, taken: false, takenAt: null });
    }
    await loadDoses();
  };

  return { doses, loading, markAsTaken, markAsNotTaken, refresh: loadDoses };
}

export function useNotifications(medications, doses) {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const intervalRef = useRef(null);

  const requestPermission = async () => {
    console.log('Requesting notification permission...');
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        console.log('Permission result:', perm);
        setPermission(perm);
        return perm;
      } catch (error) {
        console.error('Error requesting permission:', error);
        return 'denied';
      }
    } else {
      console.log('Notifications not supported');
      return 'denied';
    }
  };

  const showNotification = useCallback((medication, time) => {
    if (permission === 'granted') {
      const notification = new Notification('Hora de tu medicamento', {
        body: `${medication.name} - ${medication.dose}`,
        icon: '/icons/icon-192.png',
        tag: `med-${medication.id}-${time}`,
        requireInteraction: true,
        actions: [
          { action: 'taken', title: 'Marcar consumido' },
          { action: 'snooze', title: 'Posponer 10min' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, [permission]);

  const checkNotifications = useCallback(() => {
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const today = format(now, 'yyyy-MM-dd');
    const dayOfWeek = now.getDay();
    const dayMap = [0, 1, 2, 3, 4, 5, 6];

    medications.forEach(med => {
      if (!med.active) return;
      if (!med.days.includes(dayMap[dayOfWeek])) return;

      med.times.forEach(time => {
        const [h, m] = time.split(':').map(Number);
        const doseTime = new Date(now);
        doseTime.setHours(h, m, 0, 0);

        const diff = Math.abs(now - doseTime);
        if (diff < 60000 && !localStorage.getItem(`notified-${med.id}-${time}-${today}`)) {
          showNotification(med, time);
          localStorage.setItem(`notified-${med.id}-${time}-${today}`, 'true');
        }
      });
    });
  }, [medications, showNotification]);

  useEffect(() => {
    if (permission === 'granted') {
      intervalRef.current = setInterval(checkNotifications, 30000);
      checkNotifications();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [permission, checkNotifications]);

  return { permission, requestPermission };
}

export { es };
