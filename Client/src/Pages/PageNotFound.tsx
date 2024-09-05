import React from "react";
import styles from '../styles/PageNotFound.module.css';

const PageNotFound: React.FC = () => {
  return (
    <div className={styles.pageNotFoundContainer}>
      <h1 className={styles.pageNotFoundHeading}>404 - Page Not Found</h1>
      <p className={styles.pageNotFoundMessage}>
        You are not authorized to access this system. Please contact administration for further assistance.
      </p>
      <a href="/" className={styles.pageNotFoundButton}>Go to Home</a>
    </div>
  );
};

export default PageNotFound;
