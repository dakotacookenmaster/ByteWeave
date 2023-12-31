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
import { Theme, useTheme } from '@mui/material/styles';
import Draggable from 'react-draggable';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { AndGate, InputGate, NandGate, NorGate, NotGate, OrGate, OutputGate, SevenSegmentDisplay, TwoInputGate } from '../helpers/Gates';
import { Paper, Switch, ToggleButton, ToggleButtonGroup, useMediaQuery } from '@mui/material';
import { Gate, GateType } from '../helpers/Gates';
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
import ConnectModal from './ConnectModal';
import logo from "/byteweave-logo.png"
import TruthTableModal from './TruthTableModal';
import DatasetIcon from '@mui/icons-material/Dataset';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import InvertColorsOffIcon from '@mui/icons-material/InvertColorsOff';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

const data: Assignment = untypedData

const drawerWidth = 240;

const PrimaryWindow = () => {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<number>(-1)
  const archerContainerRef = React.useRef(null)
  const id = React.useRef<number>(0)
  const label = React.useRef<string>("A")
  const [activeStep, setActiveStep] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(true)
  const [isTruthTableOpen, setIsTruthTableOpen] = React.useState(false)
  const [canMove, setCanMove] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(null)
  const [viewConnectModal, setViewConnectModal] = React.useState(false)
  const [connections, setConnections] = React.useState<{ from: undefined | number, to: undefined | number }>({
    from: undefined,
    to: undefined,
  })
  const [rightClickContextGate, setRightClickContextGate] = React.useState({
    id: -1,
    type: GateType.INPUT,
    output: false,
  })
  const [timer, setTimer] = React.useState<number | null>()
  const isSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"))
  const defaultPinNumber = React.useRef<number | undefined>(undefined)
  const currentlyHeld = React.useRef<number | undefined>(undefined)
  const boxRef = React.useRef<null | HTMLElement>(null)
  const gates = React.useRef([] as Gate[])
  const [shouldRerender, setShouldRerender] = React.useState<boolean>(false)
  const [addedNewGate, setAddedNewGate] = React.useState<boolean>(false)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = React.useState<boolean>(false)
  const [selectedColorMode, setSelectedColorMode] = React.useState<"default" | "colorblind">("default")

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseConnectModal = () => {
    setViewConnectModal(false)
    setConnections({ from: undefined, to: undefined })
  }

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
    if (shouldRerender) {
      setShouldRerender(false)
    }

    if (addedNewGate) {
      setAddedNewGate(false)
    }
  }, [shouldRerender, addedNewGate])

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      let different = false
      for (let gate of gates.current) {
        if (gate.decide()) {
          different = true
        }
      }

      if (different || gates.current.length === 0) {
        setShouldRerender(true)
      }

    }, 100)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const checkAnswer = () => {
    const truthTable = data.questions[activeStep].answer.truthTable
    const inputs = gates.current.filter(gate => gate.type === GateType.INPUT).sort((a, b) => {
      return a.id - b.id
    })
    const outputs = gates.current.filter(gate => gate.type === GateType.OUTPUT).sort((a, b) => {
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
        if (outputs[j].type === GateType.SEVEN_SEGMENT_DISPLAY) {
          if (truthTable[i][1][j] !== outputs[j].value) {
            enqueueSnackbar("Hm, that's not quite right...", { variant: "error" })
            failed = true
            break
          }
        }
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
    enqueueSnackbar("You got it!", { style: selectedColorMode === "colorblind" ? { backgroundColor: "blue"} : {}, variant: "success" })
    setCanMove(true)
  }

  const checkGatesInQuestion = (gate: ("AND" | "OR" | "NOT" | "NAND" | "NOR" | "INPUT" | "OUTPUT" | "SEVEN_SEGMENT_DISPLAY")): boolean => {
    return data.gatesProvidedInEveryQuestion.includes(gate) || data.questions[activeStep].gatesProvided.includes(gate)
  }

  const resetCurrentGate = () => {
    setRightClickContextGate({
      id: -1,
      type: GateType.INPUT,
      output: false
    })
  }

  const removeOutgoingConnections = (id: number) => {
    const gate = gates.current.find(gate => gate.id === id)
    if (!gate) {
      return
    }
    gate.dependencies = gate.dependencies.filter(dependency => {
      dependency.inputs = dependency.inputs.map(input => {
        if (input?.gate?.id === gate.id) {
          return {
            ...input,
            gate: undefined,
          }
        }
        return input
      })

      return false
    })
    setAnchorElement(null)
    resetCurrentGate()
  }

  const toggleInput = (id: number) => {
    const foundGate = gates.current.find(gate => gate.id === id)
    if (foundGate?.type === GateType.INPUT) {
      foundGate.output = !foundGate.output
    }

    setAnchorElement(null)
    resetCurrentGate()
  }

  const removeGate = (id: number) => {
    const gate = gates.current.find(g => g.id === id)
    if (!gate) {
      return
    }

    if (data.questions[activeStep].answer.outputs.length !== 0 && (gate.type === GateType.OUTPUT || gate.type === GateType.INPUT)) {
      return
    }

    gate.dependencies = gate.dependencies.filter((dependency) => {
      dependency.inputs = dependency.inputs.map(input => {
        if (input?.gate?.id === gate.id) {
          return {
            ...input,
            gate: undefined,
          }
        }
        return input
      })

      return false
    })

    gate.inputs = gate.inputs.map(input => {
      if (input.gate) {
        input.gate.dependencies = input.gate.dependencies.filter(dependency => {
          return dependency.id !== gate.id
        })
      }
      return input
    })

    gates.current = gates.current.filter(g => g.id !== id)

    setAnchorElement(null)
    resetCurrentGate()
  }

  const handleAddGate = (type: GateType) => {
    if (currentlyHeld.current !== undefined) {
      return
    }

    boxRef.current!.style.cursor = "crosshair"
    currentlyHeld.current = id.current
    enqueueSnackbar("Click or tap anywhere to place your new gate.", { variant: "info" })
    let newGate: any

    switch (type) {
      case GateType.AND:
        newGate = new AndGate("https://img.icons8.com/nolan/96/logic-gates-and.png", id.current)
        break
      case GateType.OR:
        newGate = new OrGate("https://img.icons8.com/nolan/96/logic-gates-or.png", id.current)
        break
      case GateType.NOT:
        newGate = new NotGate("https://img.icons8.com/nolan/96/logic-gates-not.png", id.current)
        break
      case GateType.NAND:
        newGate = new NandGate("https://img.icons8.com/nolan/96/logic-gates-nand.png", id.current)
        break
      case GateType.NOR:
        newGate = new NorGate("https://img.icons8.com/nolan/96/logic-gates-nor.png", id.current)
        break
      case GateType.INPUT:
        newGate = new InputGate("https://img.icons8.com/nolan/96/login-rounded-right.png", id.current, `IN: ${label.current}`)
        break
      case GateType.OUTPUT:
        newGate = new OutputGate("https://img.icons8.com/nolan/96/logout-rounded-left.png", id.current, `OUT: ${label.current}`)
        break
      case GateType.SEVEN_SEGMENT_DISPLAY:
        newGate = new SevenSegmentDisplay(id.current, "")
        break
      default:
        break
    }

    id.current++
    gates.current.push(newGate)
    setMobileOpen(false)
    setAddedNewGate(true)
  }

  React.useEffect(() => {
    const escHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        gates.current = gates.current.filter(g => g.id !== currentlyHeld.current)
        boxRef.current!.style.cursor = "default"
        currentlyHeld.current = undefined
        setShouldRerender(true)
      }
    }

    document.addEventListener("keydown", escHandler)

    return () => {
      document.removeEventListener("keydown", escHandler)
    }
  }, [])

  React.useEffect(() => {
    gates.current = []
    label.current = "A"
    const question = data.questions[activeStep]
    for (let i = 0; i < question.answer.inputs.length; i++) {
      const newGate = new InputGate("https://img.icons8.com/nolan/96/login-rounded-right.png", id.current, `IN: ${label.current}`, [question.answer.inputs[i].defaultXY[0], question.answer.inputs[i].defaultXY[1]])
      gates.current.push(newGate)
      id.current++
      label.current = nextChar(label.current)
    }
    for (let i = 0; i < question.answer.outputs.length; i++) {
      const newGate = new OutputGate("https://img.icons8.com/nolan/96/logout-rounded-left.png", id.current, `OUT: ${label.current}`, [question.answer.outputs[i].defaultXY[0], question.answer.outputs[i].defaultXY[1]])
      gates.current.push(newGate)
      id.current++
      label.current = nextChar(label.current)
    }
    setIsOpen(true)
    document.title = `ByteWeave | ${data.questions[activeStep].instructions.title}`
    setCanMove(data.canSkipAnyQuestion || Boolean(data.questions[activeStep].canSkip))
    setShouldRerender(true)
  }, [activeStep])

  const handleDrag = () => {
    (archerContainerRef as any).current?.refreshScreen()
  }

  const newGateClickToPlace = (event: any) => {
    let xOffset = 0
    let yOffset = 0

    const { x, y, width, height } = boxRef.current!.getBoundingClientRect()

    if (event.clientX - 80 < x) {
      xOffset = 1
    } else if (event.clientX + 80 > x + width) {
      xOffset = width - 165
    }

    if (event.clientY < y) {
      yOffset = 1
    } else if (event.clientY > height) {
      yOffset = height - 165
    }

    if (currentlyHeld.current !== undefined) {
      const gate = gates.current.find(gate => gate.id === currentlyHeld.current)
      if (gate) {
        gate.defaultPlacement = [
          xOffset ? xOffset : isSM ? event.clientX - 80 : event.clientX - drawerWidth - 80,
          yOffset ? yOffset : (event.clientY - 165 < 0) ? 1 : event.clientY - 165,
        ]

        if (gate.type === GateType.INPUT || gate.type === GateType.OUTPUT) {
          label.current = nextChar(label.current)
        }
      }

      boxRef.current!.style.cursor = "default"
      currentlyHeld.current = undefined
      setAddedNewGate(true)
    }
  }

  const handleCompleteConnect = (pinNumber: any) => {
    setConnections(prevConnections => {
      if (prevConnections.from !== undefined && prevConnections.to !== undefined) {
        const inputtingGate = gates.current.find(g => g.id === prevConnections.from)
        const receivingGate = gates.current.find(g => g.id === prevConnections.to)

        if (inputtingGate && receivingGate && receivingGate.inputs.every(input => input.gate?.id !== inputtingGate.id)) {
          inputtingGate.dependencies.push(receivingGate)
          receivingGate.inputs[pinNumber].gate = inputtingGate
        }
      }
      return {
        from: undefined,
        to: undefined
      }
    })
    setViewConnectModal(false)
  }

  const handleInitiateConnect = (id: number) => {
    if (selected !== -1) {
      const receivingGate = gates.current.find(gate => gate.id === id)
      const inputtingGate = gates.current.find(gate => gate.id === selected)

      if (!receivingGate || !inputtingGate) {
        return
      }

      if (inputtingGate.id === receivingGate.id) {
        return
      }

      if (receivingGate.inputs.filter(v => v.gate).length === receivingGate.maxInputs) {
        return
      }

      if (inputtingGate.dependencies.find(g => g.id === receivingGate.id)) {
        return
      }

      setConnections({
        from: inputtingGate.id,
        to: receivingGate.id
      })

      defaultPinNumber.current = receivingGate.inputs.map((v, i) => {
        if (v.gate === undefined) {
          return i
        }
      }).filter(v => v !== undefined)[0]

      setViewConnectModal(true)
      setSelected(-1)
    }
  }

  const handleTouchStart = (event: any, gate: Gate) => {
    if (selected === -1) {
      setTimer(setTimeout(() => handleLongTouch(event, gate), 800))
    } else {
      handleInitiateConnect(gate.id)
    }
  }

  const drawer = (
    <div>
      <Toolbar sx={{ display: "flex", justifyContent: "center", padding: "20px", }}>
        <img style={{ borderRadius: "20px", background: "white", width: "80%", padding: "20px" }} src={logo} alt="ByteWeave Logo" />
      </Toolbar>
      <Divider />
      <Typography sx={{ fontWeight: "bold", marginTop: "10px", display: "block", width: "100%", textAlign: "center" }} variant="overline">Logic Gates &amp; Components</Typography>
      <List sx={{ overflow: "auto", marginBottom: "0px", maxHeight: "calc(100vh - 271px)" }}>
        {checkGatesInQuestion("AND") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.AND)}>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-and.png" alt="logic-gates-and" />
              </ListItemIcon>
              <ListItemText primary={"AND"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("OR") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.OR)}>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-or.png" alt="logic-gates-or" />
              </ListItemIcon>
              <ListItemText primary={"OR"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NOT") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.NOT)}>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-not.png" alt="logic-gates-not" />
              </ListItemIcon>
              <ListItemText primary={"NOT"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NAND") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.NAND)}>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nand.png" alt="logic-gates-nand" />
              </ListItemIcon>
              <ListItemText primary={"NAND"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("NOR") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.NOR)}>
              <ListItemIcon>
                <img width="50px" src="https://img.icons8.com/nolan/96/logic-gates-nor.png" alt="logic-gates-nor" />
              </ListItemIcon>
              <ListItemText primary={"NOR"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("INPUT") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.INPUT)}>
              <ListItemIcon>
                <img width="50px" height="50px" src="https://img.icons8.com/nolan/96/login-rounded-right.png" alt="login-rounded-right" />
              </ListItemIcon>
              <ListItemText primary={"INPUT"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("OUTPUT") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.OUTPUT)}>
              <ListItemIcon>
                <img width="50px" className="output-right" height="50px" src="https://img.icons8.com/nolan/96/logout-rounded-left.png" alt="logout-rounded" />
              </ListItemIcon>
              <ListItemText primary={"OUTPUT"} />
            </ListItemButton>
          </ListItem>
        )}
        {checkGatesInQuestion("SEVEN_SEGMENT_DISPLAY") && (
          <ListItem disablePadding>
            <ListItemButton disabled={currentlyHeld.current !== undefined} onClick={() => handleAddGate(GateType.SEVEN_SEGMENT_DISPLAY)}>
              <ListItemIcon>
                <img width="50" height="50" src="https://img.icons8.com/dusk/96/display.png" alt="display" />
              </ListItemIcon>
              <ListItemText primary={"7 SEG DISPLAY"} />
            </ListItemButton>
          </ListItem>
        )}

      </List>
      <Toolbar sx={{ paddingBottom: "10px", position: "fixed", display: "flex", justifyContent: "left", flexDirection: "column", gap: "10px", bottom: 0, width: `${drawerWidth - 1}px`, background: "theme.palette.primary.dark" }}>
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
      <BasicModal drawerWidth={drawerWidth} isOpen={isOpen} setIsOpen={setIsOpen} data={data.questions[activeStep].instructions} />
      {
        data.questions[activeStep].answer.inputs.length > 0 && data.questions[activeStep].answer.outputs.length > 0 && (
          <TruthTableModal selectedColorMode={selectedColorMode} gates={gates.current} drawerWidth={drawerWidth} isOpen={isTruthTableOpen} setIsOpen={setIsTruthTableOpen} truthTableData={data.questions[activeStep].answer.truthTable} />
        )
      }
      <ConnectModal setShouldRerender={setShouldRerender} defaultPinNumber={defaultPinNumber} isOpen={viewConnectModal} setIsOpen={handleCloseConnectModal} receivingGate={gates.current.find(g => g.id === connections.to)} handleCompleteConnect={handleCompleteConnect} />
      {rightClickContextGate.id !== -1 && (<RightClickContext
        selectedColorMode={selectedColorMode}
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
              {data.questions[activeStep].instructions.title}
            </Typography>
            <IconButton title="Options" sx={{ ml: "auto" }} onClick={() => setIsSettingsMenuOpen(true)}>
              <SettingsApplicationsIcon color="primary" />
            </IconButton>
            <React.Fragment>
              <Drawer
                anchor={"right"}
                open={isSettingsMenuOpen}
                onClose={() => setIsSettingsMenuOpen(false)}
                PaperProps={{
                  sx: {
                    background: theme.palette.background.paper
                  }
                }}
              >
                <List sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                  {data.questions[activeStep].answer.inputs.length ? (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => setIsTruthTableOpen(true)}>
                          <ListItemIcon>
                            <DatasetIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText secondary={"Your output vs. expected output"} primary={"Assignment Truth Table"} />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => checkAnswer()}>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText secondary={"Run the autograder"} primary={"Check Answer"} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : (<></>)}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setIsOpen(true)}>
                      <ListItemIcon>
                        <GradingIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText secondary={"Review the task and resources."} primary={"Task Description"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ display: "flex", justifyContent: "center", marginTop: "auto" }}>
                    <ToggleButtonGroup exclusive={true} size="large" aria-label="Large sizes">
                      <ToggleButton title="Default Colors" onClick={() => setSelectedColorMode("default")} selected={selectedColorMode === "default"} value="left" key="left">
                        <InvertColorsIcon />
                      </ToggleButton>,
                      <ToggleButton title="Colorblind Mode" onClick={() => setSelectedColorMode("colorblind")} selected={selectedColorMode === "colorblind"} fullWidth value="right" key="right">
                        <InvertColorsOffIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </ListItem>
                </List>
              </Drawer>
            </React.Fragment>
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
          ref={boxRef}
          onClick={(event) => {
            newGateClickToPlace(event as any)
          }}
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
            gates.current.map(gate => {
              const ref = React.createRef<HTMLElement>()
              if (gate.defaultPlacement[0] >= 0 && gate.defaultPlacement[1] >= 0) {
                return (
                  <Draggable
                    nodeRef={ref}
                    axis="both"
                    bounds="parent"
                    key={`gate-${gate.id}-draggable`}
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
                      sx={{
                        width: "80px",
                        height: "80px",
                        border: `solid ${selected === gate.id ? `3px ${selectedColorMode === "colorblind" ? "blue" : green["A400"]}` : `1px ${theme.palette.primary.main}`}`,
                        borderRadius: "5px",
                        position: "absolute",
                        "&:hover": {
                          cursor: (selected === -1 || currentlyHeld.current !== undefined) ? "pointer" : "crosshair"
                        },
                      }}
                    >
                      <Paper elevation={9} component={"div"} style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        background: gate.type === GateType.OUTPUT || gate.type === GateType.SEVEN_SEGMENT_DISPLAY ? "none" : `url("${gate.imgSrc}")`,
                        backgroundSize: gate.type === GateType.OUTPUT || gate.type === GateType.SEVEN_SEGMENT_DISPLAY ? "" : "cover",
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
                      } : {}}
                        onClick={() => {
                          handleInitiateConnect(gate.id)
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
                      >
                        {(gate.inputs.map((input, index) => {
                          return (
                            <ArcherElement
                              id={`gate-${gate.id}-input${index}`}
                              key={`gate-${gate.id}-input${index}`}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  left: "-28px",
                                  top: gate instanceof TwoInputGate ?
                                    "15px" : gate instanceof NotGate || gate instanceof OutputGate ?
                                      "28px" : gate instanceof SevenSegmentDisplay ?
                                        "-4px" : "0px",
                                  background: input?.gate?.output ? (selectedColorMode === "colorblind" ? "blue" : "green") : "red",
                                }}
                                className="input-output">
                                {input?.gate?.output ? "1" : "0"}
                              </div>
                            </ArcherElement>
                          )
                        }))}
                        {(gate.type !== GateType.SEVEN_SEGMENT_DISPLAY) && (
                          <ArcherElement
                            id={`gate-${gate.id}-output`}
                            key={`gate-${gate.id}-output`}
                            relations={gate.dependencies.map(dependency => {
                              return {
                                targetId: `gate-${dependency.id}-input${dependency.inputs.findIndex(input => input?.gate?.id === gate.id)}`,
                                targetAnchor: 'left',
                                sourceAnchor: 'right',
                                style: {
                                  strokeColor: gate.output ? (selectedColorMode === "colorblind" ? "#0000ff" : "#00ff00") : "#ff0000",
                                  endMarker: false,
                                }
                              }
                            })}
                          >
                            <div
                              style={{
                                position: "relative",
                                top: gate instanceof InputGate ?
                                  "30px" : gate instanceof NotGate || gate instanceof OutputGate ?
                                    "8px" : "-15px",
                                left: "85px",
                                background: gate.output ? (selectedColorMode === "colorblind" ? "blue" : "green") : "red",
                              }}
                              className="input-output">
                              {gate.output ? "1" : "0"}
                            </div>
                          </ArcherElement>
                        )}
                        {gate.type === GateType.SEVEN_SEGMENT_DISPLAY && (
                          <Box sx={{
                            fontFamily: "DSEG7-Modern",
                            fontSize: "65px",
                            position: "absolute",
                            top: "-10px",
                            left: "13px"
                          }}>
                            {gate.value}
                          </Box>
                        )}
                        {
                          (gate instanceof InputGate || gate instanceof OutputGate) && (
                            <Box sx={{
                              background: theme.palette.primary.dark,
                              display: "flex",
                              padding: "5px 0px",
                              justifyContent: "center",
                              fontWeight: "bold",
                              borderRadius: "10px",
                              position: "relative",
                              top: gate instanceof InputGate ? "-60px" : "-82px",
                            }}>{
                                gate.label
                              }</Box>
                          )}
                      </Paper>
                      {
                        (gate instanceof InputGate) && (
                          <Switch sx={{
                            position: "absolute",
                            zIndex: "1000",
                            top: "80px",
                            left: "10px",
                          }} size="medium" color={gate.output ? (selectedColorMode === "colorblind" ? "info" : "success") : "error"} checked={gate.output} onClick={() => toggleInput(gate.id)} onTouchStart={() => toggleInput(gate.id)} />
                        )}
                    </Box>
                  </Draggable>
                )
              }
            })}
          {data.questions.length > 1 && (
            <Stepper drawerWidth={drawerWidth} canMove={canMove} activeStep={activeStep} setActiveStep={setActiveStep} />
          )}
        </Box>
      </Box>
    </ArcherContainer>
  );
}

export default PrimaryWindow
