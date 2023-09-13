import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stepper from './Stepper';
import { useTheme } from '@mui/material/styles';
import Draggable from 'react-draggable';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { AndGate, NotGate, OrGate } from '../helpers/Gates';
import { Paper } from '@mui/material';
import { Gate } from '../helpers/Gates';

const drawerWidth = 240;

enum GateType {
  AND,
  OR,
  NOT,
  NAND,
  NOR,
  INPUT,
  OUTPUT
}

const PrimaryWindow = () => {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [gates, setGates] = React.useState([] as Gate[])
  const nodeRef = React.useRef(null)
  const archerContainerRef = React.useRef(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAddGate = (type: GateType) => {
    setGates(prevGates => {
      let newGate: any

      switch (type) {
        case GateType.AND:
          newGate = new AndGate(false, false, "https://img.icons8.com/nolan/96/logic-gates-and.png")
          break
        case GateType.OR:
          newGate = new OrGate(false, false, "https://img.icons8.com/nolan/96/logic-gates-or.png")
          break
        case GateType.NOT:
          newGate = new NotGate(false, "https://img.icons8.com/nolan/96/logic-gates-not.png")
          break
        case GateType.NAND:
          newGate = new OrGate(false, false, "https://img.icons8.com/nolan/96/logic-gates-nand.png")
          break
        case GateType.NOR:
          newGate = new OrGate(false, false, "https://img.icons8.com/nolan/96/logic-gates-nor.png")
          break
        default:
          break
      }

      newGate.output = true

      return [
        ...prevGates,
        newGate
      ]
    })
  }

  const handleDrag = () => {
    (archerContainerRef as any).current?.refreshScreen()
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="overline">Logical Gates</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ marginBottom: "50px" }}>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.AND)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-and.png" alt="logic-gates-and" />
            </ListItemIcon>
            <ListItemText primary={"AND"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.OR)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-or.png" alt="logic-gates-or" />
            </ListItemIcon>
            <ListItemText primary={"OR"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.NOT)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-not.png" alt="logic-gates-not" />
            </ListItemIcon>
            <ListItemText primary={"NOT"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.NAND)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nand.png" alt="logic-gates-nand" />
            </ListItemIcon>
            <ListItemText primary={"NAND"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.NOR)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nor.png" alt="logic-gates-nor" />
            </ListItemIcon>
            <ListItemText primary={"NOR"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" height="50px" src="https://img.icons8.com/nolan/96/login-rounded-right.png" alt="login-rounded-right" />
            </ListItemIcon>
            <ListItemText primary={"INPUT"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" height="50px" src="https://img.icons8.com/nolan/96/logout-rounded-left.png" alt="logout-rounded" />
            </ListItemIcon>
            <ListItemText primary={"OUTPUT"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Toolbar sx={{ position: "fixed", bottom: 0, width: `${drawerWidth - 1}px`, background: theme.palette.background.paper }}>
        <Typography variant="subtitle1">
          Icons by <a href="https://icons8.com">Icons8</a>
        </Typography>
      </Toolbar>
    </div>
  );

  return (
    <ArcherContainer
      ref={archerContainerRef}
      endShape={{
        arrow: {
          arrowLength: 10,
          arrowThickness: 20,
        }
      }}
    >
      <Box sx={{ display: 'flex', width: "100vw" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              CPTR-108: Lab 5 - Digital Logic Simulator
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            display: "block",
            [theme.breakpoints.down("sm")]: {
              width: `calc(100% - 20px)`
            },
            width: `calc(100% - ${drawerWidth}px - 20px)`,
            height: "calc(100vh - 64px - 48px - 20px)",
            position: "relative",
            marginLeft: "10px",
            marginTop: "10px",
          }}
        >
          {
            gates.map((gate, index) => {
              return (
                <Draggable
                  nodeRef={nodeRef}
                  axis="both"
                  bounds="parent"
                  key={`gate-${index}`}
                  handle=".handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  grid={[1, 1]}
                  scale={1}
                  onDrag={handleDrag}
                >
                  <Box
                    className="handle"
                    ref={nodeRef}
                    sx={{
                      width: "100px",
                      height: "100px",
                      border: `1px solid ${theme.palette.primary.main}`,
                      borderRadius: "5px",
                      position: "absolute",
                      "&:hover": {
                        cursor: "pointer"
                      },
                    }}
                  >
                    <ArcherElement
                      id={`gate-${index}`}
                      relations={index > 2 ? [] : [{
                        targetId: 'gate-3',
                        targetAnchor: 'left',
                        sourceAnchor: 'right',
                        style: {
                          strokeColor: gate.output ? "#00ff00" : "#ff0000",
                          endShape: {
                            circle: {
                              fillColor: "#ffffff",
                              radius: 3,
                              strokeColor: "#ffffff",
                            }
                          }
                        }
                      }]}
                    >
                      <Paper elevation={9} component={"div"} style={{
                        width: "100%",
                        height: "100%",
                        background: `url("${gate.imgSrc}")`
                      }}>
                        <div 
                          style={{
                            position: "relative",
                            top: gate instanceof NotGate ? "40px" : "25px"
                          }}
                          className="input-output">
                            { gate.input0 ? "1" : "0"}
                          </div>
                        { !(gate instanceof NotGate) && (
                          <div 
                          style={{
                            position: "relative",
                            top: "35px"
                          }}
                          className="input-output">
                            { gate.input1 ? "1" : "0" }
                          </div>
                        )}
                        <div 
                          style={{
                            position: "relative",
                            top: gate instanceof NotGate ? "20px" : "0px",
                            left: "70px",
                          }}
                          className="input-output">
                            { gate.input1 ? "1" : "0" }
                        </div>
                      </Paper>
                    </ArcherElement>
                  </Box>
                </Draggable>
              )
            })}
          <Stepper drawerWidth={drawerWidth} />
        </Box>
      </Box>
    </ArcherContainer>
  );
}

export default PrimaryWindow
