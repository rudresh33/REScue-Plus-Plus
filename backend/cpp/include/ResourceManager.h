#ifndef RESOURCEMANAGER_H
#define RESOURCEMANAGER_H

#include <map>
#include <string>
#include "Resource.h"

class ResourceManager {
public:
    void addResource(std::string type, int quantity);
    void setResources(const std::map<std::string, Resource>& newResources); // NEW
    std::map<std::string, Resource> getResources() const;

private:
    std::map<std::string, Resource> resources;
};

#endif

