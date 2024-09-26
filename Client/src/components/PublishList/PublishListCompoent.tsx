import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import TextField from '@mui/material/TextField';
import styles from '../../styles/PublishListCompoents.module.css';
import axios from 'axios';
import BuyPopup from '../../UI/BuyOpenPopup';
import ToastComponent, { showSuccessToast, showErrorToast } from '../../UI/ToastComponent';
import EditPopup from '../../UI/EditOpenPopupUser';
import io from 'socket.io-client';
import BuyOpenPopupAdmin from "../../UI/BuyOpenPopupAdmin";
import UserResaleForm from "../../UI/UserResaleForm";
import AdminResaleForm from "../../UI/AdminResaleForm";
import Testimonials from "../Testinomials/Testimonials"
import Footer from "../../Layout/Footer";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  ic: number;

}

const apiKey = process.env.REACT_APP_API_KEY;
const socketURL: string = process.env.REACT_APP_API_URL_SOCKET || 'http://localhost:8080';

const PublishedListComponent: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [isTradingStopped, setIsTradingStopped] = useState<{ [key: number]: boolean }>({});
  const [isTradingStoppedForAll, setIsTradingStoppedForAll] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpenAdmin, setIsPopupOpenAdmin] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const isAdmin = sessionStorage.getItem("isAdmin")
  const menuAddResell = sessionStorage.getItem('menu_add_resell');
  const [rateInput, setRateInput] = useState<string>('');
  const [isUserResaleFormOpen, setIsUserResaleFormOpen] = useState(false);
  const [isAdminResaleFormOpen, setIsAdminResaleFormOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    setCurrentUserId(userId);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiKey}/getAllPublishDataList`);
      setData(response.data);
      initializeStopStatus(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const socket = io(socketURL);
    socket.on('connect', () => {
    });

    socket.on('publishList', (newTender: RowData[]) => {
      setData((prevData) => [...prevData, ...newTender]);
      fetchData();
    });

    socket.on('deletePublishTender', (deletePublishTender: { publishid: number }) => {
      setData((prevData) => prevData.filter(tender => tender.publishid !== deletePublishTender.publishid));
    });

    socket.on('update_data', (update_data: RowData) => {
      setData((prevData) =>
        prevData.map(tender =>
          tender.publishid === update_data.publishid ? update_data : tender
        )

      );
      fetchData();
    });

    socket.on('update_display_rate', (updatedEntries: RowData[]) => {
      setData(updatedEntries);
      fetchData();
    });

    socket.on('newOrder', (newOrder) => {
      fetchData();
    });

    socket.on('disconnect', () => {
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const initializeStopStatus = (data: RowData[]) => {
    const initialStopStatus: { [key: number]: boolean } = {};
    data.forEach((row) => {
      initialStopStatus[row.publishid] = false;
    });
    setIsTradingStopped(initialStopStatus);
  };

  const handleTradingControl = (publishid: number) => {
    if (publishid === -1) {
      // Stop or resume all tenders
      const shouldStopAll = Object.values(isTradingStopped).some((stopped) => !stopped);
      const updatedStatus: { [key: number]: boolean } = {};
      Object.keys(isTradingStopped).forEach((key) => {
        updatedStatus[parseInt(key)] = shouldStopAll;
      });
      setIsTradingStopped(updatedStatus);
      setIsTradingStoppedForAll(shouldStopAll);
    } else {
      setIsTradingStopped((prev) => ({
        ...prev,
        [publishid]: !prev[publishid],
      }));
    }
  };

  const handleBuyClick = (row: RowData) => {
    if (isAdmin === 'Y') {
      handleAdminBuy(row);
    } else if (isAdmin === 'N') {
      handleUserBuy(row);
    }
  };

  const handleAdminBuy = (row: RowData) => {
    setSelectedRow(row);
    setIsPopupOpenAdmin(true);
  };

  const handleUserBuy = (row: RowData) => {
    setSelectedRow(row);
    setIsPopupOpen(true);
  };

  const handlePlaceOrder = (buyQty: number) => {
    console.log(`Placed order for ${buyQty} quantity`);
  };

  const handleDelete = async (publishid: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (confirmDelete) {
      try {
        await axios.delete(`${apiKey}/delete-publish-tender?publishid=${publishid}`);
        setData((prevData) => prevData.filter((row) => row.publishid !== publishid));
      } catch (error) {
        console.error('Error deleting publish tender:', error);
      }
    }
  };

  const handleEditClick = (row: RowData) => {
    setSelectedRow(row);
    setIsEditPopupOpen(true);
  };

  const handleUpdateRow = async (updatedRow: RowData) => {
    try {
      await axios.put(`${apiKey}/update-publish-tender?${updatedRow.publishid}`, updatedRow);
      setData((prevData) =>
        prevData.map((row) =>
          row.publishid === updatedRow.publishid ? updatedRow : row
        )
      );
    } catch (error) {
      console.error('Error updating publish tender:', error);

    }
  };

  const handleRateIncrease = async () => {
    if (!rateInput) {
      showErrorToast('Please enter a rate value.');
      return;
    }
    try {
      const response = await axios.put(`${apiKey}/update-display-rate?IncreaseRate=${rateInput}`);
      showSuccessToast(`rate increased by ${rateInput} successfully!`);
      fetchData();
      setRateInput("");
    } catch (error) {
      console.error('Error updating display rate:', error);
      showErrorToast('Failed to update display rate.');
    }
  };

  const handleMySaleOrder = () => {
    if (isAdmin === 'Y') {
      setIsAdminResaleFormOpen(true);
    } else if (isAdmin === 'N') {
      setIsUserResaleFormOpen(true);
    }
  };

  const handleBack = () => {
    navigate('/dashboard')
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <ToastComponent />
      {isAdmin === 'Y' && (
        <div>
          <div >
            <Button variant="contained" onClick={handleBack} style={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: "#5349d6",
              marginTop: "20px",
              marginLeft: "60px"
            }}>
              <ArrowBackIcon />
            </Button>
          </div>

        </div>
      )}
      <div className={styles.buttonsRow}>

        {isAdmin === 'Y' && (
          <div className={styles.rateContainer}>
            <h5>Rate:</h5>
            <TextField
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              size='small'
            />
            <Button style={{ marginLeft: '12px' }} variant="contained" color="info" onClick={handleRateIncrease}>
              Save
            </Button>
          </div>
        )}

        {isAdmin === 'Y' && (
          <div className={styles.buttonsContainer}>
            <Button variant="contained" color="warning" onClick={() => handleTradingControl(-1)}>
              {isTradingStoppedForAll ? 'Resume Trading' : 'Stop Trading'}
            </Button>
          </div>
        )}
        {menuAddResell === '1' && (
          <div className={styles.mySaleOrder}>
            <Button variant="contained" color="info" onClick={handleMySaleOrder}>
              My Sale Order
            </Button>
          </div>
        )}


      </div>

      <div className={styles.container}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Tender No</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Product</TableCell>
                <TableCell align="right">Mill Code</TableCell>
                <TableCell align="right">Mill Name</TableCell>
                <TableCell align="right">Grade</TableCell>
                <TableCell align="right">Season</TableCell>
                <TableCell align="right">DO Name</TableCell>

                <TableCell align="right">Lifting Date</TableCell>
                <TableCell align="right">Payment Date</TableCell>
                <TableCell align="right">Balance</TableCell>
                {isAdmin === 'N' && (
                  <TableCell align="right">Display Rate</TableCell>
                )}
                {isAdmin === 'Y' && (
                  <>
                    <TableCell align="right">Display QTY</TableCell>
                    <TableCell align="right">Sold Qty</TableCell>
                    <TableCell align="right">Item Code</TableCell>
                    <TableCell align="right">Mill Rate</TableCell>
                    <TableCell align="right">Purchase Rate</TableCell>
                    <TableCell align="right">Display Rate</TableCell>
                    {/* <TableCell align="right">End Date</TableCell> */}
                    <TableCell align="right">Actions</TableCell>
                    <TableCell align="right">Post Status</TableCell>
                    <TableCell align="right">Flag</TableCell>
                  </>
                )}
                <TableCell align="right"> Actions </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!isTradingStoppedForAll || isAdmin === 'Y') && paginatedData.map((row) => (
                <TableRow key={row.publishid}>
                  <TableCell component="th" scope="row">
                    {row.Tender_No}
                  </TableCell>
                  <TableCell align="right">{row.Date}</TableCell>
                  <TableCell align="right">{row.Item_Name}</TableCell>
                  <TableCell align="right">{row.Mill_Code}</TableCell>
                  <TableCell align="right">{row.Mill_Name}</TableCell>
                  <TableCell align="right">{row.Grade}</TableCell>
                  <TableCell align="right">{row.Season}</TableCell>
                  <TableCell align="right">{row.DO_Name}</TableCell>

                  <TableCell align="right">{row.Lifting_date}</TableCell>
                  <TableCell align="right">{row.Payment_Date}</TableCell>
                  <TableCell align="right">{row.balance}</TableCell>
                  {isAdmin === 'N' && (
                    <TableCell align="right">{row.Display_Rate}</TableCell>
                  )}
                  {isAdmin === 'Y' && (
                    <>
                      <TableCell align="right">{row.Display_Qty}</TableCell>
                      <TableCell align="right">{row.sold}</TableCell>
                      <TableCell align="right">{row.itemcode}</TableCell>
                      <TableCell align="right">{row.Mill_Rate}</TableCell>
                      <TableCell align="right">{row.Purchase_Rate}</TableCell>
                      <TableCell align="right">{row.Display_Rate}</TableCell>
                      {/* <TableCell align="right">{row.Display_End_Date}</TableCell> */}
                      <TableCell align="right">
                        <EditIcon
                          style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                          onClick={() => handleEditClick(row)}
                        />
                        <DeleteIcon
                          style={{ marginRight: '4px', color: 'red', cursor: 'pointer', fontSize: '20px' }}
                          onClick={() => handleDelete(row.publishid)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color={isTradingStopped[row.publishid] ? 'secondary' : 'success'}
                          size="small"
                          onClick={() => handleTradingControl(row.publishid)}
                          style={{ marginLeft: '-40px' }}
                        >
                          {isTradingStopped[row.publishid] ? 'Resume' : 'Stop'}
                        </Button>
                      </TableCell>
                      <TableCell align="right" style={{
                        fontWeight: 'bold',
                        color: 'blue',
                        fontSize: "18px"
                      }}>{row.Flag}</TableCell>
                    </>
                  )}
                  {(row.user_id != currentUserId) && (
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        style={{ marginLeft: '-40px' }}
                        onClick={() => handleBuyClick(row)}
                      >
                        Buy
                      </Button>
                    </TableCell>
                  )}

                  {(isAdmin === 'N' && row.user_id == currentUserId) && (
                    <TableCell align="right">
                      <EditIcon
                        style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                        onClick={() => handleEditClick(row)}
                      />
                      <DeleteIcon
                        style={{ marginRight: '4px', color: 'red', cursor: 'pointer', fontSize: '20px' }}
                        onClick={() => handleDelete(row.publishid)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

      </div>
      {isPopupOpen && selectedRow && (
        <BuyPopup
          open={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          millName={selectedRow.Mill_Name}
          grade={selectedRow.Grade}
          season={selectedRow.Season}
          itemName={selectedRow.Item_Name}
          liftingDate={selectedRow.Lifting_date}
          paymentDate={selectedRow.Payment_Date}
          publishid={selectedRow.publishid}
          tenderid={selectedRow.tenderid}
          Display_Rate={selectedRow.Display_Rate}
          Mill_Code={selectedRow.Mill_Code}
          mc={selectedRow.mc}
          Payment_ToAcCode={selectedRow.Payment_ToAcCode}
          Pt_Accoid={selectedRow.Pt_Accoid}
          itemcode={selectedRow.itemcode}
          ic={selectedRow.ic}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {isPopupOpenAdmin && selectedRow && (
        <BuyOpenPopupAdmin
          open={isPopupOpenAdmin}
          onClose={() => setIsPopupOpenAdmin(false)}
          millName={selectedRow.Mill_Name}
          grade={selectedRow.Grade}
          season={selectedRow.Season}
          itemName={selectedRow.Item_Name}
          liftingDate={selectedRow.Lifting_date}
          paymentDate={selectedRow.Payment_Date}
          publishid={selectedRow.publishid}
          tenderid={selectedRow.tenderid}
          Display_Rate={selectedRow.Display_Rate}
          Mill_Code={selectedRow.Mill_Code}
          mc={selectedRow.mc}
          Payment_ToAcCode={selectedRow.Payment_ToAcCode}
          Pt_Accoid={selectedRow.Pt_Accoid}
          itemcode={selectedRow.itemcode}
          ic={selectedRow.ic}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {isEditPopupOpen && selectedRow && (
        <EditPopup
          open={isEditPopupOpen}
          onClose={() => setIsEditPopupOpen(false)}
          rowData={selectedRow}
          onUpdate={handleUpdateRow}
        />
      )}
      {isUserResaleFormOpen && (
        <UserResaleForm
          isOpen={isUserResaleFormOpen}
          onClose={() => setIsUserResaleFormOpen(false)}
        />
      )}

      {isAdminResaleFormOpen && (
        <AdminResaleForm
          isOpen={isAdminResaleFormOpen}
          onClose={() => setIsAdminResaleFormOpen(false)}
        />
      )}
      <div>
        <Testimonials />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

export default PublishedListComponent;
