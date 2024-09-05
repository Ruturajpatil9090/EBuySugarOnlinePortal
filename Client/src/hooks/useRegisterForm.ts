// src/hooks/useRegisterForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '../validation/registerSchema';

const useRegisterForm = () => {
    return useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema)
    });
};

export default useRegisterForm;
