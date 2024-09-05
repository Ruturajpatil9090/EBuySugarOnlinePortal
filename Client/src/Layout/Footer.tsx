// Footer.tsx
import React from 'react';
import styles from '../styles/Footer.module.css';
import logo from "../Assets/jksugarslogo.png";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="JK Sugars Logo" />
        </div>
        <div className={styles.socialAndInfo}>
          <div className={styles.socialLinks}>
            <a
              href="https://www.facebook.com/eBuySugar/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://x.com/i/flow/login?redirect_after_login=%2Febuysugar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com/ebuysugar/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://in.linkedin.com/company/ebuysugar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
          <div className={styles.footerInfo}>
            <p>Customer Care: 9881999101</p>
            <p>&copy; 2024 | JK Sugars and Commodities Pvt. Ltd. | All rights reserved.</p>
            <p>
              <a href="#">Terms of Use</a> | <a href="#">Insurance Policy</a> | <a href="#">FAQ</a> | <a href="#">Contact Us</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
