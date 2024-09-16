import React, { useState, useEffect } from 'react';
import {
    Button,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import LinearStepper from './OrderTrackingProgressBar';
import io from 'socket.io-client';
import styles from '../../styles/Myorder.module.css';
import MotionHoc from "../../Pages/MotionHoc";

const apiKey = process.env.REACT_APP_API_KEY;
const socketURL = 'http://localhost:8080';

interface Order {
    Buy_Qty: number;
    Buy_Rate: number;
    Grade: string;
    Lifted_qntl: number;
    Lifting_Date: string;
    Packing: number;
    Pending_qntl: number;
    millgstno: string;
    millname: string;
    orderid: number;
    season: string;
    tenderid: number;
    user_id: number;
    tenderdetailid: number;
}

const MyOrderComponents: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user_id = sessionStorage.getItem('user_id');

    const titleStyle = {
        textAlign: 'center' as const,
        color: '#802086',
        fontSize: '25px',
    };

    const buttonStyle = {
        backgroundColor: '#3f51b5',
        color: '#fff',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer' as const,
        fontSize: '16px',
        margin: '8px',
        width: "30%"
    };


    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${apiKey}/orderlist?user_id=${user_id}`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching order list:', error);
        }
    };

    useEffect(() => {
        const socket = io(socketURL);
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('pending_do_saved', () => {
            fetchOrders();
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    return (
        <>
            <h2>My Orders</h2>
            <div className={styles.container}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Tender DetailId</TableCell>
                                <TableCell>Mill Name</TableCell>
                                <TableCell>Tender ID</TableCell>
                                <TableCell>Mill GST No</TableCell>
                                <TableCell>Season</TableCell>
                                <TableCell>Grade</TableCell>
                                <TableCell>Buy Quantity</TableCell>
                                <TableCell>Buy Rate</TableCell>
                                <TableCell>Packing</TableCell>
                                <TableCell>Lifting Date</TableCell>
                                <TableCell>Lifted Quantity</TableCell>
                                <TableCell>Pending Quantity</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(orders) && orders.length > 0 ? (
                                orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                                    <TableRow key={order.orderid}>
                                        <TableCell>{order.orderid}</TableCell>
                                        <TableCell>{order.tenderdetailid}</TableCell>
                                        <TableCell>{order.millname}</TableCell>
                                        <TableCell>{order.tenderid}</TableCell>
                                        <TableCell>{order.millgstno}</TableCell>
                                        <TableCell>{order.season}</TableCell>
                                        <TableCell>{order.Grade}</TableCell>
                                        <TableCell>{order.Buy_Qty} qntl</TableCell>
                                        <TableCell>₹{order.Buy_Rate}/qntl</TableCell>
                                        <TableCell>{order.Packing} kg</TableCell>
                                        <TableCell>{new Date(order.Lifting_Date).toLocaleDateString()}</TableCell>
                                        <TableCell>{order.Lifted_qntl} qntl</TableCell>
                                        <TableCell>{order.Pending_qntl} qntl</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleOpenModal(order)} style={{
                                                backgroundColor: '#008080',
                                                color: '#fff',
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                fontSize: '16px',
                                                boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                            }}>
                                                Track Order
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={14} align="center">
                                        <h1>No orders found!..</h1>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={orders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </div>

            {/* Modal to show the LinearStepper with order id */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
                <DialogTitle style={titleStyle}>Order Tracking</DialogTitle>
                <DialogContent>
                    {selectedOrder && <LinearStepper orderid={selectedOrder.orderid} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} style={buttonStyle} >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const MyOrder = MotionHoc(MyOrderComponents);
export default MyOrder;
