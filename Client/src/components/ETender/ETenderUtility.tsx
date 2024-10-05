import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface TenderData {
    Base_Rate: number;
    Base_Rate_GST_Amount: number;
    Base_Rate_GST_Perc: number;
    Created_Date: string;
    Delivery_From: string;
    End_Date: string;
    End_Time: string;
    Grade: string;
    MillTenderId: number;
    Mill_Code: number;
    mill_name: string;
    mill_user_name: string;
    Quantity: number;
    Rate_Including_GST: number;
    Season: string;
    item_name: string;
    Item_Code: number;
    Packing: number;
}

const apiKey = process.env.REACT_APP_API_KEY;

const ETenderUtility = () => {
    const [tenders, setTenders] = useState<TenderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiKey}/get_all_mill_tenders`);
                setTenders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAdd = () => {
        navigate('/eTender');
    };

    const handleRowDoubleClick = (tender: TenderData) => {
        navigate('/eTender', { state: { tender } });
    };

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ marginBottom: '50px' }}>
                <Button variant="contained" color="primary" onClick={handleAdd} size="small" style={{ width: "20px", float: "left" }}>
                    Add
                </Button>
                <Button variant="contained" color="secondary" size="small" style={{ width: "20px", float: "left", marginLeft: '10px' }}>
                    Back
                </Button>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>MillTenderId</TableCell>
                                <TableCell>Mill Code</TableCell>
                                <TableCell>Mill Name</TableCell>
                                <TableCell>Item_Code</TableCell>
                                <TableCell>Item Name</TableCell>
                                <TableCell>Packing</TableCell>
                                <TableCell>Delivery From</TableCell>
                                <TableCell>Season</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Base Rate</TableCell>
                                <TableCell>Gst %</TableCell>
                                <TableCell>Rate Including GST</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tenders.map((tender) => (
                                <TableRow key={tender.MillTenderId} onDoubleClick={() => handleRowDoubleClick(tender)}>
                                    <TableCell>{tender.MillTenderId}</TableCell>
                                    <TableCell>{tender.Mill_Code}</TableCell>
                                    <TableCell>{tender.mill_name}</TableCell>
                                    <TableCell>{tender.Item_Code}</TableCell>
                                    <TableCell>{tender.item_name}</TableCell>
                                    <TableCell>{tender.Packing}</TableCell>
                                    <TableCell>{tender.Delivery_From}</TableCell>
                                    <TableCell>{tender.Season}</TableCell>
                                    <TableCell>{tender.Grade}</TableCell>
                                    <TableCell>{tender.Quantity}</TableCell>
                                    <TableCell>{tender.Base_Rate}</TableCell>
                                    <TableCell>{tender.Base_Rate_GST_Perc}</TableCell>
                                    <TableCell>{tender.Rate_Including_GST}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default ETenderUtility;
