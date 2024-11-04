import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Grid,
  Avatar,
  IconButton,
  Input
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  basicInfoSchema,
  contactInfoSchema,
  personalInfoSchema,
  paymentSchema,
  BasicInfoSchema,
  ContactInfoSchema,
  PersonalInfoSchema,
  PaymentSchema
} from '../../validation/userSchemas';

type FormData = BasicInfoSchema & ContactInfoSchema & PersonalInfoSchema & PaymentSchema;

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    marginRight: theme.spacing(1),
  },
  container: {
    display: 'flex',
    height: '80vh',
  },
  profileSection: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  formSection: {
    width: '50%',
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    margin: 'auto',
  },
  form: {
    width: '100%',
  },
  stepper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  avatar: {
    width: 300,
    height: 300,
    marginBottom: theme.spacing(2),
  },
}));

const getSteps = (): string[] => [
  'User information',
  'Company Info',
  'Bank Details',
  'Documents'
];

const UserProfile: React.FC = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({} as FormData);
  const [profilePicture, setProfilePicture] = useState<string | ArrayBuffer | null>(null);
  const steps = getSteps();

  const getSchemaForStep = (step: number) => {
    switch (step) {
      case 0:
        return basicInfoSchema;
      case 1:
        return contactInfoSchema;
      case 2:
        return personalInfoSchema;
      case 3:
        return paymentSchema;
      case 4:
        return paymentSchema;
      default:
        throw new Error('Unknown step');
    }
  };

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(getSchemaForStep(activeStep)),
    mode: 'onBlur',
  });

  const isStepOptional = (step: number): boolean => step === 1 || step === 2;

  const isStepSkipped = (step: number): boolean => skippedSteps.includes(step);

  const handleNext = () => {
    setFormData((prevData) => ({ ...prevData, ...getValues() }));
    if (activeStep === steps.length - 1) {
      //handleSubmit(onSubmit);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      setSkippedSteps((prevSkipped) =>
        prevSkipped.filter((skipItem) => skipItem !== activeStep)
      );
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkip = () => {
    if (!isStepSkipped(activeStep)) {
      setSkippedSteps((prevSkipped) => [...prevSkipped, activeStep]);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const onSubmit = (data: FormData) => {
    if (activeStep === steps.length - 1) {
      setFormData((prevData) => ({ ...prevData, ...data }));
     
    }

  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error && typeof error.message === 'string') {
      return error.message;
    }
    return '';
  };

  return (
    <>
      <Typography variant="h3" align="center">
        My Profile
      </Typography>
      <Box className={classes.container}>
        <Box className={classes.profileSection}>
          <Avatar src={profilePicture as string} className={classes.avatar} />
          <Input
            id="profile-picture"
            type="file"
            style={{ display: 'none' }}
            onChange={handleProfilePictureChange}
          />
          <label htmlFor="profile-picture">
            <IconButton color="primary" component="span">
              <Typography>Upload Profile Picture</Typography>
            </IconButton>
          </label>
          <Typography variant="h6">Jk Sugars</Typography>
          <Typography variant="body1">jkindia@gmail.com</Typography>
          <Typography variant="body1">8888118888</Typography>
        </Box>

        <Box className={classes.formSection}>
          <Box className={classes.formContainer}>
            <Stepper alternativeLabel activeStep={activeStep} className={classes.stepper}>
              {steps.map((step, index) => {
                const labelProps: { optional?: React.ReactNode } = {};
                const stepProps: { completed?: boolean } = {};
                if (isStepOptional(index)) {
                  labelProps.optional = (
                    <Typography
                      variant="caption"
                      align="center"
                      style={{ display: 'block' }}
                    >
                      optional
                    </Typography>
                  );
                }
                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step {...stepProps} key={index}>
                    <StepLabel {...labelProps}>{step}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {activeStep === steps.length ? (
              <Typography variant="h3" align="center">
                Thank You
              </Typography>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
                {activeStep === 0 && (
                  <>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="First Name"
                          variant="outlined"
                          placeholder="Enter Your First Name"
                          fullWidth
                          margin="normal"
                          error={!!errors.firstName}
                          helperText={getErrorMessage(errors.firstName)}
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Last Name"
                          variant="outlined"
                          placeholder="Enter Your Last Name"
                          fullWidth
                          margin="normal"
                          error={!!errors.lastName}
                          helperText={getErrorMessage(errors.lastName)}
                        />
                      )}
                    />
                    <Controller
                      name="emailAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="E-mail"
                          variant="outlined"
                          placeholder="Enter Your E-mail Address"
                          fullWidth
                          margin="normal"
                          error={!!errors.emailAddress}
                          helperText={getErrorMessage(errors.emailAddress)}
                        />
                      )}
                    />
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Phone Number"
                          variant="outlined"
                          placeholder="Enter Your Phone Number"
                          fullWidth
                          margin="normal"
                          error={!!errors.phoneNumber}
                          helperText={getErrorMessage(errors.phoneNumber)}
                        />
                      )}
                    />
                    <Controller
                      name="LandLineNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="LandLine Number"
                          variant="outlined"
                          placeholder="Enter Your LandLine Number"
                          fullWidth
                          margin="normal"
                          error={!!errors.LandLineNumber}
                          helperText={getErrorMessage(errors.LandLineNumber)}
                        />
                      )}
                    />
                    <Controller
                      name="TINNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="TIN No"
                          variant="outlined"
                          placeholder="TIN No"
                          fullWidth
                          margin="normal"
                          error={!!errors.TINNo}
                          helperText={getErrorMessage(errors.TINNo)}
                        />
                      )}
                    />
                    <Controller
                      name="GSTNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="GST No"
                          variant="outlined"
                          placeholder="GST No"
                          fullWidth
                          margin="normal"
                          error={!!errors.GSTNo}
                          helperText={getErrorMessage(errors.GSTNo)}
                        />
                      )}
                    />
                    <Controller
                      name="PanNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Pan Number"
                          variant="outlined"
                          placeholder="Pan No"
                          fullWidth
                          margin="normal"
                          error={!!errors.PanNo}
                          helperText={getErrorMessage(errors.PanNo)}
                        />
                      )}
                    />
                    <Controller
                      name="FSSAINo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="FSSAI Number"
                          variant="outlined"
                          placeholder="FSSAI Number"
                          fullWidth
                          margin="normal"
                          error={!!errors.FSSAINo}
                          helperText={getErrorMessage(errors.FSSAINo)}
                        />
                      )}
                    />
                  </>
                )}
                {activeStep === 1 && (
                  <>

                  </>
                )}
                {activeStep === 2 && (
                  <>
                    <Controller
                      name="address1"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Address 1"
                          variant="outlined"
                          placeholder="Enter Your Address 1"
                          fullWidth
                          margin="normal"
                          error={!!errors.address1}
                          helperText={getErrorMessage(errors.address1)}
                        />
                      )}
                    />
                    <Controller
                      name="address2"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Address 2"
                          variant="outlined"
                          placeholder="Enter Your Address 2"
                          fullWidth
                          margin="normal"
                          error={!!errors.address2}
                          helperText={getErrorMessage(errors.address2)}
                        />
                      )}
                    />
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Country"
                          variant="outlined"
                          placeholder="Enter Your Country Name"
                          fullWidth
                          margin="normal"
                          error={!!errors.country}
                          helperText={getErrorMessage(errors.country)}
                        />
                      )}
                    />
                  </>
                )}
                {activeStep === 3 && (
                  <>
                    <Controller
                      name="cardNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Card Number"
                          variant="outlined"
                          placeholder="Enter Your Card Number"
                          fullWidth
                          margin="normal"
                          error={!!errors.cardNumber}
                          helperText={getErrorMessage(errors.cardNumber)}
                        />
                      )}
                    />
                    <Controller
                      name="cardMonth"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Card Month"
                          variant="outlined"
                          placeholder="Enter Your Card Month"
                          fullWidth
                          margin="normal"
                          error={!!errors.cardMonth}
                          helperText={getErrorMessage(errors.cardMonth)}
                        />
                      )}
                    />
                    <Controller
                      name="cardYear"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Card Year"
                          variant="outlined"
                          placeholder="Enter Your Card Year"
                          fullWidth
                          margin="normal"
                          error={!!errors.cardYear}
                          helperText={getErrorMessage(errors.cardYear)}
                        />
                      )}
                    />

                  </>
                )}
                {activeStep === 4 && (
                  <>

                  </>
                )}


                <Box mt={2}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  {isStepOptional(activeStep) && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSkip}

                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    type="submit"
                    style={{ marginTop: "10px" }}
                  >
                    {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                  </Button>
                </Box>
              </form>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default UserProfile;
