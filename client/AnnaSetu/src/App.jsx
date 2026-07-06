import {Route,Routes} from 'react-router-dom'
import IfNotLogin from "./Components/IfNotLogin"
import Register from './Components/Register'


function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<IfNotLogin/>}/>
      <Route path="reg" element={<Register/>}/>
    </Routes>

    </>
  )
}

export default App
