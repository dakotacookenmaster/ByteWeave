import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { useMediaQuery } from "@mui/material"
import nextChar from '../helpers/NextLetter';
import { Gate, GateType } from '../helpers/Gates';
import { enqueueSnackbar } from 'notistack';
import { cloneDeep } from 'lodash';
import React from 'react';

export default function TruthTableModal(props: { gates: Gate[], drawerWidth: number, isOpen: boolean, setIsOpen: Function, truthTableData: number[][][] | string[][][] }) {
    const { isOpen, setIsOpen, truthTableData, drawerWidth } = props
    const gates = cloneDeep(props.gates)
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

    const outputValues: boolean[][] = []

    const inputs = gates.filter(gate => gate.type === GateType.INPUT).sort((a, b) => {
        return a.id - b.id
    })

    const outputs = gates.filter(gate => gate.type === GateType.OUTPUT).sort((a, b) => {
        return a.id - b.id
    })

    if (inputs.length !== truthTableData[0][0].length || outputs.length !== truthTableData[0][1].length) {
        // the user didn't provide the right number of inputs or outputs (idk how they'd change this, but it's good to check)
        return
    }
    for (let i = 0; i < truthTableData.length; i++) {
        outputValues.push([])
        for (let j = 0; j < inputs.length; j++) {
            // set all of the inputs to their appropriate values for testing
            inputs[j].output = Boolean(truthTableData[i][0][j])
            try {
                inputs[j].autoGrader([])
            } catch (error) {
                enqueueSnackbar("Cycles are not currently for automatic truth table generation.", { variant: "warning" })
                return
            }
        }
        for (let k = 0; k < outputs.length; k++) {
            outputValues[i].push(outputs[k].output!)
        }
    }

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
                                            const output = <TableCell sx={{ textAlign: "center" }} key={`table-head-input-${index}`}>Input {startingCharacter}</TableCell>
                                            startingCharacter = nextChar(startingCharacter)
                                            return output
                                        })
                                    }
                                    {
                                        [...Array(truthTableData[0][1].length)].map((_, index) => {
                                            const output = <TableCell colSpan={2} sx={{ textAlign: "center" }} key={`table-head-output-${index}`}>Output {startingCharacter}</TableCell>
                                            startingCharacter = nextChar(startingCharacter)
                                            return output
                                        })
                                    }
                                </TableRow>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        Expected
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        Actual
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {
                                    truthTableData.map((row, rowIndex) => {
                                        return (
                                            <TableRow key={`table-data-row-${rowIndex}`}>
                                                {
                                                    row[0].map((v, i) => {
                                                        return <TableCell sx={{ textAlign: "center" }} key={`table-row-${rowIndex}-input-value-${i}`}>{v}</TableCell>
                                                    })
                                                }
                                                {
                                                    row[1].map((v, i) => {
                                                        const outputValue = outputValues[rowIndex][i] ? 1 : 0
                                                        return (
                                                            <React.Fragment key={`table-row-${rowIndex}-output-value-${i}`}>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{v}</TableCell>
                                                                <TableCell sx={{ textAlign: "center", fontWeight: "bold", color: outputValue === v ? "green" : "red" }}>{outputValue}</TableCell>
                                                            </React.Fragment>
                                                        )
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
