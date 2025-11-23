#include "../include/Resource.h"

Resource::Resource(int id, std::string type, int quantity, std::string unit, std::string location, std::string priority) 
    : id(id), type(type), quantity(quantity), unit(unit), location(location), priority(priority) {}

int Resource::getId() const { return id; }
std::string Resource::getType() const { return type; }
int Resource::getQuantity() const { return quantity; }
std::string Resource::getUnit() const { return unit; }
std::string Resource::getLocation() const { return location; }
std::string Resource::getPriority() const { return priority; }

void Resource::setQuantity(int q) { quantity = q; }

