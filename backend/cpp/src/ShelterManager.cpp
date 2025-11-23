#include "../include/ShelterManager.h"
#include <limits>

void ShelterManager::addShelter(const Shelter& shelter) {
    shelters.push_back(shelter);
}

std::vector<Shelter> ShelterManager::getShelters() const {
    return shelters;
}

bool ShelterManager::updateOccupancy(int id, int newCount) {
    for (auto& shelter : shelters) {
        if (shelter.getId() == id) {
            shelter.setOccupancy(newCount);
            return true;
        }
    }
    return false;
}

void ShelterManager::incrementOccupancy(int id) {
    for (auto& shelter : shelters) {
        if (shelter.getId() == id) {
            if (shelter.hasSpace()) {
                shelter.setOccupancy(shelter.getOccupancy() + 1);
            }
            return;
        }
    }
}

void ShelterManager::clear() {
    shelters.clear();
}

// Improved Load Balancing Logic (from previous step)
int ShelterManager::findBestShelter(const std::string& status, const std::string& location) {
    std::string targetCategory = "General";
    if (status == "Injured" || status == "Critical" || status == "Hospitalized") {
        targetCategory = "Hospital";
    }

    int bestShelterId = 0;
    double lowestLoad = 1.1; 

    // 1. Local Search
    bool foundLocal = false;
    for (const auto& shelter : shelters) {
        if (shelter.getCategory() == targetCategory && 
            shelter.getLocation() == location && 
            shelter.hasSpace()) {
            
            double load = (double)shelter.getOccupancy() / (double)shelter.getCapacity();
            if (load < lowestLoad) {
                lowestLoad = load;
                bestShelterId = shelter.getId();
                foundLocal = true;
            }
        }
    }

    if (foundLocal) {
        return bestShelterId; // Don't increment here, let the caller do it or do it once
    }

    // 2. Global Fallback
    lowestLoad = 1.1;
    for (const auto& shelter : shelters) {
        if (shelter.getCategory() == targetCategory && shelter.hasSpace()) {
            double load = (double)shelter.getOccupancy() / (double)shelter.getCapacity();
            if (load < lowestLoad) {
                lowestLoad = load;
                bestShelterId = shelter.getId();
            }
        }
    }

    return bestShelterId;
}
