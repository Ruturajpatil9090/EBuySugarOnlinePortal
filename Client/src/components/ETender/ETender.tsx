import React, { useState, useEffect } from 'react';
import MotionHoc from "../../Pages/MotionHoc";
import { Box, TextField, Button, MenuItem, Typography, Container, Grid, Snackbar, Alert, Checkbox, FormControlLabel } from '@mui/material';
import useTenderForm from '../../hooks/useETenderForm';
import { TenderSchema } from '../../validation/ETenderSchema';
import SystemHelpMaster from "../../Helper/HelpComponent/SystemMasterHelp";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TenderData {
    Base_Rate: number;
    Base_Rate_GST_Amount: number;
    Base_Rate_GST_Perc: number;
    Created_Date: string;
    Delivery_From: string;
    End_Date: string;
    End_Time: string;
    Grade: string;
    MillTenderId: number;
    Mill_Code: number;
    mill_name: string;
    mill_user_name: string;
    Quantity: number;
    Rate_Including_GST: number;
    Season: string;
    item_name: string;
    Item_Code: number;
    Packing: number;
    Tender_Type: string;
    Quantity_In: string;
}

const apiKey = process.env.REACT_APP_API_KEY;

const TenderComponent: React.FC<TenderData> = () => {
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useTenderForm();
    const [itemCode, setItemCode] = useState<number | null>(null);
    const [Item_Name, setItemName] = useState<string | null>(null);
    const [ic, setIc] = useState<number | null>(null);
    const [systemMinRate, setSystemMinRate] = useState<string | null>(null);
    const [systemMaxRate, setSyatemMaxRate] = useState<string | null>(null);
    const [companies, setCompanies] = useState<{ id: number, name: string, accoid: number, user_id: number; }[]>([]);
    const [millTenderId, setMillTenderId] = useState<number | null>(null);
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | undefined }>({
        open: false,
        message: '',
        severity: undefined
    });
    const [systemDataS, setSystemDataS] = useState<any[]>([]);
    const [systemDataZ, setSystemDataZ] = useState<any[]>([]);
    const [systemDataU, setSystemDataU] = useState<any[]>([]);

    const location = useLocation();
    const selectedtender: TenderData = location.state?.tender;

    const tenderType = watch('Tender_Type', 'T');

    const navigate = useNavigate()
    const UserId = sessionStorage.getItem("user_id")
    const isAdmin = sessionStorage.getItem("isAdmin");

    useEffect(() => {
        const fetchAllSystemData = async () => {
            try {
                const response = await axios.get(`${apiKey}/get_system_master`);
                if (response.data && response.data.length > 0) {
                    const systemDataS = response.data.filter((item: any) => item.System_Type === 'S');
                    const systemDataZ = response.data.filter((item: any) => item.System_Type === 'Z');
                    const systemDataU = response.data.filter((item: any) => item.System_Type === 'U');

                    setSystemDataS(systemDataS);
                    setSystemDataZ(systemDataZ);
                    setSystemDataU(systemDataU);
                } else {
                    console.warn("No system master data found");
                    setSystemDataS([]);
                    setSystemDataZ([]);
                    setSystemDataU([]);
                }
            } catch (error) {
                console.error("Error fetching system master data:", error);
                setSystemDataS([]);
                setSystemDataZ([]);
                setSystemDataU([]);
            }
        };

        axios
            .get(`${apiKey}/companieslist`)
            .then((response) => {
                const fetchedCompanies = response.data.map(
                    (company: { user_id: number; company_name: string; accoid: number; ac_code: number }) => ({
                        id: company.ac_code,
                        name: company.company_name,
                        accoid: company.accoid,
                        user_id: company.user_id,
                    })
                );
                setCompanies(fetchedCompanies);

                if (isAdmin === 'Y') {
                    setCompanies(fetchedCompanies);
                } else {
                    const userCompanies = fetchedCompanies.filter((company: any) => company.user_id.toString() === UserId);
                    setCompanies(userCompanies);
                }
            })
            .catch((error) => {
                console.error("Error fetching company data:", error);
            });

        fetchAllSystemData();

        if (selectedtender) {
            handleRecordsDoubleCliked(selectedtender.MillTenderId);
        } else {
            axios
                .get(`${apiKey}/get_max_mill_tender_id`)
                .then((response) => {
                    const maxTenderId = response.data.max_mill_tender_id;
                    setMillTenderId(maxTenderId ? maxTenderId + 1 : 1);
                })
                .catch((error) => {
                    console.error("Error fetching max mill tender ID:", error);
                    setMillTenderId(1);
                });
        }
    }, [selectedtender]);

    const handleRecordsDoubleCliked = async (MillTenderId: number) => {
        try {
            const response = await axios.get(`${apiKey}/getAlldatabyMillTenderId?MillTenderId=${MillTenderId}`);
            const data = response.data;

            // Set common values
            setValue('Base_Rate', data.Base_Rate);
            setValue('Base_Rate_GST_Amount', data.Base_Rate_GST_Amount);
            setValue('Base_Rate_GST_Perc', data.Base_Rate_GST_Perc);
            setValue('Delivery_From', data.Delivery_From);
            setValue('Start_Date', data.Start_Date);
            setValue('Start_Time', data.Start_Time);
            setValue('End_Date', data.End_Date);
            setValue('End_Time', data.End_Time);
            setValue('Grade', data.Grade);
            setValue('Quantity', data.Quantity);
            setValue('Rate_Including_GST', data.Rate_Including_GST);
            setValue('Season', data.Season);
            setValue('Packing', data.Packing);
            setValue('Tender_Type', data.Tender_Type);
            setValue('Mill_Code', data.Mill_Code);
            if (data.Tender_Type === 'T') {
                setValue('Base_Rate', data.Base_Rate);
                setValue('Base_Rate_GST_Amount', data.Base_Rate_GST_Amount);
                setValue('Base_Rate_GST_Perc', data.Base_Rate_GST_Perc);
            } else {
                setValue('Open_Base_Rate', data.Open_Base_Rate);
                setValue('Open_Base_Rate_GST_Amount', data.Open_Base_Rate_GST_Amount);
                setValue('Open_Base_Rate_GST_Perc', data.Open_Base_Rate_GST_Perc);
            }

            setItemCode(data.Item_Code);
            setItemName(data.item_name);
            setIc(data.ic);
        } catch (error) {
            console.error("Error fetching tender data:", error);
            setAlert({ open: true, message: 'Error fetching tender data.', severity: 'error' });
        }
    };


    useEffect(() => {
        const currentDate = new Date().toISOString().split('T')[0];
        setValue('Start_Date', currentDate);
        setValue('End_Date', currentDate);
        setValue('Last_Dateof_Payment', currentDate);
        setValue('Lifting_Date', currentDate);

    }, [setValue]);

    const calculateGST = () => {
        const baseRateString = watch('Base_Rate') || '0';
        const gstPercentageString = watch('Base_Rate_GST_Perc') || '0';

        const baseRate = parseFloat(baseRateString);
        const gstPercentage = parseFloat(gstPercentageString);

        if (!isNaN(baseRate) && !isNaN(gstPercentage)) {
            const gstAmount = (baseRate * gstPercentage) / 100;
            const rateIncludingGST = baseRate + gstAmount;

            setValue('Base_Rate_GST_Amount', gstAmount.toFixed(2));
            setValue('Rate_Including_GST', rateIncludingGST.toFixed(2));
        } else {
            setValue('Base_Rate_GST_Amount', '0.00');
            setValue('Rate_Including_GST', '0.00');
        }
    };

    const calculateGSTOpenBaserate = () => {
        const baseRateString = watch('Open_Base_Rate') || '0';
        const gstPercentageString = watch('Open_Base_Rate_GST_Perc') || '0';

        const baseRate = parseFloat(baseRateString);
        const gstPercentage = parseFloat(gstPercentageString);

        if (!isNaN(baseRate) && !isNaN(gstPercentage)) {
            const gstAmount = (baseRate * gstPercentage) / 100;
            const rateIncludingGST = baseRate + gstAmount;

            setValue('Open_Base_Rate_GST_Amount', gstAmount.toFixed(2));
            setValue('Open_Rate_Including_GST', rateIncludingGST.toFixed(2));
        } else {
            setValue('Open_Base_Rate_GST_Amount', '0.00');
            setValue('Open_Rate_Including_GST', '0.00');
        }
    };

    useEffect(() => {
        const subscription1 = watch((value, { name }) => {
            if (name === 'Base_Rate' || name === 'Base_Rate_GST_Perc') {
                calculateGST();
            }
            if (name === 'Open_Base_Rate' || name === 'Open_Base_Rate_GST_Perc') {
                calculateGSTOpenBaserate();
            }
        });

        return () => subscription1.unsubscribe();
    }, [watch]);


    const onSubmit = (data: TenderSchema) => {
        const selectedCompany = companies.find(company => company.id === data.Mill_Code);

        if (!selectedCompany) {
            setAlert({ open: true, message: "Selected company not found", severity: 'error' });
            return;
        }

        if (!itemCode || !ic) {
            setAlert({ open: true, message: "You must select a Product Category.", severity: 'error' });
            return;
        }

        const minRate = parseFloat(systemMinRate || "0");
        const maxRate = parseFloat(systemMaxRate || "0");
        const baseRate = parseFloat(data.Base_Rate || '0');
        const OpenBaseRate = parseFloat(data.Open_Base_Rate || '0');

        if (data.Tender_Type === 'T') {
            if (baseRate < minRate || baseRate > maxRate) {
                setAlert({ open: true, message: `Base Rate must be between ${minRate} and ${maxRate}.`, severity: 'error' });
                return;
            }
        } else {
            if (OpenBaseRate < minRate || OpenBaseRate > maxRate) {
                setAlert({ open: true, message: `Open Base Rate must be between ${minRate} and ${maxRate}.`, severity: 'error' });
                return;
            }
        }

        const tenderData = {
            ...data,
            Base_Rate: data.Base_Rate || '0',
            Rate_Including_GST: data.Rate_Including_GST || '0',
            Base_Rate_GST_Amount: data.Base_Rate_GST_Amount || '0',
            Open_Base_Rate: data.Open_Base_Rate || '0',
            Open_Rate_Including_GST: data.Open_Rate_Including_GST || '0',
            Open_Base_Rate_GST_Amount: data.Open_Base_Rate_GST_Amount || '0',
            Item_Code: itemCode,
            ic,
            mc: selectedCompany.accoid,
            MillUserId: selectedCompany.user_id,
            UserId,
            Tender_Closed: 'N',
            Open_tender_closed: 'N'
        };

        axios
            .post(`${apiKey}/create_mill_tender`, tenderData)
            .then(response => {
                setAlert({ open: true, message: 'ETender created successfully!', severity: 'success' });
                reset();
                setItemCode(null);
                setItemName(null);
                setIc(null)
                setTimeout(() => {
                    navigate('/publishedlist')
                }, 1000)
                navigate('/publishedlist')
            })
            .catch(error => {
                console.error('Error creating tender:', error);
                setAlert({ open: true, message: 'Error creating tender.', severity: 'error' });
            });
    };

    const handleSelctProduct = (code: number, name: string, ic: number, minRate: string, maxRate: string) => {
        setItemCode(code);
        setItemName(name);
        setIc(ic);
        setSystemMinRate(minRate);
        setSyatemMaxRate(maxRate)
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    const handleBackArrow = () => {
        navigate('/etenderutility')
    }

    const handleUpdateeTender = async () => {
        const tenderData = {
            ...watch(),
            Item_Code: itemCode,
            ic,
            UserId,
            Tender_Closed: 'N',
            Open_tender_closed: 'N'
        };

        try {
            const response = await axios.put(`${apiKey}/update_mill_tender?MillTenderId=${selectedtender.MillTenderId}`, tenderData);
            setAlert({ open: true, message: 'ETender updated successfully!', severity: 'success' });
            reset();
            setItemCode(null);
            setItemName(null);
            setIc(null);
            setTimeout(() => {
                navigate('/publishedlist');
            }, 1000);
        } catch (error) {
            console.error('Error updating tender:', error);
            setAlert({ open: true, message: 'Error updating tender.', severity: 'error' });
        }
    };

    const handleDeleteeTender = () => {
        if (selectedtender) {
            const confirmDelete = window.confirm("Are you sure you want to delete this tender?");
            if (confirmDelete) {
                axios.delete(`${apiKey}/delete_e_tender?MillTenderId=${selectedtender.MillTenderId}`)
                    .then(response => {
                        setAlert({ open: true, message: 'Tender deleted successfully!', severity: 'success' });
                        navigate('/etenderutility');
                    })
                    .catch(error => {
                        console.error('Error deleting tender:', error);
                        if (error.response && error.response.status === 403) {
                            setAlert({ open: true, message: 'Cannot delete this tender as bids are present.', severity: 'error' });
                        } else {
                            setAlert({ open: true, message: 'Error deleting tender.', severity: 'error' });
                        }
                    });
            }
        } else {
            setAlert({ open: true, message: 'No tender selected to delete.', severity: 'error' });
        }
    };

    return (
        <Container>
            <div>
                <div >
                    <Button variant="contained" onClick={handleBackArrow} style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: "#5349d6",
                        marginTop: "20px",

                    }}>
                        <ArrowBackIcon />
                    </Button>
                </div>

            </div>

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
                    marginTop: "5vh",

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
                                value={selectedtender ? selectedtender.MillTenderId : millTenderId}
                                disabled={true}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tender Type"
                                variant="outlined"
                                defaultValue={selectedtender ? selectedtender.Tender_Type : 'T'}
                                {...register('Tender_Type', { required: 'Tender Type is required' })}
                                error={!!errors.Tender_Type}
                                helperText={errors.Tender_Type ? errors.Tender_Type.message : ''}
                                disabled={selectedtender?.Tender_Type === 'O'}
                            >
                                <MenuItem value="T">Tender</MenuItem>
                                <MenuItem value="O">Open Tender</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Select Mill"
                                variant="outlined"
                                defaultValue={selectedtender ? selectedtender.Mill_Code : ''}
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
                                CategoryName={selectedtender ? selectedtender.item_name : ""}
                                CategoryCode={selectedtender ? selectedtender.Item_Code : 0}

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
                                select
                                label="Season"
                                variant="outlined"
                                defaultValue={selectedtender ? selectedtender.Season : '2024-25'}
                                {...register('Season')}
                                error={!!errors.Season}
                                helperText={errors.Season ? errors.Season.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            >
                                {systemDataZ.map((item, index) => (
                                    <MenuItem key={index} value={item.System_Name_E}>
                                        {item.System_Name_E}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>


                        <Grid item xs={12} sm={6} md={6}>
                            <TextField
                                fullWidth
                                label="Packing"
                                variant="outlined"
                                defaultValue="50"
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
                                select
                                label="Grade"
                                variant="outlined"
                                defaultValue={selectedtender ? selectedtender.Grade : 'SUGAR 30 KG'}
                                {...register('Grade')}
                                error={!!errors.Grade}
                                helperText={errors.Grade ? errors.Grade.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            >
                                {systemDataS.map((item, index) => (
                                    <MenuItem key={index} value={item.System_Name_E}>
                                        {item.System_Name_E}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>


                        <Grid item xs={12} sm={4} md={4}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                variant="outlined"
                                {...register('Quantity')}
                                error={!!errors.Quantity}
                                helperText={errors.Quantity ? errors.Quantity.message : ''}
                                autoComplete='off'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={2} md={2}>
                            <TextField
                                select
                                label="Quantity In"
                                variant="outlined"
                                defaultValue={selectedtender ? selectedtender.Quantity_In : 'Quintal'}
                                {...register('Quantity_In')}
                                error={!!errors.Quantity_In}
                                helperText={errors.Quantity_In ? errors.Quantity_In.message : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            >
                                {systemDataU.map((item, index) => (
                                    <MenuItem key={index} value={item.System_Name_E}>
                                        {item.System_Name_E}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {tenderType === 'T' && (
                            <>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Base Rate"
                                        variant="outlined"
                                        {...register('Base_Rate', { required: 'Base Rate is required' })}
                                        error={!!errors.Base_Rate}
                                        helperText={errors.Base_Rate ? errors.Base_Rate.message : ''}
                                        autoComplete='off'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="GST %"
                                        variant="outlined"
                                        defaultValue="5"
                                        {...register('Base_Rate_GST_Perc', { required: 'GST is required' })}
                                        error={!!errors.Base_Rate_GST_Perc}
                                        helperText={errors.Base_Rate_GST_Perc ? errors.Base_Rate_GST_Perc.message : ''}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Base Rate GST Amount"
                                        variant="outlined"
                                        value={watch('Base_Rate_GST_Amount') || '0.00'}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Including GST Rate"
                                        variant="outlined"
                                        {...register('Rate_Including_GST', { required: 'Including GST Rate is required' })}
                                        error={!!errors.Rate_Including_GST}
                                        helperText={errors.Rate_Including_GST ? errors.Rate_Including_GST.message : ''}
                                        autoComplete='off'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Open Tender Fields - Display only when Tender Type is 'O' */}
                        {tenderType === 'O' && (
                            <>
                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Open Base Rate"
                                        variant="outlined"
                                        {...register('Open_Base_Rate', { required: 'Open Base Rate is required' })}
                                        error={!!errors.Open_Base_Rate}
                                        helperText={errors.Open_Base_Rate ? errors.Open_Base_Rate.message : ''}
                                        autoComplete='off'
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Open GST %"
                                        variant="outlined"
                                        defaultValue="5"
                                        {...register('Open_Base_Rate_GST_Perc', { required: 'GST is required' })}
                                        error={!!errors.Open_Base_Rate_GST_Perc}
                                        helperText={errors.Open_Base_Rate_GST_Perc ? errors.Open_Base_Rate_GST_Perc.message : ''}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Open Base Rate GST Amount"
                                        variant="outlined"
                                        value={watch('Open_Base_Rate_GST_Amount') || '0.00'}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Open Rate Including GST Rate"
                                        variant="outlined"
                                        {...register('Open_Rate_Including_GST', { required: 'Open Rate Including GST Rate is required' })}
                                        error={!!errors.Open_Rate_Including_GST}
                                        helperText={errors.Open_Rate_Including_GST ? errors.Open_Rate_Including_GST.message : ''}
                                        autoComplete='off'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

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
                        {selectedtender ? (
                            <>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{ mr: 2, minWidth: '150px' }}
                                    onClick={handleUpdateeTender}
                                >
                                    Update
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{ mr: 2, minWidth: '150px' }}
                                    onClick={handleDeleteeTender}
                                >
                                    Delete
                                </Button>
                            </>
                        ) : (
                            <>
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

                            </>
                        )}

                    </Box>
                </form>
            </Box>
        </Container>
    );
};

const Tender = MotionHoc(TenderComponent);

export default Tender;
