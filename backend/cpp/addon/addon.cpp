#include <napi.h>
#include "../include/Civilian.h"
#include "../include/DatabaseManager.h"
#include "../include/ShelterManager.h"
#include "../include/ResourceManager.h"
#include "../include/ReportGenerator.h"
#include "../include/TriageSystem.h"
#include <vector>
#include <string>
#include <filesystem> // Include this

std::vector<Civilian> civilians;
ShelterManager shelterManager;
ResourceManager resourceManager;
DatabaseManager dbManager;
ReportGenerator reportGen;
TriageSystem triageSystem;

Napi::Value LoadData(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    civilians.clear();
    shelterManager.clear();

    // 1. Load Civilians
    dbManager.loadData(civilians);
    
    // 2. Load Shelters (SAFE MODE)
    // Only create defaults if the FILE DOES NOT EXIST. 
    // If file exists but is empty, assume user wants it empty (or parse failed), don't overwrite.
    bool shelterFileExists = std::filesystem::exists("server/data/shelters.csv");

    std::vector<Shelter> loadedShelters = dbManager.loadShelters();

    if (loadedShelters.empty() && !shelterFileExists) {
        // Only defaults if file is missing entirely
        shelterManager.addShelter(Shelter(1, "Central High School", 500, "Mumbai Central", "General"));
        shelterManager.addShelter(Shelter(2, "City General Hospital", 50, "Mumbai Central", "Hospital"));
        dbManager.saveShelters(shelterManager.getShelters());
        std::cout << "[Cpp] Created default shelters (File was missing)" << std::endl;
    } else {
        for (const auto& s : loadedShelters) shelterManager.addShelter(s);
    }

    // 3. Sync Occupancy
    for(auto& s : shelterManager.getShelters()) shelterManager.updateOccupancy(s.getId(), 0);
    
    for (const auto& civ : civilians) {
        int assignedID = civ.getAssignedShelter();
        if (assignedID > 0) {
            shelterManager.incrementOccupancy(assignedID);
        }
    }

    // 4. Load Resources
    auto loadedRes = dbManager.loadResources();
    if (loadedRes.empty() && !std::filesystem::exists("server/data/resources.csv")) {
        resourceManager.addResource("Food Packets", 5000);
        resourceManager.addResource("Water Bottles", 10000);
        dbManager.saveResources(resourceManager.getResources());
    } else {
        resourceManager.setResources(loadedRes);
    }
    
    return Napi::String::New(env, "Data Loaded & Synced");
}

// ... [Keep GenerateReport, GetAllCivilians, UpdateCivilianStatus, AddCivilian, UpdateCivilianTriage, GetShelters, UpdateShelter, AddShelter as is] ...
// (Paste the rest of the file from previous working version)

Napi::Value GenerateReport(const Napi::CallbackInfo& info) {
    reportGen.generateReport(civilians, shelterManager.getShelters(), resourceManager.getResources());
    return Napi::String::New(info.Env(), "Report Generated");
}
Napi::Value GetAllCivilians(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array result = Napi::Array::New(env, civilians.size());
    for (size_t i = 0; i < civilians.size(); i++) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("id", civilians[i].getId());
        obj.Set("name", civilians[i].getName());
        obj.Set("status", civilians[i].getStatus());
        obj.Set("location", civilians[i].getLocation());
        obj.Set("injury", civilians[i].getInjurySeverity());
        obj.Set("shelterId", civilians[i].getAssignedShelter());
        obj.Set("age", civilians[i].getAge());
        obj.Set("gender", civilians[i].getGender());
        result[i] = obj;
    }
    return result;
}
Napi::Value UpdateCivilianStatus(const Napi::CallbackInfo& info) {
    int id = info[0].As<Napi::Number>().Int32Value();
    std::string status = info[1].As<Napi::String>().Utf8Value();
    for (auto& civ : civilians) {
        if (civ.getId() == id) {
            civ.setStatus(status);
            dbManager.saveData(civilians);
            return Napi::Boolean::New(info.Env(), true);
        }
    }
    return Napi::Boolean::New(info.Env(), false);
}
Napi::Value AddCivilian(const Napi::CallbackInfo& info) {
    std::string name = info[0].As<Napi::String>().Utf8Value();
    int age = info[1].As<Napi::Number>().Int32Value();
    std::string gender = info[2].As<Napi::String>().Utf8Value();
    std::string location = info[3].As<Napi::String>().Utf8Value();
    std::string injury = info[4].As<Napi::String>().Utf8Value();
    int maxId = 0;
    for(const auto& c : civilians) if(c.getId() > maxId) maxId = c.getId();
    Civilian newCiv(maxId + 1, name, age, gender, location, injury);
    civilians.push_back(newCiv);
    dbManager.saveData(civilians);
    return Napi::Number::New(info.Env(), maxId + 1);
}
Napi::Value UpdateCivilianTriage(const Napi::CallbackInfo& info) {
    int id = info[0].As<Napi::Number>().Int32Value();
    std::string injury = info[1].As<Napi::String>().Utf8Value();
    for(auto& c : civilians) {
        if(c.getId() == id) {
            c.setInjurySeverity(injury);
            dbManager.saveData(civilians);
            return Napi::Boolean::New(info.Env(), true);
        }
    }
    return Napi::Boolean::New(info.Env(), false);
}
Napi::Value GetShelters(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    auto shelters = shelterManager.getShelters();
    Napi::Array res = Napi::Array::New(env, shelters.size());
    for(size_t i=0; i<shelters.size(); i++) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("id", shelters[i].getId());
        obj.Set("name", shelters[i].getName());
        obj.Set("capacity", shelters[i].getCapacity());
        obj.Set("occupancy", shelters[i].getOccupancy());
        obj.Set("location", shelters[i].getLocation());
        obj.Set("category", shelters[i].getCategory());
        res[i] = obj;
    }
    return res;
}
Napi::Value UpdateShelter(const Napi::CallbackInfo& info) {
    int id = info[0].As<Napi::Number>().Int32Value();
    int occ = info[1].As<Napi::Number>().Int32Value();
    return Napi::Boolean::New(info.Env(), shelterManager.updateOccupancy(id, occ));
}
Napi::Value AddShelter(const Napi::CallbackInfo& info) {
    std::string name = info[0].As<Napi::String>().Utf8Value();
    int cap = info[1].As<Napi::Number>().Int32Value();
    std::string loc = info[2].As<Napi::String>().Utf8Value();
    std::string cat = info[3].As<Napi::String>().Utf8Value();
    int id = 1;
    auto list = shelterManager.getShelters();
    if(!list.empty()) id = list.back().getId() + 1;
    shelterManager.addShelter(Shelter(id, name, cap, loc, cat));
    dbManager.saveShelters(shelterManager.getShelters());
    return Napi::Number::New(info.Env(), id);
}
Napi::Value GetResources(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    auto res = resourceManager.getResources();
    Napi::Array arr = Napi::Array::New(env, res.size());
    int i=0;
    for(auto const& [key, val] : res) {
        Napi::Object obj = Napi::Object::New(env);
        obj.Set("type", val.getType());
        obj.Set("quantity", val.getQuantity());
        arr[i++] = obj;
    }
    return arr;
}
Napi::Value UpdateResource(const Napi::CallbackInfo& info) {
    std::string type = info[0].As<Napi::String>().Utf8Value();
    int qty = info[1].As<Napi::Number>().Int32Value();
    resourceManager.addResource(type, qty);
    dbManager.saveResources(resourceManager.getResources());
    return Napi::Boolean::New(info.Env(), true);
}

