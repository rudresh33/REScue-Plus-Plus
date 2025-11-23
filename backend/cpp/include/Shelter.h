#ifndef SHELTER_H
#define SHELTER_H

#include <string>

class Shelter {
public:
    // Constructor includes Category
    Shelter(int id, std::string name, int capacity, std::string location, std::string category);

    int getId() const;
    std::string getName() const;
    int getCapacity() const;
    int getOccupancy() const;
    std::string getLocation() const;
    std::string getCategory() const; // Getter for "Hospital" vs "General"

    void setOccupancy(int count);
    bool hasSpace() const;

private:
    int id;
    std::string name;
    int capacity;
    int occupancy;
    std::string location;
    std::string category; 
};

#endif
