#include "../include/ResourceManager.h"

// Add resource now accepts full object logic, but for simple updating (delta),
// we might just want to update quantity. 
// However, the Map uses 'Type' as key.
void ResourceManager::addResource(std::string type, int quantity) {
    if (resources.find(type) != resources.end()) {
        // If exists, just update quantity
        int oldQ = resources.at(type).getQuantity();
        resources.at(type).setQuantity(quantity); 
    } else {
        // If new (and we don't have metadata), create a dummy. 
        // Ideally this shouldn't happen if we load from DB first.
        // We assign a random large ID to avoid conflict or 0.
        Resource r(0, type, quantity, "units", "All", "Medium");
        resources.insert({type, r});
    }
}

// NEW: Set all resources (from DB load)
void ResourceManager::setResources(const std::map<std::string, Resource>& newResources) {
    resources = newResources;
}

std::map<std::string, Resource> ResourceManager::getResources() const {
    return resources;
}
