#include "../include/Civilian.h"

// Constructor
Civilian::Civilian(int id, std::string name, int age, std::string gender, std::string location, std::string injury)
    : id(id), name(name), age(age), gender(gender), location(location), injurySeverity(injury), status("Missing"), assignedShelter(0) {
    
    // Auto-set status based on injury during creation
    if (injury == "None") status = "Safe";
    else status = "Injured";
}

// Getters
int Civilian::getId() const { return id; }
std::string Civilian::getName() const { return name; }
int Civilian::getAge() const { return age; }
std::string Civilian::getGender() const { return gender; }
std::string Civilian::getLocation() const { return location; }
std::string Civilian::getInjurySeverity() const { return injurySeverity; }
std::string Civilian::getStatus() const { return status; }
int Civilian::getAssignedShelter() const { return assignedShelter; }

// Setters
void Civilian::setStatus(std::string s) { status = s; }
void Civilian::setAssignedShelter(int shelterId) { assignedShelter = shelterId; }
void Civilian::setInjurySeverity(std::string injury) { injurySeverity = injury; }
void Civilian::setLocation(std::string loc) { location = loc; }
