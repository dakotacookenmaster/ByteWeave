import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Instruction } from '../data/Assignment.type';
import { Button } from '@mui/material';

const style = {
    margin: "0 auto",
    maxWidth: "600px",
    width: "100%",
    marginTop: "40px",
    height: "80vh",
    overflow: "auto",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function BasicModal(props: { isOpen: boolean, setIsOpen: Function, data: Instruction }) {
    const { isOpen, setIsOpen, data } = props
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
                        {data.title}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                        {data.description}
                    </Typography>
                    <br />
                    <Typography variant="h6" sx={{marginBottom: "10px"}}>
                        Provided Resources
                    </Typography>
                    <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap"}}>
                        {
                            data.resources.map(resource => {
                                return (
                                    <Button key={resource.link} target="_blank" href={resource.link} variant="outlined">{resource.title}</Button>
                                )
                            })
                        }
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
