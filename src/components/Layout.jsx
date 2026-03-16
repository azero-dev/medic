import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useMedications } from '../hooks/useMedications';

export default function Layout() {
  const location = useLocation();
  const { medications } = useMedications();
  const { permission, requestPermission } = useNotifications(medications, []);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const handleEnableNotifications = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await requestPermission();
      setNotificationStatus(result);
      
      if (result === 'granted') {
        alert('¡Notificaciones activadas!');
      } else if (result === 'denied') {
        alert('Las notificaciones fueron bloqueadas. Por favor, habilítalas en la configuración del navegador.');
      }
    } catch (error) {
      console.error('Error:', error);
      setNotificationStatus('error');
    }
  };

  const showBanner = permission !== 'granted' && !bannerDismissed;

  return (
    <div className="app-container">
      {showBanner && (
        <div 
          className="notification-banner" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <button 
            onClick={handleEnableNotifications}
            style={{ 
              background: 'rgba(255,255,255,0.25)', 
              border: '1px solid white', 
              padding: '6px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              color: 'white', 
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Activar notificaciones
          </button>
          {notificationStatus === 'denied' && <span style={{ fontSize: '12px' }}>Bloqueado</span>}
          <button 
            onClick={() => setBannerDismissed(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              fontSize: '18px',
              marginLeft: '5px'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <header className="header">
        <h1>💊 Medicamentos</h1>
        <nav className="header-nav">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-btn ${isActive && location.pathname === '/' ? 'active' : ''}`}
          >
            Inicio
          </NavLink>
          <NavLink 
            to="/medications" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Mis Meds
          </NavLink>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
