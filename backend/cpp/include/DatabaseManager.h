#ifndef DATABASEMANAGER_H
#define DATABASEMANAGER_H

#include <string>
#include <vector>
#include <map>
#include "Civilian.h"
#include "Shelter.h"
#include "Resource.h"

class DatabaseManager {
public:
    DatabaseManager(const std::string& file = "civilians.csv");
    
    // Civilian Data
    void loadData(std::vector<Civilian>& civilians);
    void saveData(const std::vector<Civilian>& civilians);

    // Shelter Data
    std::vector<Shelter> loadShelters();
    void saveShelters(const std::vector<Shelter>& shelters);

    // Resource Data
    std::map<std::string, Resource> loadResources();
    void saveResources(const std::map<std::string, Resource>& resources);

private:
    std::string filePath;
};

#endif

