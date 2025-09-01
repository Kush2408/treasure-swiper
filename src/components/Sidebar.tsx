import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/shared-sidebar.css";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  
  // Check if current path is in critical infrastructure section
  const isInCriticalInfra = (path: string) => 
    path === "/engine-propulsion" || path === "/suction-system";

  // Map routes to labels
  const criticalInfraLabels: Record<string, string> = {
    "/engine-propulsion": "Engine & Propulsion",
    "/suction-system": "Suction System",
  };

  // Show selected label or fallback
  const selectedInfra = criticalInfraLabels[pathname] || "Critical Infrastructure";

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar">
        <h1 className="brand">TREASURE SWIPER</h1>
        <nav className="menu">
          <Link to="/" className={`menu-item ${isActive("/") ? "active" : ""}`}>
            Dashboard
          </Link>

          <div className="menu-group">
            <button 
              className={`menu-item dropdown-btn ${isInCriticalInfra(pathname) ? "active" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedInfra} {dropdownOpen ? "▴" : "▾"}
            </button>
            <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
              <Link 
                to="/engine-propulsion" 
                className={`dropdown-item ${isActive("/engine-propulsion") ? "active" : ""}`}
              >
                Engine & Propulsion
              </Link>
            </div>
              <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>  
              <Link 
                to="/suction-system" 
                className={`dropdown-item ${isActive("/suction-system") ? "active" : ""}`}
              >
                Suction System
              </Link>
            </div>    
          </div>

          <Link to="/upload" className={`menu-item ${isActive("/upload") ? "active" : ""}`}>
            Upload Document
          </Link>

          <Link to="/predictive" className={`menu-item ${isActive("/predictive") ? "active" : ""}`}>
            Predictive Analysis
          </Link>

          <Link to="/settings" className={`menu-item ${isActive("/settings") ? "active" : ""}`}>
            Settings
          </Link>
        </nav>
      </div>
    </div>
  );
}
