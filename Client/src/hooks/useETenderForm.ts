// src/hooks/useTenderForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenderSchema, TenderSchema } from '../validation/ETenderSchema';

const useTenderForm = () => {
    return useForm<TenderSchema>({
        resolver: zodResolver(tenderSchema),
    });
};

export default useTenderForm;
