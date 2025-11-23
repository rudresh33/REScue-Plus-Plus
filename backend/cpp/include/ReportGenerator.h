#ifndef REPORTGENERATOR_H
#define REPORTGENERATOR_H

#include <vector>
#include <map>
#include "Civilian.h"
#include "Shelter.h"
#include "Resource.h"

class ReportGenerator {
public:
    ReportGenerator(); 
    void generateReport(const std::vector<Civilian>& civilians, 
                       const std::vector<Shelter>& shelters, 
                       const std::map<std::string, Resource>& resources);
};

#endif
