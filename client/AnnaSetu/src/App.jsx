import {Route,Routes} from 'react-router-dom'
import IfNotLogin from "./Components/IfNotLogin"
import Register from './Components/Register'
import Login from './Components/Login'


function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<IfNotLogin/>}/>
      <Route path="reg" element={<Register/>}/>
      <Route path="log" element={<Login/>}/>

    </Routes>

    </>
  )
}

export default App
