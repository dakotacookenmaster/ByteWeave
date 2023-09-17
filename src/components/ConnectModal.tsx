import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { Gate } from '../helpers/Gates';

const style = {
    margin: "0 auto",
    marginTop: "10vh",
    width: "fit-content",
    overflow: "auto",
    maxHeight: "80vh",
    bgcolor: 'background.paper',
    border: '2px solid #000',
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: 24,
    p: 4,
};

export default function ConnectModal(props: { receivingGate: Gate | undefined, isOpen: boolean, setIsOpen: Function, setConnectionSelection: Function, handleCompleteConnect: React.MouseEventHandler<HTMLButtonElement> }) {
    const { isOpen, setIsOpen, handleCompleteConnect, receivingGate, setConnectionSelection } = props
    const handleClose = () => setIsOpen(false)

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <FormControl>
                        <FormLabel id="receiving-pins">Receiving Pins</FormLabel>
                        <RadioGroup
                            aria-labelledby="receiving-pins"
                            name="receiving-pins"
                            defaultValue={receivingGate?.inputs.map((input, index) => {
                                if(!input.gate) {
                                    return `${index}`
                                }
                            })[0]}
                            onChange={(event) => {
                                const { value } = event.target
                                setConnectionSelection((prevConnectionSelection: any) => {
                                    return {
                                        ...prevConnectionSelection,
                                        input: +value
                                    }
                                })
                            }}
                        >
                            {
                                receivingGate?.inputs.map((input, index) => {
                                    if (!input.gate) {
                                        return (
                                            <FormControlLabel
                                                key={`input-connection-${index}`}
                                                value={`${index}`}
                                                control={<Radio />}
                                                label={input.label.trim() !== "" ? input.label : `Input #${index}`}
                                            />
                                        )
                                    }
                                })
                            }
                        </RadioGroup>
                    </FormControl>
                    <Button variant="outlined" sx={{ marginTop: "30px auto" }} onClick={handleCompleteConnect}>Submit</Button>
                </Box>
            </Modal>
        </div>
    );
}
