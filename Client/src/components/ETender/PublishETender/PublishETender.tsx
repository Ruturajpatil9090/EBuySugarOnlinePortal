import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import styles from '../../../styles/PublishListCompoents.module.css';
import io from 'socket.io-client';
import axios from "axios";
import UserBidOpenPopup from './UserBidOpenPopup';
import AdminBidOpenPopup from './AdminBidOpenPopup';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import Button from '@mui/material/Button';
import EditTenderPopup from './EditETenderPopUp';

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
}

const apiKey = process.env.REACT_APP_API_KEY;

const PublishedListETender: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [popupOpen, setPopupOpen] = useState<boolean>(false);
    const [adminBidPopupOpen, setAdminBidPopupOpen] = useState<boolean>(false);
    const [editPopupOpen, setEditPopupOpen] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const isAdmin = sessionStorage.getItem("isAdmin");
    const UserIdNew = sessionStorage.getItem("user_id");
    const UserType = sessionStorage.getItem("user_type");

    const fetchTenders = async () => {
        try {
            const response = await axios.get(`${apiKey}/get_all_mill_tenders`);
            const data: Tender[] = response.data;
            setTenders(data);
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

        socket.on('disconnect', () => { });

        return () => {
            socket.disconnect();
        };

    }, []);

    const handleBidClick = (tender: Tender) => {
        setSelectedTender(tender);
        setPopupOpen(true);
    };

    const handleAdminBidTender = (tender: Tender) => {
        setSelectedTender(tender);
        setAdminBidPopupOpen(true);
    };

    const handleDelete = async (tender: Tender) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
        if (confirmDelete) {
            try {
                await axios.delete(`${apiKey}/delete_mill_tender?MillTenderId=${tender.MillTenderId}`);
                setTenders((prevTenders) => prevTenders.filter((item) => item.MillTenderId !== tender.MillTenderId));
            } catch (error) {
                console.error('Error deleting tender:', error);
            }
        }
    };

    const handleEditETender = (tender: Tender) => {
        setSelectedTender(tender);
        setEditPopupOpen(true);
    };

    const handleTenderUpdated = (updatedTender: Tender) => {
        setTenders((prevTenders) =>
            prevTenders.map((tender) => (tender.MillTenderId === updatedTender.MillTenderId ? updatedTender : tender))
        );
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Function to filter tenders based on the current date and time, with additional conditions for admin and specific users
    const filterTendersByDateTime = (tenders: Tender[]) => {
        const currentDateTime = new Date();
        const filteredTenders = tenders.filter(tender => {
            const startDateTime = new Date(`${tender.Start_Date}T${tender.Start_Time}`);
            const endDateTime = new Date(`${tender.End_Date}T${tender.End_Time}`);
            if (currentDateTime > endDateTime) {
                return false;
            }
            if (isAdmin === 'Y') {
                return true;
            }
            if (tender.MillUserId == UserIdNew) {
                return true;
            }

            return currentDateTime >= startDateTime && currentDateTime <= endDateTime;
        });

        return filteredTenders;
    };

    const filteredTenders = filterTendersByDateTime(tenders);
    const paginatedTenders = filteredTenders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className={styles.container}>
            <h1>Live & Upcoming eTenders</h1>
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
                            {/* <TableCell align="right">UserId</TableCell> */}
                            <TableCell align="right">Start Date</TableCell>
                            <TableCell align="right">Start Time</TableCell>
                            <TableCell align="right">End Date</TableCell>
                            <TableCell align="right">End Time</TableCell>
                            <TableCell align="right">Including GST Rate</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTenders.length === 0 ? (
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
                                    <TableCell align="right">{tender.Start_Date}</TableCell>
                                    <TableCell align="right">{tender.Start_Time}</TableCell>
                                    <TableCell align="right">{tender.End_Date}</TableCell>
                                    <TableCell align="right">{tender.End_Time}</TableCell>
                                    <TableCell align="right">{tender.Rate_Including_GST}</TableCell>
                                    <TableCell align="right">
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {isAdmin === 'Y' && (
                                                <>
                                                    <EditIcon
                                                        style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                                                        onClick={() => handleEditETender(tender)}
                                                    />
                                                    <DeleteIcon
                                                        style={{ marginRight: '4px', color: 'red', cursor: 'pointer', fontSize: '20px' }}
                                                        onClick={() => handleDelete(tender)}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        style={{ marginLeft: '5px' }}
                                                        onClick={() => handleAdminBidTender(tender)}
                                                    >
                                                        Bid
                                                    </Button>
                                                </>
                                            )}
                                            {isAdmin === 'N' && UserType === '2' && tender.MillUserId == UserIdNew && (
                                                <>
                                                    <EditIcon
                                                        style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                                                        onClick={() => handleEditETender(tender)}
                                                    />
                                                    <DeleteIcon
                                                        style={{ marginRight: '4px', color: 'red', cursor: 'pointer', fontSize: '20px' }}
                                                        onClick={() => handleDelete(tender)}
                                                    />
                                                </>
                                            )}
                                            {isAdmin === 'N' && tender.MillUserId != UserIdNew && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleBidClick(tender)}
                                                >
                                                    Bid
                                                </Button>
                                            )}
                                        </div>
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
            {selectedTender && (
                <UserBidOpenPopup
                    open={popupOpen}
                    onClose={() => setPopupOpen(false)}
                    tender={selectedTender}
                />
            )}
            {selectedTender && (
                <EditTenderPopup
                    open={editPopupOpen}
                    onClose={() => setEditPopupOpen(false)}
                    tender={selectedTender!}
                    onTenderUpdated={handleTenderUpdated}
                />
            )}
            {selectedTender && (
                <AdminBidOpenPopup
                    open={adminBidPopupOpen}
                    onClose={() => setAdminBidPopupOpen(false)}
                    tender={selectedTender}
                />
            )}
        </div>
    );
};

export default PublishedListETender;
