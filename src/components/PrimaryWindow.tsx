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
import { AndGate, InputGate, Labeled, NandGate, NorGate, NotGate, OrGate, OutputGate } from '../helpers/Gates';
import { Button, Paper, useMediaQuery } from '@mui/material';
import { Gate, GateType } from '../helpers/Gates';
import { cloneDeep, isEqual } from 'lodash';
import nextChar from '../helpers/NextLetter';
import untypedData from "../data/assignment.json"
import { Assignment } from "../data/Assignment.type"
import BasicModal from './BasicModal';
import { useSnackbar } from 'notistack';
import RightClickContext from './RightClickContext';
import { green } from '@mui/material/colors';
import { VERSION } from '../constants';
import GradingIcon from '@mui/icons-material/Grading';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const data: Assignment = untypedData

const drawerWidth = 240;

const PrimaryWindow = () => {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [gates, setGates] = React.useState([] as Gate[])
  const [selected, setSelected] = React.useState<number>(-1)
  const archerContainerRef = React.useRef(null)
  const [id, setId] = React.useState(0)
  const [inputLabel, setInputLabel] = React.useState("A")
  const [outputLabel, setOutputLabel] = React.useState("A")
  const [activeStep, setActiveStep] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(true)
  const [canMove, setCanMove] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(null)
  const [rightClickContextGate, setRightClickContextGate] = React.useState({
    id: -1,
    type: GateType.INPUT,
    output: false,
  })
  const [timer, setTimer] = React.useState<number | null>()
  const isMobile = useMediaQuery("(max-width: 1000px)")

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  React.useEffect(() => {
    if (selected !== -1) {
      document.body.style.cursor = "crosshair"
    } else {
      document.body.style.cursor = "default"
    }
  }, [selected])

  const handleRightClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault() // Stop the default right click context from appearing
    setAnchorElement(event.currentTarget)
  }

  const handleLongTouch = (event: any, gate: Gate) => {
    event.preventDefault()
    event.currentTarget = event.target
    setRightClickContextGate({
      id: gate.id,
      type: gate.type,
      output: Boolean(gate.output)
    })

    handleRightClick(event)
  }

  const handleTouchEnd = () => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
  }

  const handleTouchMove = handleTouchEnd

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setGates(prevGates => {
        const copyPrevGates = cloneDeep(prevGates)
        for (let gate of copyPrevGates) {
          gate.decide()
        }
        if (isEqual(prevGates, copyPrevGates)) {
          return prevGates
        }
        return copyPrevGates
      })
    }, 50)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const checkAnswer = () => {
    const truthTable = data.questions[activeStep].answer.truthTable
    const inputs = gates.filter(gate => gate.type === GateType.INPUT).sort((a, b) => {
      return a.id - b.id
    })
    const outputs = gates.filter(gate => gate.type === GateType.OUTPUT).sort((a, b) => {
      return a.id - b.id
    })

    if (inputs.length !== truthTable[0][0].length || outputs.length !== truthTable[0][1].length) {
      // the user didn't provide the right number of inputs or outputs (idk how they'd change this, but it's good to check)
      return
    }
    for (let i = 0; i < truthTable.length; i++) {
      // Test inputs first
      let originalOutput = []
      for (let j = 0; j < inputs.length; j++) {
        // set all of the inputs to their appropriate values for testing
        originalOutput.push(inputs[j].output)
        inputs[j].output = Boolean(truthTable[i][0][j])
        try {
          inputs[j].autoGrader([])
        } catch (error) {
          enqueueSnackbar("Cycles are not currently supported for the autograder.", { variant: "warning" })
          return
        }
      }
      let failed = false
      for (let j = 0; j < outputs.length; j++) {
        if (Boolean(truthTable[i][1][j]) !== outputs[j].output) {
          enqueueSnackbar("Hm, that's not quite right...", { variant: "error" })
          failed = true
          break
        }
      }
      // reset all the inputs from the autograder
      for (let j = 0; j < inputs.length; j++) {
        inputs[j].output = originalOutput[j]
        try {
          inputs[j].autoGrader([])
        } catch (error) {
          enqueueSnackbar("Cycles are not currently supported for the autograder.", { variant: "warning" })
          return
        }
      }
      if (failed) {
        return
      }
    }

    // otherwise they made it!
    enqueueSnackbar("You got it!", { variant: "success" })
    setCanMove(true)
  }

  const checkGatesInQuestion = (gate: ("AND" | "OR" | "NOT" | "NAND" | "NOR" | "INPUT" | "OUTPUT")): boolean => {
    return data.gatesProvidedInEveryQuestion.includes(gate) || data.questions[activeStep].gatesProvided.includes(gate)
  }

  const updateLabel = (type: "input" | "output") => {
    const setter = (prevLabel: string) => {
      return nextChar(prevLabel)
    }

    if (type === "input") {
      setInputLabel(setter)
    } else {
      setOutputLabel(setter)
    }
  }

  const resetCurrentGate = () => {
    setRightClickContextGate({
      id: -1,
      type: GateType.INPUT,
      output: false
    })
  }

  const removeOutgoingConnections = (id: number) => {
    setGates(prevGates => {
      const copyPrevGates = cloneDeep(prevGates)
      const gate = copyPrevGates.find(gate => gate.id === id)
      if (!gate) {
        return prevGates
      }
      gate.dependencies = gate.dependencies.filter(dependency => {
        if (dependency.input0?.id === gate.id) {
          dependency.input0 = undefined
        } else {
          if (![GateType.NOT, GateType.OUTPUT].includes(dependency.type)) {
            dependency.input1 = undefined
          }
        }
        return false
      })

      return copyPrevGates
    })
    setAnchorElement(null)
    resetCurrentGate()
  }

  const toggleInput = (id: number) => {
    setGates(prevGates => {
      const copyPrevGates = cloneDeep(prevGates)
      const foundGate = copyPrevGates.find(gate => gate.id === id)
      if (foundGate?.type === GateType.INPUT) {
        foundGate.output = !foundGate.output
        return copyPrevGates
      }

      return prevGates
    })
    setAnchorElement(null)
    resetCurrentGate()
  }

  const removeGate = (id: number) => {
    setGates(prevGates => {
      const copyPrevGates = cloneDeep(prevGates)
      const gate = copyPrevGates.find(g => g.id === id)
      if (!gate) {
        return prevGates
      }

      if (data.questions[activeStep].answer.outputs.length !== 0 && (gate.type === GateType.OUTPUT || gate.type === GateType.INPUT)) {
        return prevGates
      }


      gate.dependencies = gate.dependencies.filter((dependency) => {
        if (dependency.input0?.id === gate.id) {
          dependency.input0 = undefined
        }
        if (dependency.input1?.id === gate.id) {
          dependency.input1 = undefined
        }

        return false
      })

      if (gate.input0) {
        gate.input0.dependencies = gate.input0.dependencies.filter(dependency => {
          return dependency.id !== gate.id
        })
      }
      if (gate.input1) {
        gate.input1.dependencies = gate.input1.dependencies.filter(dependency => {
          return dependency.id !== gate.id
        })
      }

      return copyPrevGates.filter(g => g.id !== gate.id)
    })
    setAnchorElement(null)
    resetCurrentGate()
  }

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

  React.useEffect(() => {
    setGates(_ => {
      let newId = id
      let newLabel = "A"
      const newGates = []
      const question = data.questions[activeStep]
      for (let i = 0; i < question.answer.inputs.length; i++) {
        const newGate = new InputGate("https://img.icons8.com/nolan/96/login-rounded-right.png", newId, `IN: ${newLabel}`, [question.answer.inputs[i].defaultXPosition, question.answer.inputs[i].defaultYPosition])
        newGates.push(newGate)
        newId++
        newLabel = nextChar(newLabel)
      }
      for (let i = 0; i < question.answer.outputs.length; i++) {
        const newGate = new OutputGate("https://img.icons8.com/nolan/96/logout-rounded-left.png", newId, `OUT: ${newLabel}`, [question.answer.outputs[i].defaultXPosition, question.answer.outputs[i].defaultYPosition])
        newGates.push(newGate)
        newId++
        newLabel = nextChar(newLabel)
      }
      setId(newId)
      setInputLabel(newLabel)
      return newGates
    })
    setIsOpen(true)
    document.title = `${data.assignmentName} | ${data.questions[activeStep].instructions.title}`
    setCanMove(data.canSkipAnyQuestion || Boolean(data.questions[activeStep].canSkip))
  }, [activeStep])

  const handleDrag = () => {
    (archerContainerRef as any).current?.refreshScreen()
  }

  const handleConnect = (id: number) => {
    if (selected !== -1) {
      setGates(prevGates => {
        const copyPrevGates = cloneDeep(prevGates)
        const receivingGate = copyPrevGates.find(gate => gate.id === id)
        const inputtingGate = copyPrevGates.find(gate => gate.id === selected)

        if (!receivingGate || !inputtingGate) {
          return prevGates
        }

        if (receivingGate instanceof InputGate) {
          return prevGates
        }

        if ((receivingGate.input0 && receivingGate instanceof NotGate) || (receivingGate.input0 && receivingGate instanceof OutputGate)) {
          return prevGates
        }
        if (receivingGate.input0 && receivingGate.input1) {
          return prevGates
        }

        inputtingGate.dependencies.push(receivingGate)

        if (!receivingGate.input0) {
          receivingGate.input0 = inputtingGate
          return copyPrevGates
        } else {
          receivingGate.input1 = inputtingGate
          return copyPrevGates
        }
      })
      setSelected(-1)
    }
  }

  const handleTouchStart = (event: any, gate: Gate) => {
    if (selected === -1) {
      setTimer(setTimeout(() => handleLongTouch(event, gate), 800))
    } else {
      handleConnect(gate.id)
    }
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="overline">Logical Gates</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ marginBottom: "50px" }}>
        {checkGatesInQuestion("AND") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.AND)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-and.png" alt="logic-gates-and" />
              </ListItemIcon>
              <ListItemText primary={"AND"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("OR") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.OR)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-or.png" alt="logic-gates-or" />
              </ListItemIcon>
              <ListItemText primary={"OR"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NOT") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.NOT)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-not.png" alt="logic-gates-not" />
              </ListItemIcon>
              <ListItemText primary={"NOT"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NAND") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.NAND)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nand.png" alt="logic-gates-nand" />
              </ListItemIcon>
              <ListItemText primary={"NAND"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NOR") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.NOR)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nor.png" alt="logic-gates-nor" />
              </ListItemIcon>
              <ListItemText primary={"NOR"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("INPUT") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.INPUT)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" height="50px" src="https://img.icons8.com/nolan/96/login-rounded-right.png" alt="login-rounded-right" />
              </ListItemIcon>
              <ListItemText primary={"INPUT"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("OUTPUT") && (
          <ListItem disablePadding onClick={() => handleAddGate(GateType.OUTPUT)}>
            <ListItemButton>
              <ListItemIcon>
                <img width="50px" className="output-right" height="50px" src="https://img.icons8.com/nolan/96/logout-rounded-left.png" alt="logout-rounded" />
              </ListItemIcon>
              <ListItemText primary={"OUTPUT"} />
            </ListItemButton>
          </ListItem>
        )}

      </List>
      <Toolbar sx={{ position: "fixed", display: "flex", justifyContent: "left", flexDirection: "column", gap: "10px", bottom: 0, width: `${drawerWidth - 1}px`, background: "none" }}>
        <Typography variant="subtitle1" sx={{ fontSize: "12px" }}>
          Designed by Dakota Cookenmaster
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: "12px" }}>
          Version {VERSION} &#8226; Icons by <a href="https://icons8.com">Icons8</a>
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
      <BasicModal isOpen={isOpen} setIsOpen={setIsOpen} data={data.questions[activeStep].instructions} />
      {rightClickContextGate.id !== -1 && (<RightClickContext
        inputLength={data.questions[activeStep].answer.inputs.length}
        outputLength={data.questions[activeStep].answer.outputs.length}
        id={rightClickContextGate.id}
        beginLinking={() => {
          setAnchorElement(null)
          setSelected(rightClickContextGate.id)
        }}
        output={Boolean(rightClickContextGate.output)}
        type={rightClickContextGate.type}
        toggleInput={() => toggleInput(rightClickContextGate.id)}
        removeGate={() => removeGate(rightClickContextGate.id)}
        removeOutgoingConnections={() => removeOutgoingConnections(rightClickContextGate.id)}
        anchorElement={anchorElement}
        handleClose={() => {
          setAnchorElement(null)
          resetCurrentGate()
        }}
      />
      )}
      <Box onClick={() => setSelected(-1)} sx={{ display: 'flex', width: "100vw" }}>
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
              {data.assignmentName}
            </Typography>
            <Box sx={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
              {isMobile ? (
                <>
                  <IconButton color="primary" onClick={() => checkAnswer()}>
                    <CheckCircleIcon />
                  </IconButton>
                  <IconButton color="primary">
                    <GradingIcon onClick={() => setIsOpen(true)} />
                  </IconButton>
                </>
              ) : (
                <>
                  {(data.questions[activeStep].answer.inputs.length !== 0 || data.questions[activeStep].answer.outputs.length !== 0) && (<Button onClick={() => checkAnswer()} variant="outlined">Check Answer</Button>)}
                  <Button onClick={() => setIsOpen(true)} variant="outlined">View Instructions</Button>
                </>
              )}

            </Box>
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
            width: `calc(100% - ${drawerWidth}px - 25px)`,
            height: "calc(100vh - 64px - 48px - 60px)",
            overflow: "auto",
            position: "relative",
            marginLeft: "5px",
            marginTop: "0px",
            paddingTop: "40px",
            paddingLeft: "40px"
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
                  defaultPosition={{
                    x: gate.defaultPlacement[0],
                    y: gate.defaultPlacement[1],
                  }}
                  grid={[1, 1]}
                  scale={1}
                  onDrag={handleDrag}
                >
                  <Box
                    className="handle"
                    ref={ref}
                    key={`box-${gate.id}`}
                    onClick={() => {
                      handleConnect(gate.id)
                      console.log("IN HERE")
                    }}
                    onContextMenu={(event) => {
                      setRightClickContextGate({
                        id: gate.id,
                        type: gate.type,
                        output: Boolean(gate.output)
                      })
                      handleRightClick(event)
                    }}
                    onTouchStart={(event) => handleTouchStart(event, gate)}
                    onTouchMove={() => handleTouchMove()}
                    sx={{
                      width: "80px",
                      height: "80px",
                      border: `solid ${selected === gate.id ? `3px ${green["A400"]}` : `1px ${theme.palette.primary.main}`}`,
                      borderRadius: "5px",
                      position: "absolute",
                      "&:hover": {
                        cursor: selected === -1 ? "pointer" : "crosshair"
                      },
                    }}
                  >
                    <Paper elevation={9} component={"div"} style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      background: gate.type === GateType.OUTPUT ? "none" : `url("${gate.imgSrc}")`,
                      backgroundSize: gate.type === GateType.OUTPUT ? "" : "cover",
                    }} sx={(gate.type === GateType.OUTPUT) ? {
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
                      {!(gate.type === GateType.INPUT) && !(gate.type === GateType.OUTPUT) && (
                        <ArcherElement
                          id={`gate-${gate.id}-input0`}
                        >
                          <div
                            style={{
                              position: "relative",
                              top: gate.type === GateType.NOT ? "30px" : "15px",
                              left: "-25px",
                              background: gate.input0?.output ? "green" : "red",
                            }}
                            className="input-output">
                            {gate.input0?.output ? "1" : "0"}
                          </div>
                        </ArcherElement>
                      )}
                      {(gate.type === GateType.OUTPUT) && (
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
                      {![GateType.NOT, GateType.INPUT, GateType.OUTPUT].includes(gate.type) && (
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
                            targetId: dependency.type === GateType.OUTPUT ? `gate-${dependency.id}-inputs` : `gate-${dependency.id}-${dependency.input0?.id === gate.id ? "input0" : "input1"}`,
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
                            top: [GateType.NOT, GateType.OUTPUT].includes(gate.type) ? "7px" : gate.type === GateType.INPUT ? "30px" : "-12px",
                            left: "85px",
                            background: gate.output ? "green" : "red",
                          }}
                          className="input-output"
                        >
                          {gate.output ? "1" : "0"}
                        </div>
                      </ArcherElement>
                      {[GateType.INPUT, GateType.OUTPUT].includes(gate.type) && (
                        <Typography sx={{
                          background: theme.palette.primary.dark,
                          color: theme.palette.text.primary,
                          fontWeight: "bold",
                          display: "block",
                          top: gate.type === GateType.INPUT ? "-60px" : "-80px",
                        }} variant="overline" className="label">{(gate as unknown as Labeled).label}</Typography>
                      )}
                    </Paper>
                  </Box>
                </Draggable>
              )
            })}
          <Stepper drawerWidth={drawerWidth} canMove={canMove} activeStep={activeStep} setActiveStep={setActiveStep} />
        </Box>
      </Box>
    </ArcherContainer>
  );
}

export default PrimaryWindow
