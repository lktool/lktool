import Landing from "./Landing/Landing";
import Admin from "./Admin/Admin";
import Login from './Login/Login';
import Signup from "./Signin/Signup";
import InputMain from "./InputMain.jsx/InputMain";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ResetPassword/ResetPassword";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/admin" element={<Admin/>}></Route>
          <Route path="/inputMain" element={<InputMain/>}></Route>
          <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
          <Route path="/reset-password/:uid/:token" element={<ResetPassword/>}></Route>
          <Route path="/auth/google/callback/" element={<GoogleAuthCallback/>}></Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
