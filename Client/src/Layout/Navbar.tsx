import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Dropdown } from 'react-bootstrap';
import logo from '../Assets/simplify.png';
import { BellIcon } from '@chakra-ui/icons';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

const NavbarComponent: React.FC = () => {
  const userId = sessionStorage.getItem('user_id');
  const firstName = sessionStorage.getItem('first_name');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleUserProfile = () => {
    navigate('/userprofile');
  };

  const handleMyOrders = () => {
    navigate('/myorders');
  };

  const handleDropdownToggle = () => {
    setShowDropdown(prev => !prev); // Toggle dropdown visibility
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleCustomercare = () => {
    navigate('/CustomerCare');
  };

  // Get the first letter of the user's first name
  const userInitial = firstName ? firstName.charAt(0).toUpperCase() : '';

  return (
    <Navbar bg="light" expand="lg" className={styles.navbar}>
      <Navbar.Brand>
        <img
          src={logo}
          width="100%"
          height="80px"
          className={styles.logo}
          alt="Logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className={styles.navItems}>
          <Nav.Item>
            <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/eTender" className={styles.navLink}>eTender</Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/myorders" className={styles.navLink} onClick={handleMyOrders}>My Order</Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/myreports" className={styles.navLink}>My Report</Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/tenderreport" className={styles.navLink}>Tender Report</Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/CustomerCare" className={styles.navLink} onClick={handleCustomercare}>Customer Care: 9881999101</Link>
          </Nav.Item>
          <NavDropdown title="Monthly Quota" id="basic-nav-dropdown">
            <Link to="/millwise" className={styles.navLink}>Mill Wise</Link>
            <Link to="/stateanddistwise" className={styles.navLink}>State & District Wise</Link>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
      <div className={styles.iconsContainer}>
        <BellIcon boxSize={35} color="gray.500" marginLeft={20} />
        <Dropdown ref={dropdownRef} className={styles.dropdown}>
          <Dropdown.Toggle
            as={Avatar}
            sx={{ cursor: 'pointer', width: 60, height: 60 ,fontSize:"25px"}}
            alt="Avatar"
            onClick={handleDropdownToggle}
          >
            {userInitial}  
          </Dropdown.Toggle>
          <Dropdown.Menu
            align="end"
            show={showDropdown}
            className={styles.dropdownMenu}
          >
            <Dropdown.Item onClick={handleUserProfile}>Edit Profile</Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>Sign Out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div className={styles.userInfo}>
          <h4>{userId}</h4>
          <h6 className={styles.textDanger}>{firstName}</h6>
        </div>
      </div>
      <div className={styles.currentTime}>
        <h5>{formatDateTime(currentTime)}</h5>
      </div>
    </Navbar>
  );
};

export default NavbarComponent;
