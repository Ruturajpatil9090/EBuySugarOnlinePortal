import React, { useEffect, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TablePagination } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    Open_Base_Rate: string;
    Open_Base_Rate_GST_Perc: string;
    Open_Base_Rate_GST_Amount: string;
    Tender_Type:string;
    Open_Rate_Including_GST:number ;
}

const apiKey = process.env.REACT_APP_API_KEY;

const ETenderUtility = () => {
    const [tenders, setTenders] = useState<TenderData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pageT, setPageT] = useState<number>(0);
    const [rowsPerPageT, setRowsPerPageT] = useState<number>(10);
    const [pageO, setPageO] = useState<number>(0);
    const [rowsPerPageO, setRowsPerPageO] = useState<number>(10);
    const navigate = useNavigate();

    const isAdmin = sessionStorage.getItem("isAdmin");
    const UserIdNew = sessionStorage.getItem("user_id");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiKey}/getAllTendersUtility`);
                setTenders(response.data);
                setLoading(false);
                if (isAdmin === 'Y') {
                    setTenders(response.data);
                } else {
                    const filteredData = response.data.filter((tender: any) => tender.MillUserId === parseInt(UserIdNew || '0', 10));
                    setTenders(filteredData);
                }
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

    const handleBackArrow = () => {
        navigate('/publishedlist');
    };

    const handleChangePageT = (event: unknown, newPage: number) => {
        setPageT(newPage);
    };

    const handleChangeRowsPerPageT = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageT(parseInt(event.target.value, 10));
        setPageT(0);
    };

    const handleChangePageO = (event: unknown, newPage: number) => {
        setPageO(newPage);
    };

    const handleChangeRowsPerPageO = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPageO(parseInt(event.target.value, 10));
        setPageO(0);
    };

    // Filter tenders for 'T' and 'O'
    const tendersTypeT = tenders.filter(tender => tender.Tender_Type === 'T');
    const tendersTypeO = tenders.filter(tender => tender.Tender_Type === 'O');

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ marginBottom: '10px' }}>
                <Button
                    variant="contained"
                    onClick={handleAdd}
                    size="small"
                    style={{ width: '10%', height: '5vh', float: 'right', marginRight: '50px', backgroundColor: '#b0151a', fontWeight: "bold" }}
                >
                    Add Live Tender
                </Button>
                <Button
                    variant="contained"
                    onClick={handleBackArrow}
                    style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        borderRadius: '50%',
                        float: 'left',
                        backgroundColor: '#5349d6',
                        marginTop: '10px',
                        marginBottom: '20px',
                        cursor:"pointer"
                    }}
                >
                    <ArrowBackIcon />
                </Button>
            </div>

            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    {/* Table for Tender_Type 'T' */}
                    <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={30} style={{ textAlign: 'center', fontWeight: 'bold',fontSize:"20px" }}>Live eTenders</TableCell>
                                </TableRow>
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
                                    <TableCell>Tender_Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tendersTypeT
                                    .slice(pageT * rowsPerPageT, pageT * rowsPerPageT + rowsPerPageT)
                                    .map((tender) => (
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
                                            <TableCell>{tender.Tender_Type}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25]}
                            component="div"
                            count={tendersTypeT.length}
                            rowsPerPage={rowsPerPageT}
                            page={pageT}
                            onPageChange={handleChangePageT}
                            onRowsPerPageChange={handleChangeRowsPerPageT}
                        />
                    </TableContainer>

                    {/* Table for Tender_Type 'O' */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                <TableCell colSpan={30} style={{ textAlign: 'center', fontWeight: 'bold',fontSize:"20px" }}>Open eTenders</TableCell>
                                </TableRow>
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
                                    <TableCell>Tender_Type</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tendersTypeO
                                    .slice(pageO * rowsPerPageO, pageO * rowsPerPageO + rowsPerPageO)
                                    .map((tender) => (
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
                                            <TableCell>{tender.Open_Base_Rate}</TableCell>
                                            <TableCell>{tender.Open_Base_Rate_GST_Perc}</TableCell>
                                            <TableCell>{tender.Open_Rate_Including_GST}</TableCell>
                                            <TableCell>{tender.Tender_Type}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25]}
                            component="div"
                            count={tendersTypeO.length}
                            rowsPerPage={rowsPerPageO}
                            page={pageO}
                            onPageChange={handleChangePageO}
                            onRowsPerPageChange={handleChangeRowsPerPageO}
                        />
                    </TableContainer>
                </>
            )}
        </div>
    );
};

export default ETenderUtility;
