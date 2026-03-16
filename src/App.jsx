import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DayDetail from './pages/DayDetail';
import Medications from './pages/Medications';
import MedicationForm from './pages/MedicationForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="day/:date" element={<DayDetail />} />
        <Route path="medications" element={<Medications />} />
        <Route path="medications/new" element={<MedicationForm />} />
        <Route path="medications/:id" element={<MedicationForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
