import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DebugLogin from './pages/DebugLogin';
import Dashboard from './pages/Dashboard';
import Technicians from './pages/Technicians';
import Requests from './pages/Requests';
import Statistics from './pages/Statistics';
import Export from './pages/Export';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/d" element={<DebugLogin />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/technicians" element={<Layout><Technicians /></Layout>} />
      <Route path="/requests" element={<Layout><Requests /></Layout>} />
      <Route path="/statistics" element={<Layout><Statistics /></Layout>} />
      <Route path="/export" element={<Layout><Export /></Layout>} />
      <Route path="/" element={<Login />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
