import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMedications } from '../hooks/useMedications';
import { useDoses } from '../hooks/useNotifications';

export default function DayDetail() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { medications } = useMedications();
  const parsedDate = parseISO(date);
  const { doses, loading, markAsTaken, markAsNotTaken } = useDoses(parsedDate, medications);

  const formattedDate = format(parsedDate, "EEEE, d 'de' MMMM", { locale: es });
  const isTodayDate = isToday(parsedDate);

  return (
    <div>
      <div className="day-header">
        <h2 style={{ textTransform: 'capitalize' }}>{formattedDate}</h2>
        {isTodayDate && <span className="today-badge">HOY</span>}
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Cargando...</p>
        </div>
      ) : doses.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3>Sin medicamentos</h3>
          <p>No hay medicamentos programados para este día.</p>
          <button 
            onClick={() => navigate('/medications')}
            style={{
              marginTop: '1rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Añadir medicamento
          </button>
        </div>
      ) : (
        <div className="medication-list">
          {doses.map((dose, index) => (
            <div key={index} className={`medication-item ${dose.taken ? 'taken' : ''}`}>
              <div className="med-info">
                <div className="med-name">{dose.medicationName}</div>
                <div className="med-dose">{dose.medicationDose}</div>
                <div className="med-time">
                  <span className="time-icon">🕐</span>
                  <span>{dose.time}</span>
                </div>
              </div>
              {dose.taken ? (
                <button 
                  className="untake-btn"
                  onClick={() => markAsNotTaken(index)}
                >
                  Deshacer
                </button>
              ) : (
                <button 
                  className="take-btn"
                  onClick={() => markAsTaken(index)}
                >
                  ✓ Consumir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
