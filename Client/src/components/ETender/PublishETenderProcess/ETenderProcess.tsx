import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import io from 'socket.io-client';
import styles from '../../../styles/PublishListCompoents.module.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const socketURL: string = process.env.REACT_APP_API_URL_SOCKET || 'http://localhost:8080';

interface Tender {
    MillTenderId: number;
    Mill_Code: number;
    Delivery_From: string;
    Sugar_Type: string;
    Quantity: number;
    Packing: number;
    Season: string;
    Lifting_Date: string;
    Last_Dateof_Payment: string;
    Rate_Including_GST: string;
    UserId: number | null;
    mill_user_name: string;
    item_name: string;
    Start_Date: string;
    Start_Time: string;
    End_Date: string;
    End_Time: string;
    MillUserId: string;
    Base_Rate: string;
    Base_Rate_GST_Perc: string;
    Base_Rate_GST_Amount: string;
    Tender_Type:string;
}

const apiKey = process.env.REACT_APP_API_KEY;

const ETenderProcess: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const navigate = useNavigate();

    const isAdmin = sessionStorage.getItem("isAdmin");
    const UserIdNew = sessionStorage.getItem("user_id");

    const fetchTenders = async () => {
        try {
            const response = await axios.get(`${apiKey}/get_all_mill_tenders`);
            const data: Tender[] = response.data;
            if (isAdmin === 'Y') {
                const OpenFiltereddata = response.data.filter((tender: any) => tender.Tender_Type === 'T');
                setTenders(OpenFiltereddata);
            } else {
                const filteredData = response.data.filter((tender: any) => tender.MillUserId === parseInt(UserIdNew || '0', 10) && tender.Tender_Type === 'T');
                setTenders(filteredData);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tenders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenders();
    }, []);

    useEffect(() => {
        const socket = io(socketURL);
        socket.on('connect', () => { });

        socket.on('EtenderData', () => {
            fetchTenders();
        });

        socket.on('MillTenderClosed', () => {
            fetchTenders();
        });

        socket.on('ETenderBidUpdated', () => {
            fetchTenders();
        });

        socket.on('mill_tender_updated', () => {
            fetchTenders();
        });

        socket.on('disconnect', () => { });

        return () => {
            socket.disconnect();
        };

    }, []);


    const handleViewTender = (tender: Tender) => {
        navigate('/tender-details', { state: { tender } });
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedTenders = tenders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    const handleBackArrow = () => {
        navigate('/dashboard')
      }

    return (
    <>
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
              marginLeft:"60px",
              marginTop:"20px",
              marginBottom:"-60px"
            }}>
              <ArrowBackIcon />
            </Button>
          </div>

        </div>
        <div className={styles.container}>
            <h1>eTender Process</h1>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mill Tender ID</TableCell>
                            <TableCell align="right">Mill Name</TableCell>
                            <TableCell align="right">Product</TableCell>
                            <TableCell align="right">Delivery From</TableCell>
                            <TableCell align="right">Payment Date</TableCell>
                            <TableCell align="right">Lifting Date</TableCell>
                            <TableCell align="right">Season</TableCell>
                            <TableCell align="right">Packing</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Including GST Rate</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenders.length === 0 ? (
                            <TableRow>
                                <h1 style={{ padding: '20px', justifyContent: 'center' }}>
                                    No Data Found!
                                </h1>
                            </TableRow>
                        ) : (
                            paginatedTenders.map((tender) => (
                                <TableRow key={tender.MillTenderId}>
                                    <TableCell component="th" scope="row">{tender.MillTenderId}</TableCell>
                                    <TableCell align="right">{tender.mill_user_name}</TableCell>
                                    <TableCell align="right">{tender.item_name}</TableCell>
                                    <TableCell align="right">{tender.Delivery_From}</TableCell>
                                    <TableCell align="right">{tender.Last_Dateof_Payment}</TableCell>
                                    <TableCell align="right">{tender.Lifting_Date}</TableCell>
                                    <TableCell align="right">{tender.Season}</TableCell>
                                    <TableCell align="right">{tender.Packing}</TableCell>
                                    <TableCell align="right">{tender.Quantity}</TableCell>
                                    <TableCell align="right">{tender.Rate_Including_GST}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            size="small"
                                            onClick={() => handleViewTender(tender)}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>

                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={tenders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
        </>
    );
};

export default ETenderProcess;
