import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import untypedData from "../data/assignment.json"
import { Assignment } from '../data/Assignment.type';

const data: Assignment = untypedData

const Stepper = (props: { drawerWidth: number, setActiveStep: Function, activeStep: number, canMove: boolean, setCanMove: Function }) => {
  const theme = useTheme();
  const { drawerWidth, setActiveStep, activeStep, canMove, setCanMove } = props
  
  const maximumSteps = data.questions.length - 1

  const handleNext = () => {
    setActiveStep((prevActiveStep: number) => prevActiveStep + 1);
    setCanMove(false)
  };

  return (
    <MobileStepper
      variant="dots"
      steps={maximumSteps}
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
        <Button variant="outlined" size="small" onClick={handleNext} disabled={activeStep === maximumSteps || !canMove}>
          Next
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </Button>
      }
      backButton={<div></div>}
    />
  );
}

export default Stepper
