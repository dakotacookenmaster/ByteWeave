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
import { AndGate, InputGate, NandGate, NorGate, NotGate, OrGate, OutputGate } from '../helpers/Gates';
import { Paper } from '@mui/material';
import { Gate } from '../helpers/Gates';
import { cloneDeep, repeat } from 'lodash';
import nextChar from '../helpers/NextLetter';

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
  const [selected, setSelected] = React.useState([] as number[])
  const archerContainerRef = React.useRef(null)
  const [id, setId] = React.useState(0)
  const [inputLabel, setInputLabel] = React.useState("A")
  const [outputLabel, setOutputLabel] = React.useState("A")

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setGates(prevGates => {
        const copyPrevGates = cloneDeep(prevGates)
        for(let gate of copyPrevGates) {
          gate.decide()
        }
        return copyPrevGates
      })
    }, 50)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const updateLabel = (type: "input" | "output") => {
    const setter = (prevLabel: string) => {
      return nextChar(prevLabel)
    }

    if(type === "input") {
      setInputLabel(setter)
    } else {
      setOutputLabel(setter)
    }
  }

  React.useEffect(() => {
    const escapeListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected([])
      }
    }

    const deleteListener = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        setSelected(prevSelected => {
          if (prevSelected.length === 1) {
            setGates(prevGates => {
              const copyPrevGates = cloneDeep(prevGates)
              const gate = copyPrevGates.find(gate => gate.id === prevSelected[0])
              if (!gate) {
                return prevGates
              }
              if (gate instanceof OutputGate) {
                return prevGates
              }
              gate.dependencies = gate.dependencies.filter(dependency => {
                if (dependency.input0?.id === prevSelected[0]) {
                  dependency.input0 = undefined
                  // dependency.decide()
                } else {
                  if (!(dependency instanceof NotGate)) {
                    dependency.input1 = undefined
                    // dependency.decide()
                  }
                }
                return false
              })

              return copyPrevGates
            })
          }

          return [] as number[]
        })
      }
    }

    const oListener = (event: KeyboardEvent) => {
      if (event.key === "o") {
        setSelected(prevSelected => {
          if (prevSelected.length === 1) {
            setGates(prevGates => {
              const foundGate = prevGates.find(gate => gate.id === prevSelected[0])
              if (foundGate instanceof InputGate) {
                const copyPrevGates = cloneDeep(prevGates)
                foundGate.output = !foundGate.output
                // foundGate.decide()
                return copyPrevGates
              }

              return prevGates
            })
          }

          return [] as number[]
        })
      }
    }

    const rListener = (event: KeyboardEvent) => {
      if (event.key === "r") {
        setSelected(prevSelected => {
          setGates(prevGates => {
            const copyPrevGates = cloneDeep(prevGates)
            const gate = copyPrevGates.find(g => g.id === prevSelected[0])
            if (!gate) {
              return prevGates
            }

            if (gate instanceof OutputGate) {
              for (let input of gate.inputs) {
                input.dependencies = input.dependencies.filter(dependency => dependency.id !== gate.id)
              }

              return prevGates.filter(g => g.id !== gate.id)
            }

            gate.dependencies = gate.dependencies.filter((dependency) => {
              if (dependency.input0?.id === gate.id) {
                dependency.input0 = undefined
              }
              if (dependency.input1?.id === gate.id) {
                dependency.input1 = undefined
              }
              // dependency.decide()

              return false
            })

            if (gate.input0) {
              gate.input0.dependencies = gate.input0.dependencies.filter(dependency => {
                return dependency.id !== gate.id
              })
            }
            if (gate.input1) {
              gate.input1.dependencies.filter(dependency => {
                return dependency.id !== gate.id
              })
            }

            return copyPrevGates.filter(g => g.id !== gate.id)
          })
          return []
        })
      }
    }

    window.addEventListener("keydown", escapeListener)
    window.addEventListener("keydown", deleteListener)
    window.addEventListener("keydown", oListener)
    window.addEventListener("keydown", rListener)

    return () => {
      window.removeEventListener("keydown", escapeListener)
      window.removeEventListener("keydown", deleteListener)
      window.removeEventListener("keydown", oListener)
      window.removeEventListener("keydown", rListener)
    }
  }, [])

  const handleAddGate = (type: GateType) => {
    setGates(prevGates => {
      let newGate: any

      switch (type) {
        case GateType.AND:
          newGate = new AndGate("https://img.icons8.com/nolan/96/logic-gates-and.png", id)
          break
        case GateType.OR:
          newGate = new OrGate("https://img.icons8.com/nolan/96/logic-gates-or.png", id)
          break
        case GateType.NOT:
          newGate = new NotGate("https://img.icons8.com/nolan/96/logic-gates-not.png", id)
          break
        case GateType.NAND:
          newGate = new NandGate("https://img.icons8.com/nolan/96/logic-gates-nand.png", id)
          break
        case GateType.NOR:
          newGate = new NorGate("https://img.icons8.com/nolan/96/logic-gates-nor.png", id)
          break
        case GateType.INPUT:
          newGate = new InputGate("https://img.icons8.com/nolan/96/login-rounded-right.png", id, `IN: ${inputLabel}`)
          updateLabel("input")
          break
        case GateType.OUTPUT:
          newGate = new OutputGate("https://img.icons8.com/nolan/96/logout-rounded-left.png", id, `OUT: ${outputLabel}`)
          updateLabel("output")
          break
        default:
          break
      }

      setId(prevId => prevId + 1)

      return [
        ...prevGates,
        newGate
      ]
    })
  }

  const handleDrag = () => {
    (archerContainerRef as any).current?.refreshScreen()
  }

  React.useEffect(() => {
    if (selected.length === 2) {
      setGates(prevGates => {
        const copyPrevGates = cloneDeep(prevGates)
        const receivingGate = copyPrevGates.find(gate => gate.id === selected[1])
        const inputtingGate = copyPrevGates.find(gate => gate.id === selected[0])

        if (!receivingGate || !inputtingGate) {
          return prevGates
        }

        if (receivingGate instanceof InputGate) {
          return prevGates
        }

        if (receivingGate instanceof OutputGate) {
          const existingGate = receivingGate.inputs.find(g => g.id === inputtingGate.id)
          if (!existingGate) {
            receivingGate.inputs.push(inputtingGate)
            inputtingGate.dependencies.push(receivingGate)
            // receivingGate.decide()
          }
          return copyPrevGates
        }

        if (
          inputtingGate.id === receivingGate.input0?.id ||
          inputtingGate.id === receivingGate.input1?.id ||
          inputtingGate.input0?.id === receivingGate.id ||
          inputtingGate.input1?.id === receivingGate.id
        ) {
          return prevGates
        }

        if (receivingGate.input0 && receivingGate instanceof NotGate) {
          return prevGates
        }
        if (receivingGate.input0 && receivingGate.input1) {
          return prevGates
        }

        inputtingGate.dependencies.push(receivingGate)

        if (!receivingGate.input0) {
          receivingGate.input0 = inputtingGate
          // receivingGate.decide()
          return copyPrevGates
        } else {
          receivingGate.input1 = inputtingGate
          // receivingGate.decide()
          return copyPrevGates
        }
      })
      setSelected([])
    }
  }, [selected])

  const handleSelect = (id: number) => {
    setSelected(prevSelected => {
      const newData = [...prevSelected]
      if (newData.includes(id)) {
        const foundIndex = newData.findIndex(value => value === id)
        newData.splice(foundIndex, 1)
      } else {
        newData.push(id)
      }
      return newData
    })
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
        <ListItem disablePadding onClick={() => handleAddGate(GateType.INPUT)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" height="50px" src="https://img.icons8.com/nolan/96/login-rounded-right.png" alt="login-rounded-right" />
            </ListItemIcon>
            <ListItemText primary={"INPUT"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={() => handleAddGate(GateType.OUTPUT)}>
          <ListItemButton>
            <ListItemIcon>
              <img width="50px" className="output-right" height="50px" src="https://img.icons8.com/nolan/96/logout-rounded-left.png" alt="logout-rounded" />
            </ListItemIcon>
            <ListItemText primary={"OUTPUT"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Toolbar sx={{ position: "fixed", display: "flex", flexDirection: "column", gap: "10px", bottom: 0, width: `${drawerWidth - 1}px`, background: theme.palette.background.paper }}>
        <Typography variant="subtitle1" sx={{ fontSize: "12px" }}>
          Designed by Dakota Cookenmaster
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: "12px" }}>
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
            width: `calc(100% - ${drawerWidth}px - 65px)`,
            height: "calc(100vh - 64px - 48px - 60px)",
            position: "relative",
            marginLeft: "30px",
            marginTop: "50px",
          }}
        >
          {
            gates.map(gate => {
              const ref = React.createRef<HTMLElement>()
              return (
                <Draggable
                  nodeRef={ref}
                  axis="both"
                  bounds="parent"
                  key={`gate-${gate.id}`}
                  handle=".handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  grid={[1, 1]}
                  scale={1}
                  onDrag={handleDrag}
                >
                  <Box
                    className="handle"
                    ref={ref}
                    key={`box-${gate.id}`}
                    onDoubleClick={() => handleSelect(gate.id)}
                    sx={{
                      width: "80px",
                      height: "80px",
                      border: `1px solid ${selected.includes(gate.id) ? "green" : theme.palette.primary.main}`,
                      borderRadius: "5px",
                      position: "absolute",
                      "&:hover": {
                        cursor: "pointer"
                      },
                    }}
                  >
                    <Paper elevation={9} component={"div"} style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      background: gate instanceof OutputGate ? "none" : `url("${gate.imgSrc}")`,
                      backgroundSize: gate instanceof OutputGate ? "" : "cover",
                    }} sx={(gate instanceof OutputGate) ? {
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        background: `url("${gate.imgSrc}")`,
                        backgroundSize: "contain",
                        transform: "rotate(180deg)"
                      }
                    } : {}}>
                      {!(gate instanceof InputGate) && !(gate instanceof OutputGate) && (
                        <ArcherElement
                          id={`gate-${gate.id}-input0`}
                        >
                          <div
                            style={{
                              position: "relative",
                              top: gate instanceof NotGate ? "30px" : "15px",
                              left: "-25px",
                              background: gate.input0?.output ? "green" : "red",
                            }}
                            className="input-output">
                            {gate.input0?.output ? "1" : "0"}
                          </div>
                        </ArcherElement>
                      )}
                      {(gate instanceof OutputGate) && (
                        <ArcherElement
                          id={`gate-${gate.id}-inputs`}
                        >
                          <div
                            style={{
                              position: "relative",
                              top: "29px",
                              left: "-26px",
                              background: gate.output ? "green" : "red",
                            }}
                            className="input-output">
                            {gate.output ? "1" : "0"}
                          </div>
                        </ArcherElement>
                      )}
                      {!(gate instanceof NotGate) && !(gate instanceof InputGate) && !(gate instanceof OutputGate) && (
                        <ArcherElement
                          id={`gate-${gate.id}-input1`}
                        >
                          <div
                            style={{
                              position: "relative",
                              top: "20px",
                              left: "-25px",
                              background: gate.input1?.output ? "green" : "red",
                            }}
                            className="input-output">
                            {gate.input1?.output ? "1" : "0"}
                          </div>
                        </ArcherElement>
                      )}
                      <ArcherElement
                        id={`gate-${gate.id}-output`}
                        relations={gate.dependencies.map(dependency => {
                          return {
                            targetId: dependency instanceof OutputGate ? `gate-${dependency.id}-inputs` : `gate-${dependency.id}-${dependency.input0?.id === gate.id ? "input0" : "input1"}`,
                            targetAnchor: 'left',
                            sourceAnchor: 'right',
                            style: {
                              strokeColor: gate.output ? "#00ff00" : "#ff0000",
                              endMarker: false,
                            }
                          }
                        })}
                      >
                        <div
                          style={{
                            position: "relative",
                            top: gate instanceof NotGate || gate instanceof OutputGate ? "7px" : gate instanceof InputGate ? "30px" : "-12px",
                            left: "85px",
                            background: gate.output ? "green" : "red",
                          }}
                          className="input-output"
                        >
                          {gate.output ? "1" : "0"}
                        </div>
                      </ArcherElement>
                      {(gate instanceof InputGate || gate instanceof OutputGate) && (
                        <Typography sx={{
                          background: theme.palette.primary.dark,
                          color: theme.palette.text.primary,
                          fontWeight: "bold",
                          display: "block",
                          top: gate instanceof InputGate ? "-60px" : "-80px",
                        }} variant="overline" className="label">{gate.label}</Typography>
                      )}
                    </Paper>
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
