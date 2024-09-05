import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Box, Grid, Autocomplete, CircularProgress, IconButton } from '@mui/material';
import axios from 'axios';
import ToastComponent, { showSuccessToast, showErrorToast } from '../UI/ToastComponent';
import { HashLoader } from "react-spinners";
import { Alert } from 'react-bootstrap';
import CloseIcon from '@mui/icons-material/Close';
const apiKey = process.env.REACT_APP_API_KEY;

interface Client {
  id: number;
  name: string;
  ac_code: number | null;
  accoid: number;
}

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
  ic: number;
  Payment_ToAcCode: number;
  Pt_Accoid: number;
  itemcode: number;

  onPlaceOrder: (buyQty: number, publishid: number, tenderid: number) => void;
}

const BuyPopup: React.FC<BuyPopupProps> = ({
  open,
  onClose,
  millName,
  grade,
  season,
  itemName,
  liftingDate,
  paymentDate,
  publishid,
  tenderid,
  Display_Rate,
  Mill_Code,
  mc,
  Payment_ToAcCode,
  Pt_Accoid,
  itemcode,
  ic,
  onPlaceOrder
}) => {
  const [buyQty, setBuyQty] = useState<number>(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  useEffect(() => {
    setLoading(true);
    axios.get(`${apiKey}/companieslist`)
      .then(response => {
        const fetchedClients = response.data.map((client: any) => ({
          id: client.user_id,
          name: client.company_name,
          ac_code: client.ac_code,
          accoid: client.accoid
        }));
        setClients(fetchedClients);
      })
      .catch(error => {
        console.error('Error fetching client data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handlePlaceOrder = () => {
    setIsLoading(true);
    if (buyQty > 0 && buyQty % 5 === 0) {
      if (!selectedClient) {
        alert("Please select a client.");
        setIsLoading(false);
        return;
      }

      const orderData = {
        Order_Date: new Date().toISOString().split('T')[0],
        Buy_Qty: buyQty,
        Buy_Rate: Display_Rate,
        tenderid: tenderid,
        publishid: publishid,
        user_id: selectedClient.id,
        grade: grade,
        season: season,
        liftingDate: liftingDate,
        paymentDate: paymentDate,
        Display_Rate: Display_Rate,
        Mill_Code: Mill_Code,
        mc: mc,
        Payment_ToAcCode: Payment_ToAcCode,
        Pt_Accoid: Pt_Accoid,
        itemcode: itemcode,
        ic: ic,
        ac_code: selectedClient.ac_code,
        accoid: selectedClient.accoid,

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
          setIsLoading(false);
          console.error('Error placing order:', error);
          setAlertMessage('Failed to place order. Please try again later.');
          alert('Failed to place order. Please try again later.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      alert("Please enter a valid quantity (multiple of 5).");
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastComponent />
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        {/* <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 10 }}
        >
          <CloseIcon />
        </IconButton> */}
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#962422', textAlign: 'center' }}>Place Order</DialogTitle>
        {alertMessage && (
          <Alert variant={alertVariant}>
            {alertMessage}
          </Alert>
        )}
        <DialogContent>
          <Box component="div" sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Mill Name:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{millName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1"><strong>Grade:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{grade}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1"><strong>Season:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{season}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1"><strong>Item Name:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{itemName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1"><strong>Lifting Date:</strong></Typography>
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
                <Typography variant="body1">{liftingDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Payment Date:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{paymentDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1"><strong>Purchase Rate:</strong></Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">{Display_Rate}</Typography>
              </Grid>
            </Grid>
          </Box>
          <Autocomplete
            id="client-autocomplete"
            options={clients}
            getOptionLabel={(option) => `${option.id} - ${option.name}`}
            value={selectedClient}
            onChange={(event, newValue) => setSelectedClient(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Client"
                variant="outlined"
                margin="normal"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={24} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
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
        <DialogActions>
          <Button onClick={onClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handlePlaceOrder} color="primary" variant="contained">
            Place Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyPopup;
