import React, { useEffect, useState } from 'react';
import { Modal, Button, TextField, Box, IconButton, Snackbar, Alert } from '@mui/material';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import styles from '../../../styles/ETenderBid.module.css';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
};

const apiKey = process.env.REACT_APP_API_KEY;

interface Tender {
    MillTenderId: number;
    mill_user_name: string;
    item_name: string;
    Delivery_From: string;
    Last_Dateof_Payment: string;
    Lifting_Date: string;
    Season: string;
    Packing: number;
    Quantity: number;
    UserId: number | null;
    Start_Date: string;
    Start_Time: string;
    End_Date: string;
    End_Time: string;
    Rate_Including_GST: string;
    MillUserId: string;
    Open_Base_Rate: string;
    Open_Base_Rate_GST_Perc: string;
    Open_Base_Rate_GST_Amount: string;
    Tender_Type:string;
    Open_Rate_Including_GST:number;
}

interface BidPopupProps {
    open: boolean;
    onClose: () => void;
    tender: Tender;
}

const OpenUserBidOpenPopup: React.FC<BidPopupProps> = ({ open, onClose, tender }) => {
    const [buyQty, setBuyQty] = useState<number | ''>('');
    const [rate, setRate] = useState<number | ''>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const UserId = sessionStorage.getItem("user_id");

    // Reset state when the modal opens
    useEffect(() => {
        if (open) {
            setBuyQty('');
            setRate('');
        }
    }, [open]);

    const handleBuyQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBuyQty(value === '' ? '' : Number(value));
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRate(value === '' ? '' : Number(value));
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async () => {

        if (buyQty === '' || buyQty <= 0) {
            setSnackbarMessage('Please enter a valid Buy Quantity.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const minRate = tender.Open_Rate_Including_GST;
        if (rate === '' || rate < minRate) {
            setSnackbarMessage(`Please Enter the valid Rate`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return; 
        }

        const bidData = {
            MillTenderId: tender.MillTenderId,
            MillUserId: tender.MillUserId,
            UserId: UserId,
            BidQuantity: buyQty,
            BidRate: rate,
            Issued_Qty: 0,
            Issued_Rate: 0,
            Tender_Type: 'O'
        };

        try {
            const response = await axios.post(`${apiKey}/create_e_tender_bid`, bidData);
            setSnackbarMessage('Bid submitted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // Close the popup after a short delay
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            setSnackbarMessage('Error submitting bid: ' + (error.response?.data?.error || error.message));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            console.error('Error submitting bid:', error);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" style={{ textAlign: 'center' }}>START BIDDING</Typography>
                <IconButton onClick={onClose} aria-label="close" style={{ marginLeft: "400px", marginTop: '-60px' }}>
                    <CloseIcon />
                </IconButton>
                <div className={styles.tenderInfo}>
                    <div className={styles.tenderItem}>
                        <strong>Mill Name:</strong> <span>{tender.mill_user_name}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Product:</strong> <span>{tender.item_name}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Delivery From:</strong> <span>{tender.Delivery_From}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Last Payment Date:</strong> <span>{tender.Last_Dateof_Payment}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Lifting Date:</strong> <span>{tender.Lifting_Date}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Season:</strong> <span>{tender.Season}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Packing:</strong> <span>{tender.Packing}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Quantity:</strong> <span>{tender.Quantity}</span>
                    </div>
                    <div className={styles.tenderItem}>
                        <strong>Including GST Rate:</strong> <span>{tender.Rate_Including_GST}</span>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <TextField
                        label="Buy Qty"
                        type="number"
                        value={buyQty}
                        onChange={handleBuyQtyChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Rate"
                        type="number"
                        value={rate}
                        onChange={handleRateChange}
                        fullWidth
                        margin="normal"
                    />
                </div>
                <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
                    Submit
                </Button>
                <Button variant="outlined" onClick={onClose} style={{ marginTop: '20px' }}>
                    Close
                </Button>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Modal>
    );
};

export default OpenUserBidOpenPopup;
