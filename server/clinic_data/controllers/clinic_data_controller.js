/**
 * All the mongoose manipulation for clinic_data component is contained here
 * @author Burak Askan (@askan)
 * @author Aieh Eissa (@aieh)
 * @author Ossian Ålund (@ossiana)
 */

const mongooseHandler = require('../../helpers/mongoose_handler')
const clinicSchema = require('../../helpers/schemas/clinic')
const dentistSchema = require('../../helpers/schemas/dentist')
const timeslotSchema = require('../../helpers/schemas/timeslot')
const patientSchema = require('../../helpers/schemas/patient')

let config
try {
    config = require('../../helpers/config-server');
} catch (e) {
    config = require('../../helpers/dummy_config')
}
const bcrypt = require('bcrypt');

// Connect to MongoDB
let mongooseClient = new mongooseHandler(config.module_config.clinicUser.mongoURI)
mongooseClient.connect().then(() => {
    createModels()
}, null)

let clinicModel
let dentistModel
let timeslotModel
let patientModel

function reconnect(mongoURI) {
    mongooseClient.close()
    mongooseClient = new mongooseHandler(mongoURI)
    mongooseClient.connect().then(() => {
        createModels()
    }, null)
}

function createModels() {
    clinicModel = mongooseClient.model('Clinic', clinicSchema)
    dentistModel = mongooseClient.model('Dentist', dentistSchema)
    timeslotModel = mongooseClient.model('Timeslot', timeslotSchema)
    patientModel = mongooseClient.model('Patient', patientSchema)
}

/**
 * Does mongoose manipulation to get the dentist with the given email
 * @param email the email of the individual clinic that is wanted
 * @returns {Promise<*>} the JSON of the individual clinic
 */
async function clinicData(email) {
    return await clinicModel.findOne({email: email})
}


/**
 * Does mongoose manipulation to get the dentist with the given email
 * @param email email of the wanted dentist
 * @returns {Promise<*>} the JSON of the individual dentist
 */
async function getDentist(email) {
    return await dentistModel.findOne({email: email})
}

async function getClinics() {
    return await clinicModel.find({}).populate('dentists')
}

/**
 * Does mongoose manipulations to get all JSON coordinates, opening hours, name and address of all ClinicsMap.
 * @returns {Promise<{ClinicsMap: *[]}|boolean>} JSON containing coordinates, opening hours, name and address of all ClinicsMap.
 */
async function mapDataRequest() {

    let clinicMapJSON = {
        clinics: []
    }

    let clinicErrorFlag = false
    const clinics = await clinicModel.find()
    try {

        clinics.forEach(clinic => {

            let openingHourString

            if (clinic.openingHours.monday.start) {
                openingHourString = "Opening Hours: " +
                    "Monday: " + clinic.openingHours.monday.start + " - " + clinic.openingHours.monday.end +
                    "  Tuesday: " + clinic.openingHours.tuesday.start + " - " + clinic.openingHours.tuesday.end +
                    "  Wednesday: " + clinic.openingHours.wednesday.start + " - " + clinic.openingHours.wednesday.end +
                    "  Thursday: " + clinic.openingHours.thursday.start + " - " + clinic.openingHours.thursday.end +
                    "  Friday : " + clinic.openingHours.friday.start + " - " + clinic.openingHours.friday.end
            } else {
                openingHourString = "No opening hours given"
            }
            clinicMapJSON.clinics.push({
                coordinates: [clinic.coordinates.longitude, clinic.coordinates.latitude],
                properties: {
                    title: clinic.name,
                    address: "Address: " + clinic.address,
                    opening_hours: openingHourString

                }
            })
        })
        if (!clinicErrorFlag) {
            return clinicMapJSON
        } else {
            return clinicErrorFlag
        }
    } catch (err) {
        console.log(err)
    }
}

/**
 * Removes all data from the database
 * @returns {Promise<boolean>} returns success or failure
 */
async function removeData() {
    console.log("We are entering here")
    try {
        await clinicModel.deleteMany()
        await timeslotModel.deleteMany()
        await dentistModel.deleteMany()
        await patientModel.deleteMany()
    } catch (e) {
        return {
            response: "Failure"
        }
    }
    return {
        response: "Success"
    }
}

/**
 * Checks if the email provided already exists in the database.
 * @param email The email provided
 * @returns {Promise<boolean>} returns true if it was found in the database, false if not
 */
