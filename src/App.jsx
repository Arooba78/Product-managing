import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadForm from "./components/uploadForm";
import Dashboard from "./components/dashboard";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Upload Product</Link> | 
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<UploadForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
