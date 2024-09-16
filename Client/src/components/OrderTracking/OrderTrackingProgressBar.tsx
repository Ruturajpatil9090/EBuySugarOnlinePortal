import React, { useState, useEffect } from "react";
import {
    Typography,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    StepConnector,
    LinearProgress,
    Box
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import GenrateSaleBillReport from "./GenrateSaleBillReport";

const apiKey = process.env.REACT_APP_API_KEY;

// Custom styles for the connector line between steps, including progress state
const CustomStepConnector = withStyles({
    alternativeLabel: {
        top: 12,
    },
    active: {
        '& $line': { 
            borderColor: '#4caf50', 
        },
    },
    completed: {
        '& $line': {
            borderColor: '#4caf50', 
        },
    },
    inProgress: {
        '& $line': {
            borderColor: 'linear-gradient(to right, #4caf50 50%, #eaeaf0 50%)',
        },
    },
    line: {
        borderColor: '#eaeaf0', 
        borderTopWidth: 3,
        borderRadius: 1,
        width: '100%',
        '&$inProgress': {
            background: 'linear-gradient(to right, #4caf50 50%, #eaeaf0 50%)',
        },
    },
})(StepConnector);

const typographyStyle = {
    fontWeight: 'bold' as const,
    fontSize: '25px' as const,
};

interface LinearStepperProps {
    orderid: number;
}

const getSteps = (): string[] => {
    return ["Order Processed", "Place Order", "Order Dispatch", "Generate Sale Bill"];
};

const getStepContent = (step: number) => {
    const progressBarStyle = { width: '80%', margin: 'auto', marginBottom: '20px' };

    switch (step) {
        case 0:
            return (
                <Box textAlign="center">
                    <Typography style={typographyStyle}>Order has been processed...</Typography>
                    <LinearProgress variant="determinate" value={25} style={progressBarStyle} />
                </Box>
            );
        case 1:
            return (
                <Box textAlign="center">
                    <Typography style={typographyStyle}>Place Order Pending...</Typography>
                    <LinearProgress variant="determinate" value={50} style={progressBarStyle} />
                </Box>
            );
        case 2:
            return (
                <Box textAlign="center">
                    <Typography style={typographyStyle}>Order Dispatch Pending...</Typography>
                    <LinearProgress variant="determinate" value={75} style={progressBarStyle} />
                </Box>
            );
        case 3:
            return (
                <Box textAlign="center">
                    <Typography style={typographyStyle}>Generate Sale Bill Pending...</Typography>
                    <LinearProgress variant="determinate" value={90} style={progressBarStyle} />
                </Box>
            );
        case 4:
            return (
                <Box textAlign="center">
                    <Typography style={typographyStyle}>Generate Sale Bill</Typography>
                    <LinearProgress variant="determinate" value={100} style={progressBarStyle} />
                </Box>
            );
        default:
            return "Unknown step";
    }
};

const LinearStepper: React.FC<LinearStepperProps> = ({ orderid }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [orderStatus, setOrderStatus] = useState<{
        OrderList: boolean;
        PendingDO: boolean;
        DeliveryOrder: boolean;
        SaleBill: boolean;
    }>({
        OrderList: false,
        PendingDO: false,
        DeliveryOrder: false,
        SaleBill: false,
    });

    const steps = getSteps();

    // Fetch order status from API
    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${apiKey}/checkOrderStatus?order_id=${orderid}`
                );
                const data = await response.json();

                // Update the status from API response
                setOrderStatus({
                    OrderList: data.OrderList,
                    PendingDO: data.PendingDO,
                    DeliveryOrder: data.DeliveryOrder,
                    SaleBill: data.SaleBill,
                });

                // Determine active step based on the status
                let step = 0;
                if (data.OrderList) step = 1;
                if (data.PendingDO) step = 2;
                if (data.DeliveryOrder) step = 3;
                if (data.SaleBill) step = 4;
                setActiveStep(step);
            } catch (error) {
                console.error("Failed to fetch order status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStatus();
    }, [orderid]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div>
            <Stepper
                alternativeLabel
                activeStep={activeStep}
                connector={<CustomStepConnector />}
            >
                {steps.map((label, index) => (
                    <Step key={label} completed={activeStep > index} disabled={activeStep < index}>
                        <StepLabel
                            StepIconProps={{
                                classes: {
                                    completed: "completedStepIcon",
                                    active: "activeStepIcon",
                                },
                            }}
                        >
                            <span
                                style={{
                                    color:
                                        activeStep >= index
                                            ? '#4caf50' 
                                            : 'gray',
                                    fontWeight: activeStep === index ? 'bold' : 'normal',
                                }}
                            >
                                {label}
                            </span>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            {activeStep === steps.length ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Typography variant="h5" align="center" style={{ color: '#16175d' }} >
                        Thank You! Your order has been completed.
                    </Typography>
                    <GenrateSaleBillReport />
                </div>
            ) : (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    {getStepContent(activeStep)}
                </div>
            )}
        </div>
    );
};

export default LinearStepper;
