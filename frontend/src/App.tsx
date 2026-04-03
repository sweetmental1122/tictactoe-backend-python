import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import Lobby from '../components/Lobby';
import Game from '../components/Game';
import PrivateRoute from '../components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/lobby" element={
          <PrivateRoute><Lobby /></PrivateRoute>
        } />
        <Route path="/game/:roomId" element={
          <PrivateRoute><Game /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
