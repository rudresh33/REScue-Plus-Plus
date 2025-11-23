#ifndef RESOURCE_H
#define RESOURCE_H

#include <string>

class Resource {
public:
    // Updated to match CSV: ID, Type, Quantity, Unit, Location, Priority
    Resource(int id, std::string type, int quantity, std::string unit, std::string location, std::string priority);
    
    // Default constructor needed for maps sometimes
    Resource() : id(0), quantity(0) {}

    int getId() const;
    std::string getType() const;
    int getQuantity() const;
    std::string getUnit() const;
    std::string getLocation() const;
    std::string getPriority() const;

    void setQuantity(int q);

private:
    int id;
    std::string type;
    int quantity;
    std::string unit;
    std::string location;
    std::string priority;
};

#endif

