import {Route,Routes} from 'react-router-dom'
import IfNotLogin from "./Components/IfNotLogin"


function App() {
  

  return (
    <>
    <Routes>
      <Route path="/" element={<IfNotLogin/>}/>
    </Routes>

    </>
  )
}

export default App
