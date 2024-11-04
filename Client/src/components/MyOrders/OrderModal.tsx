import React, { useState } from 'react';
import { Modal, Box, TextField, Button, MenuItem, Typography, Container, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import states from "./State.json"
import ToastComponent, { showSuccessToast, showErrorToast } from '../../UI/ToastComponent';
import AddressPopup from './AddressModal';
import "./AddressPopup.css"
import { HashLoader } from "react-spinners";
const APIURL = process.env.REACT_APP_API_KEY;
const user_id = sessionStorage.getItem('user_id');
const accoid = sessionStorage.getItem('accoid');

interface Order {
    orderid: number;
    Lifting_Date: string;
    millname: string;
    Grade: string;
    season: string;
    Buy_Qty: number;
    Lifted_qntl: number;
    Pending_qntl: number;
    Buy_Rate: number;
    tenderdetailid: number;
}

interface OrderModalProps {
    open: boolean;
    onClose: () => void;
    order: Order;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, order }) => {
    const [date, setDate] = useState<string>(order.Lifting_Date);
    const [liftedQntl, setLiftedQntl] = useState<number | null>(null);
    const [gstNumber, setGstNumber] = useState('');
    const [shipToGstNumber, setShipToGstNumber] = useState('');
    const [billToAcCode, setBillToAcCode] = useState('');
    const [billToName, setBillToName] = useState('');
    const [billToAddress, setBillToAddress] = useState('');
    const [billToState, setBillToState] = useState('');
    const [billToPincode, setBillToPincode] = useState('');
    const [shipToAcCode, setShipToAcCode] = useState('');
    const [shipToName, setShipToName] = useState('');
    const [shipToAddress, setShipToAddress] = useState('');
    const [shipToState, setShipToState] = useState('');
    const [shipToPincode, setShipToPincode] = useState('');
    const [adjustedQty, setAdjustedQty] = useState('');
    const [truckNumber, setTruckNumber] = useState('');
    const [paymentDetail, setPaymentDetail] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [newParty, setNewParty] = useState('N');
    const [billTOCity, setBillToCity] = useState('');
    const [shipToCity, setShipToCity] = useState('');
    const [billToFSSAINO, setBillToFSSAINO] = useState('');
    const [shipToFSSAINO, setShipTOFSSAINO] = useState('');
    const [tradersname, setTradeName] = useState('');

    const [showPopup, setShowPopup] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isShipTo, setIsShipTo] = useState<boolean>(false);

    const [stateCodeOnlinePortal, setStateCodeOnlinePortal] = useState('');
    const [panNumberOnlinePortal, setPanNumberOnlinePortal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [billToAccoid, setBillToAccoid] = useState('');
    const [shipToAccoid, setShipToAccoid] = useState('');

    interface Address {
        addr: {
            bnm: string;
            st: string;
            loc: string;
            bno: string;
            stcd: string;
            flno: string;
            lt: string;
            lg: string;
            pncd: string;
        };
        ntr: string;
    }

    interface PrimaryAddress {
        addr: {
            bnm: string;
            st: string;
            loc: string;
            bno: string;
            stcd: string;
            flno: string;
            lt: string;
            lg: string;
            pncd: string;
        };
        ntr: string;
    }

    interface ResponseData {
        Status: string;
        Message: string;
        Result: any;
        lstAppSCommonSearchTPResponse: {
            RequestedGSTIN: string;
            Message: string;
            stjCd: string;
            lgnm: string;
            stj: string;
            dty: string;
            cxdt: string;
            gstin: string;
            nba: string[];
            lstupdt: string;
            rgdt: string;
            ctb: string;
            sts: string;
            ctjCd: string;
            ctj: string;
            tradeNam: string;
            adadr: Address[];
            pradr: PrimaryAddress;
        }[];
    }

    const API_URL = `${APIURL}/savePendingDO`;

    const formatTruckNumber = (value: string) => {
        const cleanedValue = value.replace(/\s+/g, '').toUpperCase();
        return cleanedValue.length <= 10 ? cleanedValue : cleanedValue.substring(0, 10);
    };

    const handleTruckNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatTruckNumber(e.target.value);
        setTruckNumber(formattedValue);
    };

    const handleSubmit = async () => {
        if (!liftedQntl || !gstNumber || !shipToGstNumber ||
            !billToName || !billToAddress || !billToState || !billToPincode ||
            !shipToName || !shipToAddress || !shipToState || !shipToPincode || !paidAmount) {
            showErrorToast('Please fill required feilds!');
            return;
        }
        const data = {
            doid: 0,
            user_id: Number(user_id),
            accoid: Number(accoid),
            do_qntl: Number(liftedQntl),
            adjust_do_qntl: Number(adjustedQty),
            payment_detail: paymentDetail,
            bill_to_gst_no: gstNumber,
            ship_to_gst_no: shipToGstNumber,
            bill_to_ac_code: Number(billToAcCode),
            bill_to_address: billToAddress,
            bill_to_state: billToState,
            bill_to_pincode: Number(billToPincode),
            ship_to_ac_code: Number(shipToAcCode),
            ship_to_address: shipToAddress,
            ship_to_state: shipToState,
            ship_to_pincode: Number(shipToPincode),
            orderid: order.orderid,
            truck_no: truckNumber,
            new_party: newParty,
            tenderdetailid: order.tenderdetailid,
            bill_to_accoid: Number(billToAccoid),
            ship_to_accoid: Number(shipToAccoid),
            paid_amount:paidAmount
        };

        try {
            const response = await axios.post(API_URL, data);
            showSuccessToast(`Place Order Successfully!`);
            onClose();
        } catch (error) {
            console.error('API Error:', error);
        }
    };

    const fetchGStDataFromOnlinePortal = async (gstNumber: string, isShipTo: boolean = false) => {
        try {
            // Show loader
            setIsLoading(true);

            const apiUrl = 'https://www.ewaybills.com/MVEWBAuthenticate/MVAppSCommonSearchTP';
            const apiKey = 'bk59oPDpaGTtJa4';
            const apiSecret = 'EajrxDcIWLhGfRHLej7zjw==';
            const GSTIN = "27AAECJ8332R1ZV";

            const requestBody = {
                "AppSCommonSearchTPItem": [{
                    "GSTIN": gstNumber
                }]
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'MVApiKey': apiKey,
                    'MVSecretKey': apiSecret,
                    'GSTIN': GSTIN
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data: ResponseData = await response.json();

            if (data.Status === "1" && data.lstAppSCommonSearchTPResponse.length > 0) {
                const taxpayerDetails = data.lstAppSCommonSearchTPResponse[0];
                const addressArray = taxpayerDetails.adadr;

                const Newaddress = taxpayerDetails.pradr.addr;
                const Address_E = `${Newaddress.bno} ${Newaddress.bnm} ${Newaddress.st} ${Newaddress.flno} ${Newaddress.loc} ${Newaddress.pncd} ${Newaddress.stcd}`;
                const Ac_Name_E = taxpayerDetails.tradeNam;
                const state = Newaddress.stcd;
                const pincode = Newaddress.pncd;
                const city = Newaddress.loc;

                const stateCode = gstNumber.substring(0, 2);
                const panNumber = gstNumber.substring(2, gstNumber.length - 3);

                setStateCodeOnlinePortal(stateCode);
                setPanNumberOnlinePortal(panNumber);

                setTradeName(Ac_Name_E);


                if (addressArray && addressArray.length > 0) {
                    setAddresses(addressArray);
                    setShowPopup(true);
                    setIsShipTo(isShipTo);
                    setTradeName(Ac_Name_E);
                } else {
                    const cityApiUrl = `${APIURL}/getcreatecity`;
                    const cityRequestBody = {
                        company_code: 1,
                        city_name_e: city,
                        state: state,
                        pincode: pincode
                    };

                    const cityResponse = await fetch(cityApiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(cityRequestBody)
                    });

                    if (!cityResponse.ok) {
                        throw new Error(`City API request failed with status ${cityResponse.status}`);
                    }

                    const cityData = await cityResponse.json();

                    // Account master API call
                    const accountMasterApiUrl = `${APIURL}/insert-accountmaster`;
                    const accountMasterRequestBody = {
                        contact_data: [],
                        master_data: {
                            Ac_Name_E: Ac_Name_E,
                            Ac_Name_R: "",
                            Ac_type: "P",
                            Address_E: Address_E,
                            Address_R: "",
                            City_Code: cityData.city_code,
                            GSTStateCode: stateCode,
                            Gst_No: gstNumber,
                            Pincode: pincode,
                            cityid: cityData.cityid,
                            company_code: 1,
                            Group_Code: 24,
                            bsid: 24,
                            CompanyPan: panNumber,
                            FSSAI: billToFSSAINO || shipToFSSAINO
                        }
                    };

                    const accountMasterResponse = await fetch(accountMasterApiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(accountMasterRequestBody)
                    });

                    if (!accountMasterResponse.ok) {
                        throw new Error(`Account Master API request failed with status ${accountMasterResponse.status}`);
                    }

                    const accountMasterData = await accountMasterResponse.json();

                    const AccountMaster = accountMasterData.AccountMaster;
                    let AcCodeNew;
                    let Accoid;

                    if (AccountMaster && Object.keys(AccountMaster).length > 0) {
                        AcCodeNew = AccountMaster.Ac_Code;
                        Accoid = AccountMaster.accoid

                    } else {
                        console.error('AccountMaster data is not available or is empty:', AccountMaster);
                    }

                    // Set the data for billTo or shipTo based on isShipTo flag
                    if (isShipTo) {

                        setShipToName(Ac_Name_E);
                        setShipToAddress(Address_E);
                        setShipToState(state);
                        setShipToPincode(pincode);
                        setShipToCity(city);
                        setShipToAcCode(AcCodeNew);
                        setShipToAccoid(Accoid);
                        setNewParty('Y');
                    } else {

                        setBillToName(Ac_Name_E);
                        setBillToAddress(Address_E);
                        setBillToState(state);
                        setBillToPincode(pincode);
                        setBillToCity(city);
                        setBillToAcCode(AcCodeNew);
                        setBillToAccoid(Accoid);
                        setNewParty('Y');
                    }
                }

            } else {
                alert('No data found from the API.');
            }
        } catch (error) {
            console.error('Error fetching data from API:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSelectAddress = async (address: Address) => {
        setIsLoading(true)
        const addr = address.addr;
        const Address_E = `${addr.bno} ${addr.bnm} ${addr.st} ${addr.flno} ${addr.loc} ${addr.pncd} ${addr.stcd}`;
        const state = addr.stcd;
        const pincode = addr.pncd;
        const city = addr.loc;

        // New API call to get or create city
        const cityApiUrl = `${APIURL}/getcreatecity`;
        const cityRequestBody = {
            company_code: 1,
            city_name_e: city,
            state: state,
            pincode: pincode
        };

        const cityResponse = await fetch(cityApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cityRequestBody)
        });

        if (!cityResponse.ok) {
            throw new Error(`City API request failed with status ${cityResponse.status}`);
        }

        const cityData = await cityResponse.json();

        // Account master API call
        const accountMasterApiUrl = `${APIURL}/insert-accountmaster`;
        const accountMasterRequestBody = {
            contact_data: [],
            master_data: {
                Ac_Name_E: tradersname,
                Ac_Name_R: "",
                Ac_type: "P",
                Address_E: Address_E,
                Address_R: "",
                City_Code: cityData.city_code,
                GSTStateCode: stateCodeOnlinePortal,
                Gst_No: gstNumber,
                Pincode: pincode,
                cityid: cityData.cityid,
                company_code: 1,
                Group_Code: 24,
                bsid: 24,
                CompanyPan: panNumberOnlinePortal,
                FSSAI: billToFSSAINO || shipToFSSAINO
            }
        };

        const accountMasterResponse = await fetch(accountMasterApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountMasterRequestBody)
        });

        if (!accountMasterResponse.ok) {
            throw new Error(`Account Master API request failed with status ${accountMasterResponse.status}`);
        }


        const accountMasterData = await accountMasterResponse.json();

        const AccountMaster = accountMasterData.AccountMaster;

        let AcCodeNew;
        let Accoid;

        if (AccountMaster && Object.keys(AccountMaster).length > 0) {
            AcCodeNew = AccountMaster.Ac_Code;
            Accoid = AccountMaster.accoid

        } else {
            console.error('AccountMaster data is not available or is empty:', AccountMaster);
        }

        if (isShipTo) {
            setShipToName(tradersname);
            setShipToAddress(Address_E);
            setShipToState(state);
            setShipToPincode(pincode);
            setShipToCity(city);
            setShipToAcCode(AcCodeNew);
            setShipToAccoid(Accoid);
            setNewParty('Y');
        } else {
            setBillToName(tradersname);
            setBillToAddress(Address_E);
            setBillToState(state);
            setBillToPincode(pincode);
            setBillToAcCode(AcCodeNew);
            setBillToAccoid(Accoid);
            setBillToCity(city);
            setNewParty('Y');
        }

        setShowPopup(false);
        setIsLoading(false)

    };

    const handleGstVerification = async () => {

        if (!gstNumber || gstNumber.trim() === '') {
            window.alert('Bill To GST number is empty. Please provide a valid GST number.');
            return;
        }

        // if (!billToFSSAINO || billToFSSAINO.trim() === '') {
        //     window.alert('Please Enter the FSSAI Number First');
        //     return;
        // }

        try {
            const response = await axios.get(`${APIURL}/gstaccountinfo?GST_No=${gstNumber}`);
            const data = response.data[0];

            if (data) {
                setBillToAcCode(data.Ac_Code);
                setBillToAccoid(data.accoid)
                setBillToName(data.Ac_Name_E);
                setBillToAddress(data.Address_E);
                setBillToState(data.state);
                setBillToPincode(data.pincode);
                setBillToCity(data.city_name_e);
            } else {
                await fetchGStDataFromOnlinePortal(gstNumber);
            }
        } catch (error) {
            console.error('Error fetching GST info:', error);
            await fetchGStDataFromOnlinePortal(gstNumber);
        }
    };

    const handleGstShipToVerification = async () => {
        if (!shipToGstNumber || shipToGstNumber.trim() === '') {
            window.alert('Ship To GST number is empty. Please provide a valid GST number.');
            return;
        }

        // if (!shipToFSSAINO || shipToFSSAINO.trim() === '') {
        //     window.alert('Please Enter the FSSAI Number');
        //     return;
        // }
        try {
            const response = await axios.get(`${APIURL}/gstaccountinfo?GST_No=${shipToGstNumber}`);
            const data = response.data[0];
            if (data) {
                setShipToAcCode(data.Ac_Code);
                setShipToAccoid(data.accoid)
                setShipToName(data.Ac_Name_E);
                setShipToAddress(data.Address_E);
                setShipToState(data.state);
                setShipToPincode(data.pincode);
                setShipToCity(data.city_name_e);
            } else {
                await fetchGStDataFromOnlinePortal(shipToGstNumber, true);
            }

        } catch (error) {
            console.error('Error fetching GST info:', error);
            await fetchGStDataFromOnlinePortal(shipToGstNumber, true);
        }
    };

    return (
        <>
            <ToastComponent />
            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 1600,
                        bgcolor: 'background.paper',
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 24,
                        overflowY: 'auto',
                        position: 'relative',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: -200,

                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        id="modal-title"
                        variant="h4"
                        component="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 1,
                        }}
                    >
                        Order Details
                    </Typography>
                    <br></br>
                    <br></br>

                    {showPopup && (
                        <AddressPopup
                            addresses={addresses}
                            onSelectAddress={handleSelectAddress}
                            onClose={() => setShowPopup(false)}
                            isLoading={isLoading}
                        />
                    )}

                    <Container className=''>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>

                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Order ID"
                                    value={order.orderid}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Mill Name"
                                    value={order.millname}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Season"
                                    value={order.season}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Lifted Quantity"
                                    autoComplete='off'
                                    value={liftedQntl || ''}
                                    onChange={(e) => setLiftedQntl(e.target.value ? parseFloat(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Buy Rate"
                                    value={order.Buy_Rate}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>

                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Lifting Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Grade"
                                    autoComplete='off'
                                    value={order.Grade}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Buy Quantity"
                                    value={order.Buy_Qty}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Pending Quantity"
                                    autoComplete='off'
                                    value={order.Pending_qntl}
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    label="Adjusted Qty"
                                    autoComplete='off'
                                    value={adjustedQty}
                                    onChange={(e) => setAdjustedQty(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>


                            <Grid item xs={12} md={8}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Bill To GST Information</Typography>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="GST Number"
                                    value={gstNumber}
                                    onChange={(e) => setGstNumber(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                                    <Button variant="contained" onClick={handleGstVerification}>
                                        Verify GST
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Ship To GST Information</Typography>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="GST Number"
                                    value={shipToGstNumber}
                                    onChange={(e) => setShipToGstNumber(e.target.value)}
                                    sx={{ mb: 2 }}
                                />


                            </Grid>
                            <HashLoader color="#007bff" loading={isLoading} size={80} />
                            <Grid item xs={12} md={3}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                                    <Button variant="contained" onClick={handleGstShipToVerification}>
                                        Verify GST
                                    </Button>
                                </Box>
                            </Grid>


                            {/* Bill To Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Bill To Information</Typography>

                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Name"
                                    value={billToName}
                                    onChange={(e) => setBillToName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Address"
                                    multiline
                                    rows={2}
                                    value={billToAddress}
                                    onChange={(e) => setBillToAddress(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    // select
                                    label="State"
                                    value={billToState}
                                    onChange={(e) => setBillToState(e.target.value)}
                                    sx={{ mb: 2 }}
                                >
                                    {states.map((state) => (
                                        <MenuItem key={state.State_Code} value={billToState}>
                                            {billToState}
                                        </MenuItem>

                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Pincode"
                                    value={billToPincode}
                                    onChange={(e) => setBillToPincode(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            {/* Ship To Information */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Ship To Information</Typography>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Name"
                                    value={shipToName}
                                    onChange={(e) => setShipToName(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Address"
                                    multiline
                                    rows={2}
                                    value={shipToAddress}
                                    onChange={(e) => setShipToAddress(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    // select
                                    label="State"
                                    value={shipToState}
                                    onChange={(e) => setShipToState(e.target.value)}
                                    sx={{ mb: 2 }}
                                >
                                    {states.map((state) => (
                                        <MenuItem key={state.State_Code} value={shipToState}>
                                            {shipToState}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Pincode"
                                    value={shipToPincode}
                                    onChange={(e) => setShipToPincode(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Bill To City"
                                    value={billTOCity}
                                    onChange={(e) => setBillToCity(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Bill To FSSAI No"
                                    value={billToFSSAINO}
                                    onChange={(e) => setBillToFSSAINO(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Ship To City"
                                    value={shipToCity}
                                    onChange={(e) => setShipToCity(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Ship To FSSAI No"
                                    value={shipToFSSAINO}
                                    onChange={(e) => setShipTOFSSAINO(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Truck Number"
                                    value={truckNumber}
                                    onChange={handleTruckNumberChange}
                                    sx={{ mb: 2 }}
                                />

                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Bank Details"
                                    value={paymentDetail}
                                    onChange={(e) => setPaymentDetail(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    autoComplete='off'
                                    label="Paid Amount"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                            </Grid>
                        </Grid>
                    </Container>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{ mr: 3, width: '200px' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{ mr: 22, width: '200px' }}
                        >
                            Place Order
                        </Button>
                    </Box>

                </Box>
            </Modal>
        </>
    );
};

export default OrderModal;