async function emailExists(email) {
    const clinic = await clinicModel.findOne({email: email});
    if (clinic) {
        return true
    }
}

/**
 * Find the correct clinic using the email provided in the body, then changes the clinic's information
 * with the provided information in the body. If there is none, it keeps the old information.
 * @param req the message received from the frontend, consisting of the body and user's input.
 * @returns {Promise<string>} The status and the response text.
 */
async function editInfo(req) {
    console.log(req)
    const email = req.body.email
    const clinic = await clinicModel.findOne({email})
    let message;
    if (clinic) {
        if (!req.body.newEmail === req.body.email) {
            if (await emailExists(req.body.newEmail)) {
                message = {
                    status: 400,
                    text: 'Email is already used!'
                }
            }
        } else {
            clinic.name = req.body.name || clinic.name;
            clinic.owner = req.body.owner || clinic.owner;
            clinic.address = req.body.address || clinic.address;
            clinic.email = req.body.newEmail || clinic.email;
            if (req.body.openingHours) {
                if (req.body.openingHours.monday) {
                    clinic.openingHours.monday.start = req.body.openingHours.monday.start || clinic.openingHours.monday.start;
                    clinic.openingHours.monday.end = req.body.openingHours.monday.end || clinic.openingHours.monday.end;
                }
                if (req.body.openingHours.tuesday) {
                    clinic.openingHours.tuesday.start = req.body.openingHours.tuesday.start || clinic.openingHours.tuesday.start;
                    clinic.openingHours.tuesday.end = req.body.openingHours.tuesday.end || clinic.openingHours.tuesday.end;
                }
                if (req.body.openingHours.wednesday) {
                    clinic.openingHours.wednesday.start = req.body.openingHours.wednesday.start || clinic.openingHours.wednesday.start;
                    clinic.openingHours.wednesday.end = req.body.openingHours.wednesday.end || clinic.openingHours.wednesday.end;
                }
                if (req.body.openingHours.thursday) {
                    clinic.openingHours.thursday.start = req.body.openingHours.thursday.start || clinic.openingHours.thursday.start;
                    clinic.openingHours.thursday.end = req.body.openingHours.thursday.end || clinic.openingHours.thursday.end;
                }
                if (req.body.openingHours.friday) {
                    clinic.openingHours.friday.start = req.body.openingHours.friday.start || clinic.openingHours.friday.start;
                    clinic.openingHours.friday.end = req.body.openingHours.friday.end || clinic.openingHours.friday.end;
                }
            }
            clinic.fikaHour = req.body.fikaHour || clinic.fikaHour;
            clinic.lunchHour = req.body.lunchHour || clinic.lunchHour;
            clinic.save();
            console.log("successfully updated")
            console.log(clinic)
            message = {
                status: 200,
                text: 'Successfully updated!'
            }
        }
    } else {
        message = {
            status: 404,
            text: 'Clinic not found!'
        }
    }
    return JSON.stringify(message);
}

/**
 * Finds the correct clinic using the email provided in the body.
 * Then validates the old password. If valid, the password is changed.
 * If invalid, it is communicated to the frontend.
 * @param req the message from the frontend, including the body, old password and new password.
 * @returns {Promise<string>} A status and a response text.
 */
async function changePassword(req) {
    const email = req.body.email
    console.log(email)
    const clinic = await clinicModel.findOne({email})
    console.log(clinic)
    let message;
    if (clinic) {
        if (await bcrypt.compare(req.body.oldPassword, clinic.password)) {
            clinic.password = await bcrypt.hash(req.body.password, 10);
            clinic.save();
            console.log("password changed");
            console.log(clinic)
            message = {
                status: 200,
                text: 'Successfully updated!'
            }
        } else {
            message = {
                status: 400,
                text: 'Old password is incorrect!'
            }
        }
    } else {
        message = {
            status: 404,
            text: 'Clinic not found!'
        }
    }
    return JSON.stringify(message);
}

/**
 * Finds the correct clinic using the clinic ID provided in the body.
 * Then fetches all dentists registered at said clinic.
 * If none are found an error is sent.
 * @param intermediary the message from the frontend, that being the body containing the clinics ID.
 * @returns {Promise<string>} A status and a response text.
 */
