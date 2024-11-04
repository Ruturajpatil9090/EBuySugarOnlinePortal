import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '../validation/loginSchema';
import { useNavigate, Link } from 'react-router-dom';
import { PhoneIcon } from '@chakra-ui/icons';
import logo from '../Assets/simplify.png';
import styles from '../styles/LoginForm.module.css';
import axios from 'axios';
import ToastComponent, { showSuccessToast, showErrorToast } from '../UI/ToastComponent';
const apiKey = process.env.REACT_APP_API_KEY;

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {

        try {
            const response = await axios.post(`${apiKey}/check-phone`, {
                phone_no: data.mobileNumber,
            });
            if (response.status === 200) {
                const { access_token } = response.data;
                const { user_type, phone_no, first_name, user_id, menu_add_resell, ac_code, accoid } = response.data.user_data;
                sessionStorage.setItem('token', access_token);
                sessionStorage.setItem('user_type', user_type);
                sessionStorage.setItem('phone_no', phone_no);
                sessionStorage.setItem('user_id', user_id);
                sessionStorage.setItem('first_name', first_name);
                sessionStorage.setItem('menu_add_resell', menu_add_resell);
                sessionStorage.setItem('ac_code', ac_code);
                sessionStorage.setItem('accoid', accoid);

                if (data.mobileNumber === '8888118888') {
                    sessionStorage.setItem('isAdmin', 'Y');
                } else {
                    sessionStorage.setItem('isAdmin', 'N');
                }
                if (sessionStorage.getItem('isAdmin') === 'N' && (!ac_code || !accoid)) {
                    navigate('/PageNotFound');
                    return;
                }
                showSuccessToast('Login successful!');
                setTimeout(() => {
                    navigate('/enter-otp');
                }, 1000);

            } else {
                console.error('Login error:', response.data);
                showErrorToast("Invalid Credentials!");
            }
        } catch (error) {
            console.error('Login failed:', error);
            showErrorToast("Invalid Credentials!");
        }
    };

    return (
        <>
            <ToastComponent />
            <div className={styles.loginContainer}>
                <img src={logo} alt='' />
                <h2 className={styles.heading}>Registered Sugar Miller & Trader Login</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.formGroup}>
                        <label>Sign In to your account</label>
                        <PhoneIcon boxSize={25} color='gray.500' marginRight={20} />
                        <input
                            id='mobileNumber'
                            type='text'
                            placeholder='Enter Mobile No'
                            {...register('mobileNumber')}
                        />
                        {errors.mobileNumber && (
                            <p className={styles.error}>{errors.mobileNumber.message}</p>
                        )}
                    </div>
                    <button type='submit'>Login</button>
                </form>
                <p>
                    Not Registered? <Link to='/register'>Create an Account</Link>
                </p>
            </div>
        </>
    );
};

export default LoginForm;
