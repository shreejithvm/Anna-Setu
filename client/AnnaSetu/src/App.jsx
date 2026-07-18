import {Route,Routes} from 'react-router-dom'
import IfNotLogin from "./Components/IfNotLogin"
import Register from './Components/Register'
import Login from './Components/Login'
import Home from './Components/Home'

function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<IfNotLogin/>}/>
      <Route path="reg" element={<Register/>}/>
      <Route path="log" element={<Login/>}/>
      <Route path="home" element={<Home/>}/>

    </Routes>

    </>
  )
}

export default App
