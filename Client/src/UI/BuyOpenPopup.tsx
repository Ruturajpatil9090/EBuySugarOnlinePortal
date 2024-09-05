import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Box, Grid, CircularProgress, IconButton } from '@mui/material';
import axios from 'axios';
import { Alert } from 'react-bootstrap';
import { HashLoader } from "react-spinners";
import CloseIcon from '@mui/icons-material/Close';

const apiKey = process.env.REACT_APP_API_KEY;
const user_id = sessionStorage.getItem('user_id');
const accoid = sessionStorage.getItem('accoid');
const ac_code = sessionStorage.getItem('ac_code');

interface BuyPopupProps {
  open: boolean;
  onClose: () => void;
  millName: string;
  grade: string;
  season: number;
  itemName: string;
  liftingDate: string;
  paymentDate: string;
  publishid: number;
  tenderid: number;
  Display_Rate: string;
  Mill_Code: number;
  mc: number;
  Payment_ToAcCode: number;
  Pt_Accoid: number;
  itemcode: number;
  ic: number
  onPlaceOrder: (buyQty: number, publishid: number, tenderid: number) => void;
}

const BuyPopup: React.FC<BuyPopupProps> = ({ open, onClose, millName, grade, season, itemName, liftingDate, paymentDate, publishid, tenderid, Display_Rate, Mill_Code, mc, Payment_ToAcCode, Pt_Accoid, itemcode, ic, onPlaceOrder }) => {
  const [buyQty, setBuyQty] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceOrder = () => {
    if (buyQty > 0 && buyQty % 5 === 0) {
      setLoading(true);
      setIsLoading(true)

      const orderData = {
        Order_Date: new Date().toISOString().split('T')[0],
        Buy_Qty: buyQty,
        Buy_Rate: Display_Rate,
        tenderid: tenderid,
        publishid: publishid,
        user_id: user_id,
        Mill_Code: Mill_Code,
        grade: grade,
        season: season,
        Display_Rate: Display_Rate,
        liftingDate: liftingDate,
        paymentDate: paymentDate,
        mc: mc,
        Payment_ToAcCode: Payment_ToAcCode,
        Pt_Accoid: Pt_Accoid,
        itemcode: itemcode,
        accoid: accoid,
        ac_code: ac_code,
        ic: ic
      };

      axios.post(`${apiKey}/placeOrder`, orderData)
        .then(response => {

          onPlaceOrder(buyQty, publishid, tenderid);
          setAlertMessage('Order placed successfully!');
          setTimeout(() => {
            onClose();
            setAlertMessage(null);
          }, 2000);

        })
        .catch(error => {
          setLoading(false);
          console.error('Error placing order:', error);
          setAlertMessage('Failed to place order. Please try again later.');
          setAlertVariant('danger');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      alert("Please enter a valid quantity Multiple of 5");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 10, right: -40 }}
        >
          <CloseIcon />
        </IconButton> */}
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#962422', textAlign: 'center' }}>
          Place Order
        </DialogTitle>

        {alertMessage && (
          <Alert variant={alertVariant}>
            {alertMessage}
          </Alert>
        )}
        <DialogContent>
          <Box component="div" sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Mill Name:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{millName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Grade:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{grade}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Season:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{season}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Item Name:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{itemName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Lifting Date:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{liftingDate}</Typography>
              </Grid>
              {isLoading && (
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1300,
                  }}
                >
                  <HashLoader color="#007bff" loading={isLoading} size={80} />
                </Box>
              )}

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Payment Date:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{paymentDate}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#555' }}>Display Rate:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: '#000' }}>{Display_Rate}</Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            label="Buy Qty"
            type="number"
            value={buyQty}
            onChange={(e) => setBuyQty(parseInt(e.target.value))}
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions >
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handlePlaceOrder} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Place Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyPopup;
