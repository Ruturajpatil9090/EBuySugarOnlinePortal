import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, Typography, IconButton } from '@mui/material';
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
  // Display_End_Date: string;
  user_id: string;
  balance: number;
  sold: number;
  mc: number;
  Payment_ToAcCode: number;
  Pt_Accoid: number;
  ic: number
}

interface EditPopupProps {
  open: boolean;
  onClose: () => void;
  rowData: RowData;
  onUpdate: (updatedRow: RowData) => void;
}

const EditPopup: React.FC<EditPopupProps> = ({ open, onClose, rowData, onUpdate }) => {
  const isAdmin = sessionStorage.getItem("isAdmin") === "Y";

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [displayRate, setDisplayRate] = useState(rowData.Display_Rate);
  const [paymentDate, setPaymentDate] = useState(rowData.Payment_Date);
  const [soldQty, setSoldQty] = useState(rowData.Sold_Qty);
  const [displayQty, setDisplayQty] = useState(rowData.Display_Qty);
  // const [displayEndDate, setDisplayEndDate] = useState(
  //   rowData.Display_End_Date ? rowData.Display_End_Date.replace(' ', 'T') : getCurrentDateTime()
  // );

  useEffect(() => {
    setDisplayRate(rowData.Display_Rate);
    setPaymentDate(rowData.Payment_Date);
    setDisplayQty(rowData.Display_Qty);
    // setDisplayEndDate(rowData.Display_End_Date ? rowData.Display_End_Date.replace(' ', 'T') : getCurrentDateTime());
  }, [rowData]);

  const handleUpdate = () => {
    //const formattedDisplayEndDate = displayEndDate ? displayEndDate.replace('T', ' ') : getCurrentDateTime();
    const updatedRow = {
      ...rowData,
      Display_Rate: displayRate,
      Payment_Date: paymentDate,
      Display_Qty: displayQty,
      //Display_End_Date: isAdmin ? formattedDisplayEndDate : rowData.Display_End_Date, // Only update if admin
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
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: -50 }}
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
        <TextField
          label="Display Rate"
          value={displayRate}
          onChange={(e) => setDisplayRate(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Display Qty"
          type="number"
          value={displayQty}
          onChange={(e) => setDisplayQty(parseInt(e.target.value))}
          fullWidth
          margin="normal"
        />
        {/* {isAdmin && (
          <TextField
            label="Display End Date"
            type="datetime-local"
            value={displayEndDate}
            onChange={(e) => setDisplayEndDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        )} */}
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
