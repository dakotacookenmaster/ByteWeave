import { createTheme, useMediaQuery } from '@mui/material'
import './App.css'
import PrimaryWindow from './components/PrimaryWindow'
import { ThemeProvider } from '@emotion/react'
import { SnackbarProvider } from 'notistack'

const theme = createTheme({
  palette: {
    mode: "dark"
  }
})

const App = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={2} style={{ minWidth: "400px" }} preventDuplicate={true} anchorOrigin={{ horizontal: "center", vertical: isMobile ? "bottom" : "top" }}>
        <PrimaryWindow />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
