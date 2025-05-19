import { NavLink } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        {/* ... existing code ... */}
      </div>
      <ul className="list-unstyled components">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
            <FaHome className="icon" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCalendarAlt className="icon" /> Events
          </NavLink>
        </li>
        <li>
          <NavLink to="/applications" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUsers className="icon" /> Applications
          </NavLink>
        </li>
        {/* ... existing code ... */}
      </ul>
      {/* ... existing code ... */}
    </nav>
  );
};

export default Navbar; 