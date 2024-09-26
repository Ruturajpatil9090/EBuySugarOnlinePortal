import React, { useState, useEffect } from 'react';
import MotionHoc from "../../Pages/MotionHoc";
import { Box, TextField, Button, MenuItem, Typography, Container, Grid, Snackbar, Alert, InputLabel, Checkbox, FormControlLabel } from '@mui/material';
import useTenderForm from '../../hooks/useETenderForm';
import { TenderSchema } from '../../validation/ETenderSchema';
import SystemHelpMaster from "../../Helper/HelpComponent/SystemMasterHelp";
import axios from 'axios';

interface TenderProps { }

const apiKey = process.env.REACT_APP_API_KEY;

const TenderComponent: React.FC<TenderProps> = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useTenderForm();
    const [itemCode, setItemCode] = useState<number | null>(null);
    const [Item_Name, setItemName] = useState<string | null>(null);
    const [ic, setIc] = useState<number | null>(null);
    const [companies, setCompanies] = useState<{ id: number, name: string, accoid: number }[]>([]);
    const [millTenderId, setMillTenderId] = useState<number | null>(null);
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | undefined }>({
        open: false,
        message: '',
        severity: undefined
    });



    useEffect(() => {
        axios
            .get(`${apiKey}/companieslist`)
            .then((response) => {
                const fetchedCompanies = response.data.map(
                    (company: { user_id: number; company_name: string; accoid: number; ac_code: number }) => ({
                        id: company.ac_code,
                        name: company.company_name,
                        accoid: company.accoid
                    })
                );
                setCompanies(fetchedCompanies);
            })
            .catch((error) => {
                console.error("Error fetching company data:", error);
            });

        // Fetch max mill tender ID
        axios.get(`${apiKey}/get_max_mill_tender_id`)
            .then((response) => {
                setMillTenderId(response.data.max_mill_tender_id + 1);
            })
            .catch((error) => {
                console.error("Error fetching max mill tender ID:", error);
            });

    }, []);

    const onSubmit = (data: TenderSchema) => {
        const selectedCompany = companies.find(company => company.id === data.Mill_Code);

        if (!selectedCompany) {
            setAlert({ open: true, message: "Selected company not found", severity: 'error' });
            return;
        }

        const tenderData = {
            ...data,
            Item_Code: itemCode,
            ic,
            mc: selectedCompany.accoid
        };

        axios
            .post(`${apiKey}/create_mill_tender`, tenderData)
            .then(response => {
                console.log('Tender created successfully:', response.data);
                setAlert({ open: true, message: 'ETender created successfully!', severity: 'success' });
                reset();
                setItemCode(null);
                setItemName(null);
                setIc(null)

                setTimeout(() => {
                    window.location.reload();
                }, 2000)
            })
            .catch(error => {
                console.error('Error creating tender:', error);
                setAlert({ open: true, message: 'Error creating tender.', severity: 'error' });
            });
    };

    const handleSelctProduct = (code: number, name: string, ic: number) => {
        setItemCode(code);
        setItemName(name);
        setIc(ic);
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };


    return (
        <Container>
            <Snackbar
                open={alert.open}
                autoHideDuration={2000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '400px', fontSize: '1.2rem' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3,
                    marginTop: "5vh"
                }}
            >
                <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    Add Live Tender
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="MillTenderId"
                                variant="outlined"
                                value={millTenderId || ''}
                                disabled={true}
                            />
                        </Grid>

                        <Grid item xs={12} sm={8} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Select Mill"
                                variant="outlined"
                                {...register('Mill_Code')}
                                error={!!errors.Mill_Code}
                                helperText={errors.Mill_Code ? errors.Mill_Code.message : ''}
                            >
                                {companies.map(company => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>
                            <SystemHelpMaster
                                onAcCodeClick={handleSelctProduct}
                                name="system-help-master"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Delivery From"
                                variant="outlined"
                                defaultValue="ExMill"
                                {...register('Delivery_From')}
                                error={!!errors.Delivery_From}
                                helperText={errors.Delivery_From ? errors.Delivery_From.message : ''}
                            >
                                <MenuItem value="ExMill">Ex Mill</MenuItem>
                                <MenuItem value="ExWarehouse">Ex Warehouse</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('Start_Date')}
                                error={!!errors.Start_Date}
                                helperText={errors.Start_Date ? errors.Start_Date.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('Start_Time')}
                                error={!!errors.Start_Time}
                                helperText={errors.Start_Time ? errors.Start_Time.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('End_Date')}
                                error={!!errors.End_Date}
                                helperText={errors.End_Date ? errors.End_Date.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('End_Time')}
                                error={!!errors.End_Time}
                                helperText={errors.End_Time ? errors.End_Time.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Last Date of Payment"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('Last_Dateof_Payment')}
                                error={!!errors.Last_Dateof_Payment}
                                helperText={errors.Last_Dateof_Payment ? errors.Last_Dateof_Payment.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Lifting Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                {...register('Lifting_Date')}
                                error={!!errors.Lifting_Date}
                                helperText={errors.Lifting_Date ? errors.Lifting_Date.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Season"
                                variant="outlined"
                                {...register('Season')}
                                error={!!errors.Season}
                                helperText={errors.Season ? errors.Season.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Packing"
                                variant="outlined"
                                {...register('Packing')}
                                error={!!errors.Packing}
                                helperText={errors.Packing ? errors.Packing.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Sugar Type"
                                defaultValue="Domestic"
                                variant="outlined"
                                {...register('Sugar_Type')}
                              
                                error={!!errors.Sugar_Type}
                                helperText={errors.Sugar_Type ? errors.Sugar_Type.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Grade"
                                variant="outlined"
                                {...register('Grade')}
                                error={!!errors.Grade}
                                helperText={errors.Grade ? errors.Grade.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Quantity in Quintal"
                                variant="outlined"
                                {...register('Quantity')}
                                error={!!errors.Quantity}
                                helperText={errors.Quantity ? errors.Quantity.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Base Rate"
                                variant="outlined"
                                {...register('Base_Rate')}
                                error={!!errors.Base_Rate}
                                helperText={errors.Base_Rate ? errors.Base_Rate.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="GST 5%"
                                variant="outlined"
                                {...register('Base_Rate_GST_Perc')}
                                error={!!errors.Base_Rate_GST_Perc}
                                helperText={errors.Base_Rate_GST_Perc ? errors.Base_Rate_GST_Perc.message : ''}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Base_Rate_GST_Amount"
                                variant="outlined"

                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Including GST Rate"
                                variant="outlined"
                                {...register('Rate_Including_GST')}
                                error={!!errors.Rate_Including_GST}
                                helperText={errors.Rate_Including_GST ? errors.Rate_Including_GST.message : ''}
                            />
                        </Grid>
                    </Grid>


                    <Box display="flex" flexDirection="column" alignItems="flex-start" mt={4}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Rs 100/Qntl deposit with 24 Hrs."
                        />
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Rs 200/Qntl deposit within 24 Hrs."
                        />
                        <FormControlLabel
                            control={<Checkbox />}
                            label="If MSP or government taxes increase it's applicable on buyer."
                        />
                    </Box>

                    <Box display="flex" justifyContent="center" mt={4}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ mr: 2, minWidth: '150px' }}
                        >
                            Submit
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="large"
                            sx={{ minWidth: '150px' }}
                            onClick={() => {
                                reset();
                                setItemCode(null);
                                setItemName("");
                                setIc(null);

                            }}
                        >
                            Reset
                        </Button>
                    </Box>
                </form>
            </Box>


        </Container>
    );
};

const Tender = MotionHoc(TenderComponent);

export default Tender;
