import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Header from './Header';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from "./pages/StudentDashboard";
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard'
import StudentLogin from './pages/StudentLogin';
import DriverLogin from './pages/DriverLogin';
import AdminLogin from './pages/AdminLogin';
import DefineRoutes from './pages/DefineRoutes';
import AssignRoute from './pages/AssignRoutes';
import SearchVan from './pages/SearchVan';




function App() {

  return (
    <>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/header' element={<Header/>}/>
          <Route path='/registerpage' element={<RegisterPage />}/>
          <Route path='/studentdashboard' element={<StudentDashboard/>}/>
          <Route path='/driverdashboard' element={<DriverDashboard/>}/>
          <Route path='/admindashboard' element={<AdminDashboard/>}/>
          <Route path='/studentlogin' element={<StudentLogin />}/>
          <Route path='/driverlogin' element={<DriverLogin/>}/>
          <Route path='/adminlogin' element={<AdminLogin/>}/>
          <Route path='/defineroutes' element={<DefineRoutes/>}/>
          <Route path='/assignroutes' element={<AssignRoute/>}/>
          <Route path='/searchvan' element={<SearchVan/>}/>



        </Routes>
    </>

  );
}


export default App;
