#ifndef SHELTERMANAGER_H
#define SHELTERMANAGER_H

#include <vector>
#include <string>
#include "Shelter.h"

class ShelterManager {
public:
    void addShelter(const Shelter& shelter);
    std::vector<Shelter> getShelters() const;
    
    bool updateOccupancy(int id, int newCount);
    void incrementOccupancy(int id); 
    int findBestShelter(const std::string& status, const std::string& location);
    
    // NEW: Method to clear memory before reloading
    void clear();

private:
    std::vector<Shelter> shelters;
};

#endif
