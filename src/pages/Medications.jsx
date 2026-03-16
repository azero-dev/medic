import { useNavigate } from 'react-router-dom';
import { useMedications } from '../hooks/useMedications';

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const dayShorts = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function Medications() {
  const navigate = useNavigate();
  const { medications, loading, removeMedication } = useMedications();

  const handleDelete = async (id, name) => {
    if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      await removeMedication(id);
    }
  };

  const formatDays = (days) => {
    if (!days || days.length === 0) return 'Sin días';
    if (days.length === 7) return 'Todos los días';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Lun-Vie';
    return days.map(d => dayShorts[d]).join(', ');
  };

  const formatTimes = (times) => {
    if (!times || times.length === 0) return 'Sin hora';
    return times.join(', ');
  };

  if (loading) {
    return (
      <div className="medications-page">
        <div className="empty-state">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medications-page">
      <div className="page-header">
        <h2>Mis Medicamentos</h2>
        <button className="add-btn" onClick={() => navigate('/medications/new')}>
          + Nuevo
        </button>
      </div>

      {medications.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3>Sin medicamentos</h3>
          <p>Añade tu primer medicamento para empezar</p>
          <button 
            onClick={() => navigate('/medications/new')}
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
        <div>
          {medications.map(med => (
            <div key={med.id} className="med-list-item">
              <div className="med-list-info">
                <h3>{med.name}</h3>
                <p>{med.dose} • {formatDays(med.days)} • {formatTimes(med.times)}</p>
                {!med.active && <p style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>Inactivo</p>}
              </div>
              <div className="med-list-actions">
                <button 
                  className="icon-btn"
                  onClick={() => navigate(`/medications/${med.id}`)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="icon-btn delete"
                  onClick={() => handleDelete(med.id, med.name)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
