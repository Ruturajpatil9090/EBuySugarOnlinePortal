import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Function to show a success toast
export const showSuccessToast = (message: string) => {
    toast.success(message);
};

// Function to show an error toast
export const showErrorToast = (message: string) => {
    toast.error(message);
};

const ToastComponent: React.FC = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
};

export default ToastComponent;
