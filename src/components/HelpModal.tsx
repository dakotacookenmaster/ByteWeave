import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import "../App.css"

const style = {
    margin: "0 auto",
    maxWidth: "600px",
    width: "100%",
    marginTop: "140px",
    height: "250px",
    overflow: "auto",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function HelpModal(props: { isOpen: boolean, setIsOpen: Function }) {
    const { isOpen, setIsOpen } = props
    const handleClose = () => setIsOpen(false);

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        How to use the Simulator
                    </Typography>
                    <hr />
                    <Box className="help-box">
                        <Typography sx={{ color: "primary.main", fontWeight: "bold" }} variant="overline" className="keyText">Double Click</Typography>
                        <Typography>Select a given gate</Typography>
                    </Box>
                    <Box className="help-box">
                        <Typography sx={{ color: "primary.main", fontWeight: "bold" }} variant="overline" className="keyText">Double Click</Typography>
                        <Typography>While another gate is selected, double click on a new gate to draw a connection.</Typography>
                    </Box>
                    <Box className="help-box">
                        <Typography sx={{ color: "primary.main", fontWeight: "bold" }} variant="overline" className="keyText">Delete</Typography>
                        <Typography>Remove the outgoing connections from the selected gate</Typography>
                    </Box>
                    <Box className="help-box">
                        <Typography sx={{ color: "primary.main", fontWeight: "bold" }} variant="overline" className="keyText">R</Typography>
                        <Typography>Remove the selected gate from the window</Typography>
                    </Box>
                    <Box className="help-box">
                        <Typography sx={{ color: "primary.main", fontWeight: "bold" }} variant="overline" className="keyText">O</Typography>
                        <Typography>Toggle the output of the selected input</Typography>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
