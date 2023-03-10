import "./EditDentists.css";
import DentistCard from "./DentistCard/DentistCard";
import PrivateNavbar from "../common_components/PrivateNavbar";
import React, {useEffect, useRef, useState} from "react";
import mqttHandler from "../common_components/MqttHandler";
import jwt from "jsonwebtoken";
import {useNavigate} from "react-router-dom";


export default function EditDentists() {
    const [dentists, setDentists] = useState([]);
    const [client, setClient] = useState(null);
    const [clinic, setClinic] = useState(null);
    let clinicDataBackend = useRef(true)
    const navigate = useNavigate();

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

    useEffect(() => {
        if (client !== null) {
            const theClinic = jwt.decode(localStorage.token, 'something');
            setClinic(theClinic.name)
            client.subscribe(client.options.clientId + '/#')
            sendMessage('getDentists', {
                clientId: client.options.clientId,
                body: {
                    clinicId: theClinic._id
                }
            })
            client.on('message', function (topic, message) {
                clinicDataBackend.current = false
                switch (topic) {
                    case client.options.clientId + '/getDentistsResponse':
                        console.log(JSON.parse(message))
                        const pMessage = JSON.parse(message)
                        setDentists(pMessage.dentists)
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

        function sendMessage(topic, json) {
            if (client !== null) {
                clinicDataBackend.current = true
                client.publish(topic, JSON.stringify(json))
                setTimeout(() => {
                    if (clinicDataBackend.current) {
                        navigate("/error");
                    }
                }, 10000);
            } else {
                navigate("/error")
            }
        }
    }, [client, navigate]);

    function noDentist() {
        navigate('/addDentist')
    }


    return (
        <>
            <PrivateNavbar/>
            <h1 className="info">
                Dentist's registered at {clinic}
            </h1>
            <div id="dentists">
                {dentists && dentists.length > 0 && Array.from(dentists).map((dentist) => (
                    <div id="dentist-card" key={dentist.id}>
                        <DentistCard
                            key={dentist.id}
                            id={dentist.id}
                            name={dentist.name}
                            email={dentist.email}
                            PhoneNumber={dentist.phoneNumber}
                            clinic={clinic}
                            workweek={dentist.workWeek} // passes the workweek array as a prop
                        />
                    </div>
                ))}
                {!dentists &&
                    <div>
                        <h3 id="noDentistH" onClick={noDentist}>There are no dentists. Please add them through here!</h3>
                    </div>
                }
            </div>
        </>
    )
}

