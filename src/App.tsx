import { createTheme } from '@mui/material'
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
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={1} style={{ width: "500px" }} anchorOrigin={{ horizontal: "center", vertical: "top" }}>
        <PrimaryWindow />
      </SnackbarProvider>
    </ThemeProvider>
  )
}

export default App
