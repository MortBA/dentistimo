const mqttHandler = require('../helpers/mqtt_handler');
const clinicFunctions = require('./controllers/authorization_controller');

let config
try {
    config = require('../helpers/config');
} catch (e) {
    config = require('../helpers/dummy_config')
}

// MQTT Client
const mqttClient = new mqttHandler(config.module_config.authorizationUser.name, config.module_config.authorizationUser.password, config.module_config.authorizationUser.handler)
mqttClient.connect()

// MQTT subscriptions
mqttClient.subscribeTopic('auth');
mqttClient.subscribeTopic('test');
mqttClient.subscribeTopic('registration');
mqttClient.subscribeTopic("checkIfEmailExists");
mqttClient.subscribeTopic('testingTestingRequest');
mqttClient.subscribeTopic("login");

// When a message arrives, respond to it or propagate it further
mqttClient.mqttClient.on('message', function (topic, message) {
    let intermediary = JSON.parse(message);
    console.log(config.module_config.authorizationUser.handler + " service received MQTT message")
    console.log(intermediary);

    switch (topic) {
        case 'auth':
            mqttClient.sendMessage('authTest', 'Authorization confirmed')
            break;
        //topic for registration
        case 'registration':
            clinicFunctions.register(intermediary).then(res=>{
                if(res === "success!"){
                    //sends the ok to the client for the registration
                    sendMessage(intermediary, "/register","registration successful");
                }else{
                    sendMessage(intermediary, "/register","registration failed");
                }
            });
            break;
        //topic for checking if the email already exists in the DB(used for registration)
        case 'checkIfEmailExists':
            const email = intermediary.body.email;
            clinicFunctions.emailExists(email).then(res=>{

                if (res === "email already exists") {
                    sendMessage(intermediary,"/checkEmail","email already exists");
                }
            });
            break;
        //topic for login
        case "login":
            const emailLogin = intermediary.body.email;
            const password = intermediary.body.password;
            clinicFunctions.loginClinic(emailLogin,password).then(res=>{
                if(res === "login successful"){
                    //
                }else{
                    console.log("sent");
                    sendMessage(intermediary,"/loginClient", "Invalid email/password")
                }
            })

            break;
        case 'testingTestingRequest':
            mqttClient.sendMessage('testingTesting', 'ToothyClinic')
            break;
        case 'test':
            process.exit()
            break;
    }

});

/**
 * sends message to the frontend client
 * @param message MQTT message
 * @param intermediary This is used to extract the id so that it sends the message to the correct client page
 * @param topic this is the mqtt topic
 */

function sendMessage(intermediary,topic,message) {
    mqttClient.sendMessage( intermediary.id + topic, message)
}

module.exports = mqttClient;