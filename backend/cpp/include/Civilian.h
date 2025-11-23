#ifndef CIVILIAN_H
#define CIVILIAN_H

#include <string>
#include <iostream>

class Civilian {
private:
    int id;
    std::string name;
    int age;
    std::string gender;
    std::string location;
    std::string injurySeverity;
    std::string status;
    int assignedShelter;

public:
    Civilian(int id, std::string name, int age, std::string gender, std::string location, std::string injury);

    // Getters
    int getId() const;
    std::string getName() const;
    int getAge() const;
    std::string getGender() const;
    std::string getLocation() const;
    std::string getInjurySeverity() const;
    std::string getStatus() const;
    int getAssignedShelter() const;

    // Setters
    void setStatus(std::string s);
    void setAssignedShelter(int shelterId);
    void setInjurySeverity(std::string injury); // Critical for Triage updates
    void setLocation(std::string loc);
};

#endif
