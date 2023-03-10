import React, {useEffect, useRef, useState} from 'react';
import "./Login.css";
import mqttHandler from "../common_components/MqttHandler";
import {Link, useNavigate} from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });
    let authBackendFlag = useRef(true)
    const email = document.getElementById('email');
    const pass = document.getElementById('password');


    // Primary client generating effect
    useEffect(() => {
        if (client === null) {
            setClient(mqttHandler.getClient(client))
        }
    }, [client])

    // Secondary effect containing all message logic and closure state
    useEffect(() => {
        if (client !== null) {
            client.subscribe(client.options.clientId + '/#');
            client.on('message', function (topic, message) {
                // eslint-disable-next-line no-unused-vars
                const intermediary = message.toString();
                const jsonRes = JSON.parse(intermediary);
                authBackendFlag.current = false
                switch (topic) {
                    case client.options.clientId + "/loginClient":
                        if (jsonRes.response === "login successful") {
                            localStorage.token = jsonRes.token;
                            console.log(jsonRes.token);
                            console.log(jsonRes.clinicAccount.clinicName);
                            navigate("/clinic");
                        } else {
                            setShowAlert(true);
                        }
                        break;
                    case client.options.clientId + "/getClinic":
                        console.log(jsonRes);
                        break;
                    default:
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
    }, [client, navigate])


    function sendMessage(topic, json) {
        if (client !== null) {
            authBackendFlag.current = true
            client.publish(topic, JSON.stringify(json))
            setTimeout(() => {
                if (authBackendFlag.current) {
                    navigate("/error");
                }
            }, 10000);

        } else {
            navigate("/error")
        }
    }

    const handleInputChange = (event) => {
        event.persist();

        setLoginData(formData => ({
            ...formData,
            [event.target.name]: event.target.value
        }));
    };

    // eslint-disable-next-line no-unused-vars
    function login(event) {
        event.preventDefault()
        setShowAlert(false);
        if (email.checkValidity() && pass.checkValidity()) {
            const json = {
                "clientId": client.options.clientId,
                "body": {
                    "email": loginData.email,
                    "password": loginData.password
                }
            }
            sendMessage('login', json);
        }
    }

    return (
        <div className='loginBody'>
            <div className="row" id="rowContainer2">
                <div className="col-md-4" id="parentContainer2">
                    <h2 className="text-center mt-1 text-white">Sign in</h2>
                    <form id="loginForm" onSubmit={login} style={{position: "relative", top: '20px'}}>
                        <div>
                            {showAlert && (
                                <div className="alert alert-danger" role="alert"
                                     style={{lineHeight: "10px"}}>
                                    Invalid email or password
                                </div>
                            )}
                        </div>

                        <div className="form-floating mb-4">
                            <input type="email"
                                   className="form-control form-control-lg"
                                   id="email"
                                   name="email"
                                   onChange={handleInputChange}
                                   placeholder="aa@mail.com"
                                   required/>
                            <label>Email</label>
                        </div>

                        <div className="form-floating mb-4">
                            <input type="password"
                                   className="form-control form-control-lg"
                                   id="password"
                                   name="password"
                                   onChange={handleInputChange}
                                   placeholder="b"
                                   required/>
                            <label>Password</label>
                        </div>

                        <button type="submit"
                                className="btn btn-primary align-self-center"
                                style={{width: '150px', height: '50px'}}>Sign In
                        </button>
                        <p className="text-center mt-2 mb-2 text-white">Don't have an account?
                            <Link to="/registration" style={{color: 'black'}}>Register here </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}