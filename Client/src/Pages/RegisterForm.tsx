import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '../validation/registerSchema';
import styles from '../styles/RegisterForm.module.css';
import logo from '../Assets/simplify.png';
import termsText from '../TermsOfUse/TermsOfUse';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = (data: RegisterSchema) => {
        navigate("/")
    };

    return (
        <div className={styles.registerContainer}>
            <img src={logo} alt="logo" />
            <h2 className={styles.heading}>Register</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formRow}>
                    <div className={styles.formGroupRegister}>
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            id="firstName"
                            type="text"
                            {...register('firstName')}
                        />
                        {errors.firstName && <p className={styles.error}>{errors.firstName.message}</p>}
                    </div>
                    <div className={styles.formGroupRegister}>
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            id="lastName"
                            type="text"
                            {...register('lastName')}
                        />
                        {errors.lastName && <p className={styles.error}>{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroupRegister}>
                        <label htmlFor="companyName">Name of Company *</label>
                        <input
                            id="companyName"
                            type="text"
                            {...register('companyName')}
                        />
                        {errors.companyName && <p className={styles.error}>{errors.companyName.message}</p>}
                    </div>
                    <div className={styles.formGroupRegister}>
                        <label htmlFor="city">City *</label>
                        <input
                            id="city"
                            type="text"
                            {...register('city')}
                        />
                        {errors.city && <p className={styles.error}>{errors.city.message}</p>}
                    </div>
                </div>

                <div className={styles.formGroupRegister}>
                    <label htmlFor="mobile">Mobile *</label>
                    <input
                        id="mobile"
                        type="text"
                        {...register('mobile')}
                    />
                    {errors.mobile && <p className={styles.error}>{errors.mobile.message}</p>}
                </div>
                <div >
                    <textarea
                        id="termsText"
                        className={styles.termsText}
                        value={termsText}
                        readOnly
                    />
                    <div className={styles.checkboxContainer}>
                        <input
                            id="terms"
                            type="checkbox"
                            {...register('terms')}
                        />
                        <label htmlFor="terms">Accept Terms and conditions (Please scroll down the terms & condition till end)</label>
                    </div>
                    {errors.terms && <p className={styles.error}>{errors.terms.message}</p>}
                </div>
                <button type="submit" className={styles.buttonRegister}>Register</button>
            </form>
            <p>Already Registered?<Link to="/">Login Now</Link></p>
        </div>
    );
};

export default RegisterForm;
