/**
 * Page for viewing appointments as a clinic.
 * This class serves  function for tracking the logged clinic, communicating with backend, and structure for dispalying infromation.
 */
import './ViewAppointments.css'
import React, {useCallback, useEffect, useRef, useState} from "react";
import DateCard from './components/DateCard'
import mqttHandler from "../common_components/MqttHandler";
import {useNavigate} from "react-router-dom";
import PrivateNavbar from "../common_components/PrivateNavbar";
import jwt from "jsonwebtoken";


export default function ViewAppointments() {

    const [client, setClient] = useState(null);
    const [appointmentsArray, setAppointmentsArray] = useState([]);
    const navigate = useNavigate();
    let appointmentsFlag = useRef(true)

    const sendMessage = useCallback((topic, json) => {
        if (client !== null) {
            appointmentsFlag.current = true
            client.publish(topic, JSON.stringify(json))
            setTimeout(() => {
                if (appointmentsFlag.current) {
                    navigate("/error");
                }
            }, 10000);

        } else {
            navigate("/error")
        }
    }, [client, navigate])

    // Primary client generating effect
    useEffect(() => {
        if (client === null) {
            setClient(mqttHandler.getClient(client))
        }
    }, [client])

    /**
     * Navigates the user to the login page in case the user is not
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
                clientId: client.options.clientId,
                body: {
                    clinicId: theClinic
                }
            })
            client.on('message', function (topic, message) {
                const pMessage = JSON.parse(message)
                appointmentsFlag.current = false
                switch (topic) {
                    case client.options.clientId + '/appointmentInformationResponse':
                        if (pMessage.length === 0) {
                            const alertPlaceholder = document.getElementById('currentAppointments')
                            alertPlaceholder.innerHTML = "No booked appointments for now"
                        }
                        setAppointmentsArray(pMessage.body.sortedArray)
                        break;
                    case client.options.clientId + '/canceledAppointment':
                        alert(pMessage.response)
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
    }, [client, sendMessage]);


    /**
     * Publishes a message to the backend to cancel & delete the timeslot
     * with the provided ID.
     * @param id the ID of the timeslot to be cancelled
     */
    const handleChildClick = (id) => {
        const timeslotID = id;
        console.log(timeslotID)
        if (client !== null) {
            sendMessage('cancelAppointment', {
                    clientId: client.options.clientId,
                    body: {
                        timeslotID: timeslotID
                    }
                }
            )
        }
    }

    return (
        <>
            <PrivateNavbar/>
            <div id="ty">
                <div id="backgroundAppointments">
                    <div className="row">
                        <div className="col-3">
                            <div id="cardAppointment">
                                <div className="card-body">
                                    <h3 id={"currentAppointments"}> Current appointments: </h3>
                                    <h2 id={"currentAppointmentsNumber"}>{appointmentsArray.length}</h2>
                                    <img id="clinicImage"
                                         src="https://cdn-icons-png.flaticon.com/512/2317/2317964.png"
                                         alt="clinic"/>
                                </div>
                            </div>
                        </div>
                        <div className='col-8'>
                            <div id={"timeslots"}>
                                {appointmentsArray.map((mappedDates, index) => (
                                    <DateCard key={index} date={mappedDates.key} timeslots={mappedDates.value}
                                                  handleChildClick={handleChildClick}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

