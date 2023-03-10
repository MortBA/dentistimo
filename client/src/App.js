import './App.css';
import {Route, Routes,} from "react-router-dom";

import Registration from "./ClinicRegistration/Registration";
import MapPage from "./ClinicsMap/MapParent"
import React from 'react';
import Login from "./ClinicLogin/Login";
import Home from "./home/Home";
import ClinicAppointments from "./ViewAppointments/viewAppointments"
import ClinicHomePage from "./ClinicHomePage/ClinicHomePage";
import MyInformation from "./MyInformation/MyInformation";
import AboutUsSkeleton from "./AboutUsPage/AboutUsSkeleton";
import NewDentist from "./AddDentist/NewDentist";
import ErrorPage from "./ErrorPage";
import EditDentists from "./EditDentists/EditDentists";
import Appointments from "./appointments_calendar/Appointments";

export default function App() {

    return (
        <div id={'topPage'}>
            <Routes>
                <Route path="/" element={< Home/>}/>
                <Route path="/clinic/addDentist" element={<NewDentist/>}/>
                <Route path="/registration" element={< Registration/>}/>
                <Route path="/login" element={< Login/>}/>
                <Route path="/Home" element={< Home/>}/>
                <Route path="/map" element={< MapPage/>}/>
                <Route path="/clinic/schedule" element={< ClinicAppointments/>}/>
                <Route path="/appointments" element={< Appointments/>}/>
                <Route path="/clinic" element={< ClinicHomePage/>}/>
                <Route path="/clinic/editDentists" element={< EditDentists/>}/>
                <Route path="/clinic/profile" element={< MyInformation/>}/>
                <Route path="/aboutUs" element={< AboutUsSkeleton/>}/>
                <Route path="/error" element={<ErrorPage/>}/>
                <Route/>
            </Routes>
        </div>
    );
}
