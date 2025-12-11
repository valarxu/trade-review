import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TradeList } from './pages/TradeList';
import { NewTrade } from './pages/NewTrade';
import { TradeDetail } from './pages/TradeDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradeList />} />
        <Route path="/trade/new" element={<NewTrade />} />
        <Route path="/trade/:id" element={<TradeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;