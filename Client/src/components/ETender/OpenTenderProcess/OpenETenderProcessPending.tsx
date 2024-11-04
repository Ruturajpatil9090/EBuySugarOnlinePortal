import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/PublishListCompoents.module.css';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const apiKey = process.env.REACT_APP_API_KEY;

// Define the Bid interface
interface Bid {
    Base_Rate: number;
    Base_Rate_GST_Amount: string;
    Base_Rate_GST_Perc: string;
    BidQuantity: string;
    BidRate: string;
    Created_Date: string;
    Delivery_From: string;
    End_Date: string;
    End_Time: string;
    Grade: string;
    Item_Code: number;
    Last_Dateof_Payment: string;
    Lifting_Date: string;
    MillTenderId: number;
    MillUserId: number;
    Mill_Code: number;
    Modified_Date: string;
    Open_Base_Rate: string | null;
    Open_Base_Rate_GST_Amount: string | null;
    Open_Base_Rate_GST_Perc: string | null;
    Open_Rate_Including_GST: string | null;
    Open_tender_closed: string;
    Packing: number;
    Quantity: number;
    Quantity_In: string | null;
    Rate_Including_GST: string;
    Season: string;
    Start_Date: string;
    Start_Time: string;
    Sugar_Type: string;
    Tender_Closed: string;
    Tender_Type: string;
    UserId: number;
    bidder: string;
    ic: number;
    mc: number;
    seller: string;
    ETenderBidId: number;
}

const ETenderProcessPending: React.FC = () => {
    const location = useLocation();
    const { tender } = location.state;
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [issuedQuantities, setIssuedQuantities] = useState<string[]>(Array(bids.length).fill(''));
    const [issuedRates, setIssuedRates] = useState<string[]>(Array(bids.length).fill(''));

    const navigate = useNavigate()

    // Fetching tender bids from the API
    useEffect(() => {
        const fetchTenderBids = async () => {
            try {
                const response = await axios.get(`${apiKey}/get_e_tender_bids?MillTenderId=${tender.MillTenderId}`);
                setBids(response.data.ETenderBids);
            } catch (err) {
                setError('Failed to fetch tender bids');
            } finally {
                setLoading(false);
            }
        };

        fetchTenderBids();
    }, [tender.MillTenderId]);

    if (!tender) {
        return <div>No tender data available.</div>;
    }

    // Event handler for the Update button
    const handleUpdate = async () => {
        try {
            const updateData = bids.map((bid, index) => ({
                UserId: bid.UserId,
                MillTenderId: tender.MillTenderId,
                ETenderBidId: bid.ETenderBidId,
                IssuedQuantity: issuedQuantities[index],
                IssuedRate: bid.BidRate
            }));

            const response = await axios.put(`${apiKey}/update_e_tender_bid`, updateData);

            setIssuedQuantities(Array(bids.length).fill(''));
            setIssuedRates(Array(bids.length).fill(''));
            navigate('/open-tender-process')
        } catch (error) {
            console.error('Error updating bids:', error);
            setError('Failed to update bids');
        }
    };

    // Event handler for the Close button
    const handleUpdateCloseETenderBid = async () => {
        try {
            const updateData = bids.map((bid, index) => ({
                UserId: bid.UserId,
                MillTenderId: tender.MillTenderId,
                ETenderBidId: bid.ETenderBidId,
                IssuedQuantity: issuedQuantities[index],
                IssuedRate: bid.BidRate
            }));

            const response = await axios.put(`${apiKey}/updateCloseOpenetender_e_tender_bid`, updateData);
        
            setIssuedQuantities(Array(bids.length).fill(''));
            setIssuedRates(Array(bids.length).fill(''));
            navigate('/publishedlist')

        } catch (error) {
            console.error('Error updating bids:', error);
            setError('Failed to update bids');
        }
    };

    const handleBackArrow = () => {
        navigate('/tender-process')
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
       
             
            }}>
              <ArrowBackIcon />
            </Button>
          </div>

        </div>
        
     
        <div>
            <Card sx={{ margin: '10px auto', maxWidth: 500 }}>
            <CardContent>
                <Typography variant="h5" component="div" align="center" sx={{ fontWeight: 'bold' }}>
                    Open eTender Details
                </Typography>
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Mill Tender ID</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.MillTenderId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Mill Code</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Mill_Code}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Delivery From</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Delivery_From}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Sugar Type</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Sugar_Type}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Quantity</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Quantity}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Packing</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Packing}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Season</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Season}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Lifting Date</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Lifting_Date}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Last Date of Payment</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Last_Dateof_Payment}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 'bold' }}>Rate Including GST</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography align="right">{tender.Rate_Including_GST}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>


            <Box display="flex" justifyContent="flex-start" style={{ float: "right" }} sx={{ mr: 7 }}  >
                <Button variant="contained" color="success" size="small" onClick={handleUpdate} style={{ height: "5vh" }} >
                    Update
                </Button>
                <Button variant="contained" color="primary" size="small" onClick={handleUpdateCloseETenderBid} sx={{ ml: 1 }} style={{ height: "5vh" }} >
                    Update & Close Open ETender
                </Button>
            </Box>

            <div className={styles.container}>
                <h2>open eTender Biddings</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>No Bidding Yet!</div>
                ) : (
                    <TableContainer component={Paper} sx={{ margin: '20px auto', width: '100%' }}>
                        <Table size="small" aria-label="tender bids table" sx={{ width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ETenderBidId</TableCell>
                                    <TableCell>Seller</TableCell>
                                    <TableCell>Bidder</TableCell>
                                    <TableCell align="right">Base Rate</TableCell>
                                    <TableCell align="right">Bid Quantity</TableCell>
                                    <TableCell align="right">Bid Rate</TableCell>
                                    <TableCell align="right">Issued Quantity</TableCell>
                                    <TableCell align="right">Issued Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bids.map((bid, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{bid.ETenderBidId}</TableCell>
                                        <TableCell>{bid.seller}</TableCell>
                                        <TableCell>{bid.bidder}</TableCell>
                                        <TableCell align="right">{bid.Base_Rate}</TableCell>
                                        <TableCell align="right">{bid.BidQuantity}</TableCell>
                                        <TableCell align="right">{bid.BidRate}</TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                value={issuedQuantities[index]}
                                                onChange={(e) => {
                                                    const newQuantities = [...issuedQuantities];
                                                    newQuantities[index] = e.target.value;
                                                    setIssuedQuantities(newQuantities);
                                                }}
                                            />
                                        </TableCell>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            value={bid.BidRate}
                                            InputProps={{
                                                readOnly: true
                                            }}
                                        />

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </div>
        </div>
        </>
    );
};

export default ETenderProcessPending;
