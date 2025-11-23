// server/services/civilians.js
const csv = require("./csvHandler");

async function getAllCivilians() {
    const raw = await csv.readCivilians();

    return raw.map(c => ({
        ID: Number(c.ID),
        Name: c.Name || "",
        Age: c.Age || "",
        Gender: c.Gender || "",
        Location: c.Location || "",
        Status: c.Status || "Safe",
        InjurySeverity: c.InjurySeverity || "None",
        ShelterID: c.ShelterID || ""
    }));
}

async function addCivilian(newCiv) {
    let civs = await getAllCivilians();

    const newID = civs.length > 0
        ? Math.max(...civs.map(c => Number(c.ID))) + 1
        : 1;

    const civ = {
        ID: newID,
        Name: newCiv.Name?.trim() || "Unknown",
        Age: newCiv.Age,
        Gender: newCiv.Gender,
        Location: newCiv.Location,
        Status: newCiv.Status || "Safe",
        InjurySeverity: newCiv.InjurySeverity || "None",
        ShelterID: ""
    };

    civs.push(civ);
    
    // FIX: Use the correct helper method instead of the undefined CIV_FILE
    await csv.writeCivilians(civs);

    return civ;
}

async function updateCivilianStatus(ID, Status) {
    let civs = await getAllCivilians();

    const c = civs.find(x => Number(x.ID) === Number(ID));
    if (!c) return false;

    c.Status = Status;
    await csv.writeCivilians(civs);
    return true;
}

async function updateCivilianTriage(ID, InjurySeverity) {
    let civs = await getAllCivilians();

    const c = civs.find(x => Number(x.ID) === Number(ID));
    if (!c) return false;

    c.InjurySeverity = InjurySeverity;
    await csv.writeCivilians(civs);
    return true;
}

async function deleteCivilian(ID) {
    let civs = await getAllCivilians();

    const filtered = civs.filter(c => Number(c.ID) !== Number(ID));

    if (filtered.length === civs.length) return false;

    await csv.writeCivilians(filtered);
    return true;
}

module.exports = {
    getAllCivilians,
    addCivilian,
    updateCivilianStatus,
    updateCivilianTriage,
    deleteCivilian
};
