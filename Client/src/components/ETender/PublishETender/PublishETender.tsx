// PublishedListETender.tsx
import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import styles from '../../../styles/PublishListCompoents.module.css';
import io from 'socket.io-client';
import axios from "axios";
import UserBidOpenPopup from './UserBidOpenPopup';
import AdminBidOpenPopup from "./AdminBidOpenPopup"
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import Button from '@mui/material/Button';

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
}

const apiKey = process.env.REACT_APP_API_KEY;

const PublishedListETender: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
    const [popupOpen, setPopupOpen] = useState<boolean>(false);
    const [adminPopupOpen, setAdminPopupOpen] = useState<boolean>(false);

    const isAdmin = sessionStorage.getItem("isAdmin")
    const UserIdNew = sessionStorage.getItem("user_id")
    const UserType = sessionStorage.getItem("user_type")

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

        socket.on('disconnect', () => { });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleBidClick = (tender: Tender) => {
        setSelectedTender(tender);
        setPopupOpen(true);
    };

    const handleAdminBidClick = (tender: Tender) => {
        setSelectedTender(tender);
        setAdminPopupOpen(true);
    };

    const handleDelete = (tender:Tender)=>{

    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                            <TableCell align="right">UserId</TableCell>
                            <TableCell align="right">Start Date</TableCell>
                            <TableCell align="right">Start Time</TableCell>
                            <TableCell align="right">End Date</TableCell>
                            <TableCell align="right">End Time</TableCell>
                            <TableCell align="right">Including GST Rate</TableCell>
                            <TableCell align="right">Action </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenders.map((tender) => (
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
                                <TableCell align="right">{tender.UserId}</TableCell>
                                <TableCell align="right">{tender.Start_Date}</TableCell>
                                <TableCell align="right">{tender.Start_Time}</TableCell>
                                <TableCell align="right">{tender.End_Date}</TableCell>
                                <TableCell align="right">{tender.End_Time}</TableCell>
                                <TableCell align="right">{tender.Rate_Including_GST}</TableCell>
                                <TableCell align="right">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {isAdmin == 'Y' && (
                                            <>

                                                <EditIcon
                                                    style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                                                    onClick={() => handleBidClick(tender)}
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
                                                    onClick={() => handleBidClick(tender)}
                                                >
                                                    Bid
                                                </Button>
                                            </>
                                        )}
                                        {isAdmin == 'N' && UserType == '2' && tender.MillUserId == UserIdNew && (
                                            <>
                                                <EditIcon
                                                    style={{ marginRight: '2px', color: 'blue', cursor: 'pointer', fontSize: '20px' }}
                                                    onClick={() => handleBidClick(tender)}
                                                />
                                                <DeleteIcon
                                                    style={{ marginRight: '4px', color: 'red', cursor: 'pointer', fontSize: '20px' }}
                                                    onClick={() => handleDelete(tender)}
                                                />
                                            </>
                                        )}
                                        {isAdmin == 'N' && tender.MillUserId != UserIdNew && (
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
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {selectedTender && (
                <UserBidOpenPopup
                    open={popupOpen}
                    onClose={() => setPopupOpen(false)}
                    tender={selectedTender}
                />
            )}
        </div>
    );
};

export default PublishedListETender;
