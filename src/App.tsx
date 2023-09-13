import { createTheme } from '@mui/material'
import './App.css'
import PrimaryWindow from './components/PrimaryWindow'
import { ThemeProvider } from '@emotion/react'

const theme = createTheme({
  palette: {
    mode: "dark"
  }
})

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <PrimaryWindow />
    </ThemeProvider>
  )
}

export default App
