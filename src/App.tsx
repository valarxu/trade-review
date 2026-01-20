import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { NewTrade } from './pages/NewTrade';
import { TradeDetail } from './pages/TradeDetail';
import { NewPlan } from './pages/NewPlan';
import { PlanDetail } from './pages/PlanDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trade/new" element={<NewTrade />} />
        <Route path="/trade/:id" element={<TradeDetail />} />
        <Route path="/plan/new" element={<NewPlan />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
