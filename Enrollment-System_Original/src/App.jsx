import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Hero from "./components/Hero";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Dashboard2 from "./components/Dashboard2";
import Dashboard3 from "./components/Dashboard3";
import Dashboard4 from "./components/Dashboard4";
import Dashboard5 from "./components/Dashboard5";
import AdminRequirements from "./pages/AdminRequirements";
import DashboardNavbar from "./components/DashboardNavbar";
import Page1 from "./components/Page1"; 
import Page2 from "./components/Page2";
import Page3 from "./components/Page3";
import Page4 from "./components/Page4";
import Page5 from "./components/Page5";

function App() {
  return (
    <Router>
      <div>
        <Hero />
        <ConditionalNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/requirements" element={<AdminRequirements />} />
          {/* Dynamic dashboard route */}
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/dashboard2/:id" element={<Dashboard2 />} />
          <Route path="/dashboard3/:id" element={<Dashboard3 />} />
          <Route path="/dashboard4/:id" element={<Dashboard4 />} />
          <Route path="/dashboard5/:id" element={<Dashboard5 />} />
          <Route path="/register" element={<Register />} />
          <Route path="/page1" element={<Page1 />} /> 
          <Route path= "/page2" element={<Page2 />} />
          <Route path= "/page3" element={<Page3 />} />
          <Route path= "/page4" element={<Page4 />} />
          <Route path= "/page5" element={<Page5 />} />
        
        </Routes>
      </div>
    </Router>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  
  // Display the navbar for dashboard routes, including dynamic ones
  if (location.pathname.startsWith("/dashboard")) {
    return <DashboardNavbar />;
  }
  return null;
}

export default App;