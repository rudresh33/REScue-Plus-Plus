#include "../include/Shelter.h"

// Constructor: Order matches addon.cpp (ID, Name, Capacity, Location, Category)
Shelter::Shelter(int id, std::string name, int capacity, std::string location, std::string category)
    : id(id), name(name), capacity(capacity), location(location), category(category), occupancy(0) {}

// Getters
int Shelter::getId() const { return id; }
std::string Shelter::getName() const { return name; }
int Shelter::getCapacity() const { return capacity; }
int Shelter::getOccupancy() const { return occupancy; }
std::string Shelter::getLocation() const { return location; }
std::string Shelter::getCategory() const { return category; }

// Setters & Logic
void Shelter::setOccupancy(int count) { 
    if (count <= capacity && count >= 0) occupancy = count; 
}

bool Shelter::hasSpace() const {
    return occupancy < capacity;
}
