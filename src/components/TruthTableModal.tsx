import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { useMediaQuery } from "@mui/material"
import nextChar from '../helpers/NextLetter';

export default function TruthTableModal(props: { drawerWidth: number, isOpen: boolean, setIsOpen: Function, truthTableData: number[][][] | string[][][] }) {
    const { isOpen, setIsOpen, truthTableData, drawerWidth } = props
    const handleClose = () => setIsOpen(false);
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
    let startingCharacter = "A"

    const style = {
        marginLeft: isMobile ? "auto" : `calc(${drawerWidth}px + 5vw)`,
        width: isMobile ? "90vw" : `calc(90vw - ${drawerWidth}px)`,
        marginTop: "10vh",
        overflow: "auto",
        marginRight: isMobile ? "auto" : "0",
        maxHeight: "80vh",
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

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
                        Assignment Truth Table
                    </Typography>
                    <br />
                    <TableContainer component={Paper}>
                        <Table sx={{ width: "100%" }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {
                                        [...Array(truthTableData[0][0].length)].map((_, index) => {
                                            const output = <TableCell key={`table-head-input-${index}`}>Input {startingCharacter}</TableCell>
                                            startingCharacter = nextChar(startingCharacter)
                                            return output
                                        })
                                    }
                                    {
                                        [...Array(truthTableData[0][1].length)].map((_, index) => {
                                            const output = <TableCell key={`table-head-output-${index}`}>Output {startingCharacter}</TableCell>
                                            startingCharacter = nextChar(startingCharacter)
                                            return output
                                        })
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {
                                    truthTableData.map((row, rowIndex) => {
                                        return (
                                            <TableRow key={`table-data-row-${rowIndex}`}>
                                                {row.map(value => {
                                                    return value.map((v, i) => {
                                                        return <TableCell key={`table-row-${rowIndex}-value-${i}`}>{v}</TableCell>
                                                    })
                                                })
                                                }
                                            </TableRow>
                                        )
                                    })
                                }

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Modal>
        </div>
    );
}
