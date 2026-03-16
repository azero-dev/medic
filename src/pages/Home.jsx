import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMedications } from '../hooks/useMedications';

export default function Home() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { medications } = useMedications();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const getMedCountForDay = (day) => {
    const dayOfWeek = day.getDay();
    const dayMap = [0, 1, 2, 3, 4, 5, 6];
    return medications.filter(m => {
      if (!m.active) return false;
      return m.days.includes(dayMap[dayOfWeek]);
    }).length;
  };

  const goToPrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div>
      <div className="week-navigation">
        <button className="nav-arrow" onClick={goToPrevWeek}>❮</button>
        <h2>{format(weekStart, 'MMMM yyyy', { locale: es })}</h2>
        <button className="nav-arrow" onClick={goToNextWeek}>❯</button>
      </div>

      <div className="week-calendar">
        {weekDays.map((day, index) => {
          const medCount = getMedCountForDay(day);
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={index}
              className={`day-card ${isTodayDate ? 'today' : ''} ${medCount > 0 ? 'has-meds' : ''}`}
              onClick={() => navigate(`/day/${format(day, 'yyyy-MM-dd')}`)}
            >
              <div className="day-name">{dayNames[index]}</div>
              <div className="day-number">{format(day, 'd')}</div>
              {medCount > 0 && (
                <div className="med-count">💊 {medCount}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button 
          onClick={goToToday}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Ir a hoy
        </button>
      </div>
    </div>
  );
}
