import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedications } from '../hooks/useMedications';

const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function MedicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMedicationById, createMedication, editMedication } = useMedications();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    dose: '',
    days: [1, 2, 3, 4, 5],
    times: ['08:00'],
    active: true
  });

  useEffect(() => {
    if (isEditing) {
      const med = getMedicationById(id);
      if (med) {
        setFormData({
          name: med.name || '',
          dose: med.dose || '',
          days: med.days || [1, 2, 3, 4, 5],
          times: med.times || ['08:00'],
          active: med.active !== false
        });
      }
    }
  }, [id, isEditing, getMedicationById]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dose.trim()) {
      alert('Por favor, completa el nombre y la dosis');
      return;
    }
    if (formData.days.length === 0) {
      alert('Selecciona al menos un día');
      return;
    }
    if (formData.times.length === 0) {
      alert('Añade al menos una hora');
      return;
    }

    try {
      if (isEditing) {
        await editMedication(parseInt(id), formData);
      } else {
        await createMedication(formData);
      }
      navigate('/medications');
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Error al guardar el medicamento');
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort((a, b) => a - b)
    }));
  };

  const addTime = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTime = (index) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTime = (index, value) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? value : t)
    }));
  };

  return (
    <div className="form-page">
      <h2>{isEditing ? 'Editar Medicamento' : 'Nuevo Medicamento'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del medicamento</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Paracetamol"
          />
        </div>

        <div className="form-group">
          <label>Dosis</label>
          <input
            type="text"
            value={formData.dose}
            onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
            placeholder="Ej: 500mg, 1 comprimido"
          />
        </div>

        <div className="form-group">
          <label>Días de la semana</label>
          <div className="days-selector">
            {dayLabels.map((label, index) => (
              <button
                key={index}
                type="button"
                className={`day-toggle ${formData.days.includes(index) ? 'selected' : ''}`}
                onClick={() => toggleDay(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Horas</label>
          <div className="time-inputs">
            {formData.times.map((time, index) => (
              <div key={index} className="time-input-row">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                />
                {formData.times.length > 1 && (
                  <button
                    type="button"
                    className="remove-time-btn"
                    onClick={() => removeTime(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-time-btn" onClick={addTime}>
              + Añadir otra hora
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/medications')}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
