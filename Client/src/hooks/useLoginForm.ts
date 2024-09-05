// src/hooks/useLoginForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchema } from '../validation/loginSchema';

const useLoginForm = () => {
    return useForm<LoginSchema>({
        resolver: zodResolver(loginSchema)
    });
};

export default useLoginForm;
