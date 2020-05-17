import { Routes, Route, BrowserRouter } from 'react-router-dom';
import React from 'react';
import { App } from './App';
import Craft from './craft/Craft';

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/craft" element={<Craft />} />
      </Routes>
    </BrowserRouter>
  );
}
