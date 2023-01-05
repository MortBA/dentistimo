import './ViewAppointments.css'
import React, {useEffect, useRef, useState} from "react";
import {MDBRow, MDBCol} from 'mdb-react-ui-kit';
import TimeslotCard from './components/timeslotCard'
import mqttHandler from "../common_components/MqttHandler";
import {useNavigate} from "react-router-dom";
import PrivateNavbar from "../common_components/PrivateNavbar";
import jwt from "jsonwebtoken";


export default function ViewAppointments() {

    const [client, setClient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const navigate = useNavigate();
    let appointmentsFlag = useRef(true)
// Primary client generating effect
    useEffect(() => {
        if (client === null) {
            setClient(mqttHandler.getClient(client))
        }
    }, [client])

    /**
     * Navigates the user to the log in page in case the user is not
     * authenticated to be on this page
     */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
        return () => {
        };
    }, [navigate]);

    /**
     * Subscribes and publishes to the corresponding topic defined in backend.
     * Thus is receives the information about patient, dentist and timeslot.
     */
    useEffect(() => {
        if (client !== null) {
            client.subscribe(client.options.clientId + '/#')
            const theClinic = jwt.decode(localStorage.token, 'something');
            console.log(theClinic._id)
            sendMessage('sendAppointmentInformation', {
                id: client.options.clientId,
                body: {
                    clinicID: theClinic._id
                }
            })
            client.on('message', function (topic, message) {
                appointmentsFlag.current = false
                switch (topic) {
                    case client.options.clientId + '/appointmentInformationResponse':
                        console.log(JSON.parse(message))
                        const pMessage = JSON.parse(message)
                        if (pMessage.length === 0) {
                            const alertPlaceholder = document.getElementById('currentAppointments')
                            alertPlaceholder.innerHTML = "No booked appointments for now"
                        }
                        setAppointments(pMessage)
                        break;
                    case client.options.clientId + '/canceledAppointment':
                        console.log(JSON.parse(message))
                        break;
                    default:
                        (new Error("The wrong message is received"))
                        break;
                }
            })
        }
        return () => {
            if (client !== null) {
                console.log("ending process");
                client.end()
            }
        }
//Placed the sendMessage function within the useEffect hook to stop complaint. -Askan
        function sendMessage(topic, json) {
            if (client !== null) {
                appointmentsFlag.current = true
                client.publish(topic, JSON.stringify(json))
                setTimeout(() => {
                    if (appointmentsFlag.current) {
                        navigate("/error");
                    }
                }, 3000);

            }
        }
    }, [client, navigate]);


    /**
     * Publishes a message to the backend to cancel & delete the timeslot
     * with the provided ID.
     * @param id the ID of the timeslot to be cancelled
     */
    const handleChildClick = (id) => {
        const timeslotID = id;
        console.log(timeslotID)
        if (client !== null) {
            client.publish('cancelAppointment', JSON.stringify(
                {
                    id: client.options.clientId,
                    body: {
                        timeslotID: timeslotID
                    }
                }
            ))
        }
    }

//Line 125 with empty h2 I added a empty space to stop the empty header complaint -Askan
    return (
        <div id="ty">
            <PrivateNavbar/>
            <div id="background">
                <MDBRow>
                    <MDBCol md='3'>
                        <div className="card">
                            <div className="card-body">
                                <h3 id={"currentAppointments"}> Current appointments </h3>
                                <h2 id={"currentAppointments"}> </h2>
                                <img className="clinic"
                                     src="https://cdn-icons-png.flaticon.com/512/2317/2317964.png"
                                     alt="clinic"/>
                            </div>
                        </div>
                    </MDBCol>
                    <MDBCol md='8'>
                        <div id={"timeslots"}>
                            {Array.from(appointments).map((appointment) => (
                                <TimeslotCard key={appointment.id} appointment={appointment}
                                              parentCallback={handleChildClick}/>
                            ))}
                        </div>
                    </MDBCol>
                </MDBRow>
            </div>
        </div>
    );
}

