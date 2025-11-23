#include "../include/DatabaseManager.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <filesystem>

DatabaseManager::DatabaseManager(const std::string& file) {}

std::string cleanStr(std::string s) {
    s.erase(std::remove(s.begin(), s.end(), '\r'), s.end());
    s.erase(std::remove(s.begin(), s.end(), '\n'), s.end());
    if (s.size() >= 2 && s.front() == '"' && s.back() == '"') {
        return s.substr(1, s.size() - 2);
    }
    return s;
}

// ---------------------
// CIVILIANS
// ---------------------
void DatabaseManager::loadData(std::vector<Civilian>& civilians) {
    civilians.clear();
    std::string securePath = "server/data/civilians.csv";
    std::ifstream file(securePath);

    if (!file.is_open()) {
        std::cerr << "[Cpp] Warning: Could not open " << securePath << std::endl;
        return;
    }

    std::string line;
    if (!std::getline(file, line)) return; // header

    while (std::getline(file, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string idStr, name, ageStr, gender, location, injury, status, shelterStr;

        if (std::getline(ss, idStr, ',') &&
            std::getline(ss, name, ',') &&
            std::getline(ss, ageStr, ',') &&
            std::getline(ss, gender, ',') &&
            std::getline(ss, location, ',') &&
            std::getline(ss, status, ',') &&
            std::getline(ss, injury, ',')) {
            
            std::getline(ss, shelterStr); 
            try {
                int id = std::stoi(cleanStr(idStr));
                int age = std::stoi(cleanStr(ageStr));
                int shelterId = 0;
                std::string sIdClean = cleanStr(shelterStr);
                if (!sIdClean.empty()) shelterId = std::stoi(sIdClean);

                Civilian civ(id, cleanStr(name), age, cleanStr(gender), cleanStr(location), cleanStr(injury));
                civ.setStatus(cleanStr(status));
                civ.setAssignedShelter(shelterId);
                civilians.push_back(civ);
            } catch (...) { continue; }
        }
    }
    file.close();
}

void DatabaseManager::saveData(const std::vector<Civilian>& civilians) {
    std::ofstream file("server/data/civilians.csv");
    if (!file.is_open()) return;
    file << "ID,Name,Age,Gender,Location,Status,InjurySeverity,ShelterID\n";
    for (const auto& civ : civilians) {
        file << civ.getId() << "," << civ.getName() << "," << civ.getAge() << ","
             << civ.getGender() << "," << civ.getLocation() << "," 
             << civ.getStatus() << "," << civ.getInjurySeverity() << "," 
             << civ.getAssignedShelter() << "\n";
    }
    file.close();
}

// ---------------------
// SHELTERS (FIXED)
// ---------------------
std::vector<Shelter> DatabaseManager::loadShelters() {
    std::vector<Shelter> shelters;
    std::string path = "server/data/shelters.csv";
    std::ifstream file(path);
    
    if (!file.is_open()) {
        std::cout << "[Cpp] Shelters file not found: " << path << std::endl;
        return shelters;
    }

    std::string line;
    if (!std::getline(file, line)) return shelters; // Skip header

    while (std::getline(file, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string idStr, name, capacityStr, location, category, occupancyStr;

        // Using a more robust parsing strategy for the last column
        if (std::getline(ss, idStr, ',') &&
            std::getline(ss, name, ',') &&
            std::getline(ss, capacityStr, ',') &&
            std::getline(ss, location, ',') &&
            std::getline(ss, category, ',')) {
            
            // Occupancy is last, read until end
            std::getline(ss, occupancyStr);

            try {
                int id = std::stoi(cleanStr(idStr));
                int cap = std::stoi(cleanStr(capacityStr));
                std::string loc = cleanStr(location);
                std::string cat = cleanStr(category);
                
                Shelter s(id, cleanStr(name), cap, loc, cat);
                
                std::string occ = cleanStr(occupancyStr);
                if (!occ.empty()) s.setOccupancy(std::stoi(occ));
                
                shelters.push_back(s);
            } catch (const std::exception& e) {
                std::cerr << "[Cpp] Parse error on shelter line: " << line << " -> " << e.what() << std::endl;
            }
        }
    }
    file.close();
    // std::cout << "[Cpp] Loaded " << shelters.size() << " shelters." << std::endl;
    return shelters;
}

void DatabaseManager::saveShelters(const std::vector<Shelter>& shelters) {
    std::ofstream file("server/data/shelters.csv");
    if (!file.is_open()) return;
    file << "ID,Name,Capacity,Location,Category,Occupancy\n";
    for (const auto& s : shelters) {
        file << s.getId() << "," << s.getName() << "," << s.getCapacity() << ","
             << s.getLocation() << "," << s.getCategory() << "," 
             << s.getOccupancy() << "\n";
    }
    file.close();
}

// ---------------------
// RESOURCES
// ---------------------
std::map<std::string, Resource> DatabaseManager::loadResources() {
    std::map<std::string, Resource> resources;
    std::ifstream file("server/data/resources.csv");
    if (!file.is_open()) return resources;

    std::string line;
    std::getline(file, line); 

    while (std::getline(file, line)) {
        if (line.empty()) continue;
        std::stringstream ss(line);
        std::string idStr, type, qtyStr, unit, loc, prio;

        if (std::getline(ss, idStr, ',') &&
            std::getline(ss, type, ',') &&
            std::getline(ss, qtyStr, ',') &&
            std::getline(ss, unit, ',') &&
            std::getline(ss, loc, ',')) {
            
            std::getline(ss, prio);
            try {
                int id = std::stoi(cleanStr(idStr));
                int qty = std::stoi(cleanStr(qtyStr));
                std::string t = cleanStr(type);
                Resource r(id, t, qty, cleanStr(unit), cleanStr(loc), cleanStr(prio));
                resources.insert({t, r});
            } catch (...) {}
        }
    }
    file.close();
    return resources;
}

void DatabaseManager::saveResources(const std::map<std::string, Resource>& resources) {
    std::ofstream file("server/data/resources.csv");
    if (!file.is_open()) return;
    file << "ID,Type,Quantity,Unit,Location,Priority\n";
    for (const auto& pair : resources) {
        const Resource& r = pair.second;
        file << r.getId() << "," << r.getType() << "," << r.getQuantity() << ","
             << r.getUnit() << "," << r.getLocation() << "," << r.getPriority() << "\n";
    }
    file.close();
}
