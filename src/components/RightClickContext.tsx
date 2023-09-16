import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { GateType } from '../helpers/Gates';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import AddLinkIcon from '@mui/icons-material/AddLink';

export default function RightClickContext(props: { id: number, output: boolean, type: GateType, anchorElement: HTMLElement | null, handleClose: any, beginLinking: React.MouseEventHandler<HTMLElement>, removeGate: React.MouseEventHandler<HTMLElement>, removeOutgoingConnections: React.MouseEventHandler<HTMLElement>, toggleInput: React.MouseEventHandler<HTMLElement> }) {
    const { handleClose, id, beginLinking, type, anchorElement, removeGate, removeOutgoingConnections, toggleInput, output } = props

    const open = Boolean(anchorElement)
    return (
        <div>
            <Popover
                id={`${id}`}
                open={open}
                anchorEl={anchorElement}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Paper>
                    <MenuList>
                        <MenuItem onClick={beginLinking}>
                            <ListItemIcon>
                                <AddLinkIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Connect</ListItemText>
                        </MenuItem>
                        {type === GateType.INPUT && (
                            <MenuItem onClick={toggleInput}>
                                <ListItemIcon>
                                    {output ? <ToggleOffIcon color="error" fontSize="small" /> : <ToggleOnIcon color="success" fontSize="small" />}
                                </ListItemIcon>
                                <ListItemText>{output ? "Toggle Off" : "Toggle On"}</ListItemText>
                            </MenuItem>
                        )}
                        {![GateType.INPUT, GateType.OUTPUT].includes(type) && (
                            <MenuItem onClick={removeGate}>
                                <ListItemIcon>
                                    <DeleteOutlineIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Delete Gate</ListItemText>
                            </MenuItem>
                        )}
                        <MenuItem onClick={removeOutgoingConnections}>
                            <ListItemIcon>
                                <LinkOffIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Remove Output Links</ListItemText>
                        </MenuItem>
                    </MenuList>
                </Paper>
            </Popover>
        </div>
    );
}
