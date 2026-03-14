import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './components/providers/TournamentProvider';
import { TournamentPage } from './pages/TournamentPage';
import { AuthPage } from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <TournamentProvider>
        <Routes>
          <Route path="/" element={<TournamentPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </TournamentProvider>
    </BrowserRouter>
  );
}

export default App;
