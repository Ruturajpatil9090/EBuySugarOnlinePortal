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
    mill_user_name:string;
    item_name:String;
}

const apiKey = process.env.REACT_APP_API_KEY;

const PublishedListETender: React.FC = () => {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTenders = async () => {
        try {
            const response = await fetch(`${apiKey}/get_all_mill_tenders`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data: Tender[] = await response.json();
            setTenders(data);
        } catch (err:any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTenders();
    }, []);

    

    useEffect(() => {
        const socket = io(socketURL);
        socket.on('connect', () => {
        });
    
    
        socket.on('mill_tenders_data', (newTenders: Tender[]) => {
            console.log('Received new tender data from socket', newTenders);
            fetchTenders();
        });

    
        socket.on('disconnect', () => {
        });
    
        return () => {
          socket.disconnect();
        };
      }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h1>Live eTenders</h1>
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
                            <TableCell align="right">Including GST Rate</TableCell>
                            <TableCell align="right">Action</TableCell>
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
                                <TableCell align="right">{tender.Rate_Including_GST}</TableCell>
                                <TableCell align="right">
                                    <button>Bid</button> {/* Replace with actual action */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default PublishedListETender;
