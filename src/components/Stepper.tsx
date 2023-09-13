import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const Stepper = (props: { drawerWidth: number }) => {
  const theme = useTheme();
  const { drawerWidth } = props
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <MobileStepper
      variant="dots"
      steps={6}
      position="static"
      activeStep={activeStep}
      sx={{
        [theme.breakpoints.up("sm")]: {
            position: "fixed",
            bottom: 0,
            left: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
        },
        [theme.breakpoints.down("sm")]: {
            position: "fixed",
            bottom: 0,
            width: "100%",
            left: 0,
        }
      }}
      nextButton={
        <Button variant="outlined" size="small" onClick={handleNext} disabled={activeStep === 5}>
          Next
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </Button>
      }
      backButton={
        <Button variant={activeStep === 0 ? "text" : "outlined"} size="small" onClick={handleBack} disabled={activeStep === 0}>
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
          Back
        </Button>
      }
    />
  );
}

export default Stepper