// RE-PASTE RunAutoTriage to ensure it works with the new logic
Napi::Value RunAutoTriage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    dbManager.loadData(civilians); 
    auto loadedRes = dbManager.loadResources();
    resourceManager.setResources(loadedRes);

    while(!triageSystem.isEmpty()) triageSystem.getNextPatient(); 
    
    for (const auto& civ : civilians) {
        // Queue if alive, missing shelter, not missing status
        if ((civ.getAssignedShelter() == 0 || civ.getAssignedShelter() == -1) && 
            civ.getStatus() != "Deceased" && 
            civ.getStatus() != "Missing") {
            triageSystem.addCivilian(civ); 
        }
    }

    auto resources = resourceManager.getResources();
    int foodStock = resources.count("Food Pack") ? resources.at("Food Pack").getQuantity() : 0;
    int waterStock = resources.count("Water Bottle") ? resources.at("Water Bottle").getQuantity() : 0;
    int medStock   = resources.count("First Aid Kit") ? resources.at("First Aid Kit").getQuantity() : 0;

    int processed = 0;
    int failed = 0;
    int waterDeficit = 0;
    int foodDeficit = 0;

    while (!triageSystem.isEmpty()) {
        Civilian p = triageSystem.getNextPatient();
        
        Civilian* target = nullptr;
        for(auto& c : civilians) if(c.getId() == p.getId()) target = &c;
        if(!target) continue;

        // Resource Logic: Track deficit but ALLOW assignment (Lenient Mode)
        if (waterStock > 0) waterStock--; else waterDeficit++;
        if (foodStock > 0) foodStock--; else foodDeficit++;

        bool needsMeds = (target->getInjurySeverity() == "Critical" || target->getInjurySeverity() == "Moderate");
        if (needsMeds && medStock > 0) medStock--;

        int sId = shelterManager.findBestShelter(target->getInjurySeverity(), target->getLocation());
        
        if (sId > 0) {
            target->setAssignedShelter(sId);
            shelterManager.incrementOccupancy(sId); 
            processed++;
        } else {
            failed++;
        }
    }

    resourceManager.addResource("Food Pack", foodStock);
    resourceManager.addResource("Water Bottle", waterStock);
    resourceManager.addResource("First Aid Kit", medStock);
    
    dbManager.saveData(civilians);
    dbManager.saveShelters(shelterManager.getShelters());
    dbManager.saveResources(resourceManager.getResources());

    std::string msg = "Triage Complete: " + std::to_string(processed) + " assigned. ";
    if (failed > 0) msg += " (" + std::to_string(failed) + " failed due to shelter capacity). ";
    if (waterDeficit > 0) msg += "[ALERT] Water Shortage: -" + std::to_string(waterDeficit);

    return Napi::String::New(env, msg);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("loadData", Napi::Function::New(env, LoadData));
    exports.Set("generateReport", Napi::Function::New(env, GenerateReport));
    exports.Set("getAllCivilians", Napi::Function::New(env, GetAllCivilians));
    exports.Set("updateCivilianStatus", Napi::Function::New(env, UpdateCivilianStatus));
    exports.Set("getShelters", Napi::Function::New(env, GetShelters));
    exports.Set("updateShelter", Napi::Function::New(env, UpdateShelter));
    exports.Set("getResources", Napi::Function::New(env, GetResources));
    exports.Set("updateResource", Napi::Function::New(env, UpdateResource));
    exports.Set("runAutoTriage", Napi::Function::New(env, RunAutoTriage));
    exports.Set("addCivilian", Napi::Function::New(env, AddCivilian));
    exports.Set("updateCivilianTriage", Napi::Function::New(env, UpdateCivilianTriage));
    exports.Set("addShelter", Napi::Function::New(env, AddShelter));
    return exports;
}

NODE_API_MODULE(rescue_addon, Init)
