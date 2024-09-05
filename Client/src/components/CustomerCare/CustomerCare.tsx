import React from 'react';
import styles from '../../styles/CustomerCare.module.css';

const CustomerCare: React.FC = () => {
    return (
        <div className={styles.customerCare}>
            <h1 className={styles.heading}>Customer Care</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Contact Us</h2>
                <p>Email: support@example.com</p>
                <p>Phone: 1-800-123-4567</p>
                <p>Address: 123 Main Street, Anytown, USA</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Operating Hours</h2>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
                <div className={styles.faqItem}>
                    <h3 className={styles.faqItemHeading}>How can I reset my password?</h3>
                    <p className={styles.faqItemText}>To reset your password, click on "Forgot Password" on the login page and follow the instructions.</p>
                </div>
                <div className={styles.faqItem}>
                    <h3 className={styles.faqItemHeading}>How can I track my order?</h3>
                    <p className={styles.faqItemText}>You can track your order using the tracking number provided in your order confirmation email.</p>
                </div>
                <div className={styles.faqItem}>
                    <h3 className={styles.faqItemHeading}>What is your return policy?</h3>
                    <p className={styles.faqItemText}>We accept returns within 30 days of purchase. Please ensure the item is in its original condition.</p>
                </div>
            </section>
        </div>
    );
};

export default CustomerCare;
