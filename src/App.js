// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DesktopApp from './DesktopApp';
import MobilePhantomConnection from './MobilePhantomConnection';

function App() {
    return (
        <Routes>
            <Route path="/" element={<DesktopApp />} />
            <Route path="/mobile/*" element={<MobilePhantomConnection />} />
        </Routes>
    );
}

export default App;
