import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, Typography, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface RowData {
  Tender_No: number;
  Date: string;
  Mill_Name: string;
  Grade: string;
  Season: number;
  DO_Name: string;
  Item_Name: string;
  Lifting_date: string;
  Payment_Date: string;
  Mill_Rate: number;
  Purchase_Rate: number;
  Display_Qty: number;
  Sold_Qty: number;
  Display_Rate: string;
  Flag: string;
  publishid: number;
  tenderid: number;
  itemcode: number;
  Mill_Code: number;
  user_id: string;
  balance: number;
  sold: number;
  mc: number;
  Payment_ToAcCode: number;
  Pt_Accoid: number;
  ic: number;
  Start_Date: string;
  Start_Time: string;
  End_Date: string;
  End_Time: string;
}

interface EditPopupProps {
  open: boolean;
  onClose: () => void;
  rowData: RowData;
  onUpdate: (updatedRow: RowData) => void;
}

const EditPopup: React.FC<EditPopupProps> = ({ open, onClose, rowData, onUpdate }) => {
  const [displayRate, setDisplayRate] = useState(rowData.Display_Rate);
  const [paymentDate, setPaymentDate] = useState(rowData.Payment_Date);
  const [soldQty, setSoldQty] = useState(rowData.Sold_Qty);
  const [displayQty, setDisplayQty] = useState(rowData.Display_Qty);
  const [startDate, setStartDate] = useState(rowData.Start_Date);
  const [startTime, setStartTime] = useState(rowData.Start_Time);
  const [endDate, setEndDate] = useState(rowData.End_Date);
  const [endTime, setEndTime] = useState(rowData.End_Time);

  useEffect(() => {
    setDisplayRate(rowData.Display_Rate);
    setPaymentDate(rowData.Payment_Date);
    setDisplayQty(rowData.Display_Qty);

  }, [rowData]);

  const handleUpdate = () => {

    const updatedRow = {
      ...rowData,
      Display_Rate: displayRate,
      Payment_Date: paymentDate,
      Display_Qty: displayQty,
      Start_Date: startDate,
      Start_Time: startTime,
      End_Date: endDate,
      End_Time: endTime,

    };
    onUpdate(updatedRow);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: -180 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Tender Update
        </Typography>
        <Typography gutterBottom>Tender No: {rowData.Tender_No}</Typography>
        <Typography gutterBottom>Mill Name: {rowData.Mill_Name}</Typography>
        <Typography gutterBottom>Grade: {rowData.Grade}</Typography>
        <Typography gutterBottom>Season: {rowData.Season}</Typography>
        <Typography gutterBottom>Item Name: {rowData.Item_Name}</Typography>
        <Typography gutterBottom>Lifting Date: {rowData.Lifting_date}</Typography>
        <TextField
          label="Payment Date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Display Rate"
              value={displayRate}
              onChange={(e) => setDisplayRate(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Display Qty"
              type="number"
              value={displayQty}
              onChange={(e) => setDisplayQty(parseInt(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleCancel} style={{ marginRight: '4px' }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdate}>
            Update
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditPopup;