async function getDentistCard(intermediary) {
    let clinicDentists = {
        dentists: []
    };
    const clinicId = intermediary.body.clinicId
    const dentists = await dentistModel.find({clinic: clinicId})
    console.log(dentists)
    try {
        dentists.forEach(dentist => {
            clinicDentists.dentists.push({
                id: dentist._id,
                name: dentist.name,
                email: dentist.email,
                phoneNumber: dentist.phoneNumber,
                workWeek: {
                    monday: dentist.workweek.monday,
                    tuesday: dentist.workweek.tuesday,
                    wednesday: dentist.workweek.wednesday,
                    thursday: dentist.workweek.thursday,
                    friday: dentist.workweek.friday
                }
            })
        })
        console.log(clinicDentists)
    } catch (e) {
        console.log(e)
    }
    let message;
    if (dentists.length > 0) {
        return JSON.stringify(clinicDentists);
    } else {
        message = {
            status: 404,
            text: 'No dentists are registered'
        };
    }
    return JSON.stringify(message);
}

/**
 * Finds the correct dentist the ID provided in the body.
 * Then checks a matching dentist was found.
 * If no dentist is found matching an error is sent.
 * Otherwise, the workweek of said dentist will be updated.
 * @param req the message from the frontend, that being the body containing the dentist email.
 * @returns {Promise<string>} A status and a response text.
 */
async function setDentistSchedule(req) {
    const theID = req.body.id
    console.log(theID)
    const dentist = await dentistModel.findById(theID)
    let message;
    if (dentist) {
        dentist.workweek.monday = req.body.workweek.monday
        dentist.workweek.tuesday = req.body.workweek.tuesday
        dentist.workweek.wednesday = req.body.workweek.wednesday
        dentist.workweek.thursday = req.body.workweek.thursday
        dentist.workweek.friday = req.body.workweek.friday
        dentist.save();
        message = {
            status: 200,
            text: "Updated!"
        }
    } else {
        message = {
            status: 404,
            text: 'Dentist is not registered'
        }
    }
    return JSON.stringify(message);
}

/**
 * Finds the correct dentist the ID provided in the body.
 * Then checks a matching dentist was found.
 * If no dentist is found matching an error is sent.
 * Otherwise, name, phoneNumber and email of said dentist will be updated.
 * @param req the message from the frontend, that being the body containing the dentist email.
 * @returns {Promise<string>} A status and a response text.
 */
async function setDentistInfo(req) {
    const theID = req.body.id
    console.log(theID)
    const dentist = await dentistModel.findById(theID)
    let message;
    if (dentist) {
        dentist.name = req.body.name || dentist.name
        dentist.email = req.body.email || dentist.email
        dentist.phoneNumber = req.body.phonenumber || dentist.phoneNumber
        dentist.save();
        message = {
            status: 200,
            text: "Updated!"
        }
    } else {
        message = {
            status: 404,
            text: 'Dentist is not registered'
        }
    }
    return JSON.stringify(message);
}

/**
 * Finds the correct clinic provided in the body, then creates a new dentist with the data provided in the body
 * Then adds the dentist to the clinic's dentists list.
 * @param req the message from the frontend.
 * @returns {Promise<string>} A status and a response text.
 */
async function addDentist(req) {
    const email = req.body.email
    console.log(email)
    const clinic = await clinicModel.findOne({email})
    let message;
    if (clinic) {
        const dentist = new dentistModel({
            clinic: clinic._id,
            name: req.body.name,
            email: req.body.dentistEmail,
            phoneNumber: req.body.phoneNumber,
            speciality: req.body.specialty
        })
        dentist.save()
        console.log(dentist)
        clinic.dentists.push(dentist)
        clinic.save()
        console.log(clinic.dentists)
        message = {
            status: 200,
            text: 'Dentist Added!'
        }
    } else {
        message = {
            status: 404,
            text: 'Clinic not found!'
        }
    }
    return JSON.stringify(message);
}

/**
 * Retrieves a clinic by the ID provided in the request body.
 * @param req the request body from the frontend, including the clinic's ID
 * @returns {Promise<string>} Returns the clinic object as string.
 */
async function getCurrentClinic(req) {
    const clinic = await clinicModel.findById(req.body.clinicId)
    if (clinic) {
        return JSON.stringify(clinic)
    } else {
        return JSON.stringify({response:"failed"})
    }

}

const clinicController = {
    removeData,
    mapDataRequest,
    getDentistCard,
    setDentistSchedule,
    setDentistInfo,
    clinicData,
    reconnect,
    editInfo,
    changePassword,
    addDentist,
    getCurrentClinic,
    getClinics,
    getDentist
}

module.exports = clinicController
