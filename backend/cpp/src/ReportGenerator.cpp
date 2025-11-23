#include "../include/ReportGenerator.h"
#include <fstream>
#include <iostream>
#include <ctime>
#include <iomanip>

const std::string REPORT_PATH = "server/data/simulation_report.txt";

ReportGenerator::ReportGenerator() {}

void ReportGenerator::generateReport(const std::vector<Civilian>& civilians, 
                                     const std::vector<Shelter>& shelters, 
                                     const std::map<std::string, Resource>& resources) {
    
    std::ofstream file(REPORT_PATH);
    if (!file.is_open()) return;

    std::time_t now = std::time(0);
    char* dt = std::ctime(&now);

    file << "####################################################\n";
    file << "   REScue++ ADVANCED SITUATION REPORT\n";
    file << "   Timestamp: " << dt;
    file << "####################################################\n\n";

    // [1] EXECUTIVE SUMMARY
    int total = civilians.size();
    int sheltered = 0, injured = 0, deceased = 0, missing = 0;
    std::vector<Civilian> unassigned;

    for (const auto& c : civilians) {
        if (c.getStatus() == "Deceased") deceased++;
        else if (c.getStatus() == "Missing") missing++;
        else if (c.getStatus() == "Injured" || c.getStatus() == "Critical") injured++;
        
        if (c.getAssignedShelter() > 0) sheltered++;
        else if (c.getStatus() != "Deceased" && c.getStatus() != "Missing") unassigned.push_back(c);
    }

    file << "[1] EXECUTIVE SUMMARY\n";
    file << "    Total Civilians: " << total << "\n";
    file << "    In Shelters:     " << sheltered << " (" << (total?sheltered*100/total:0) << "%)\n";
    file << "    Unassigned:      " << unassigned.size() << " [ACTION REQUIRED]\n";
    file << "    Casualties:      " << deceased << "\n\n";

    // [2] SHELTER STATUS (With Duplicates Removed logic check)
    file << "[2] SHELTER CAPACITY\n";
    file << std::left << std::setw(5) << "ID" << std::setw(30) << "Name" << "Occupancy\n";
    for (const auto& s : shelters) {
        file << std::left << std::setw(5) << s.getId() 
             << std::setw(30) << s.getName().substr(0,29) 
             << s.getOccupancy() << "/" << s.getCapacity() << "\n";
    }
    file << "\n";

    // [3] CRITICAL ATTENTION LIST (The "Useful" Part)
    file << "[3] UNASSIGNED CIVILIANS (TRIAGE REQUIRED)\n";
    if (unassigned.empty()) {
        file << "    All safe civilians have been sheltered.\n";
    } else {
        file << std::left << std::setw(5) << "ID" << std::setw(20) << "Name" << std::setw(15) << "Loc" << "Issue\n";
        for (const auto& c : unassigned) {
            std::string issue = "No Capacity";
            if (c.getInjurySeverity() == "Critical") issue = "Needs Hospital";
            file << std::left << std::setw(5) << c.getId() 
                 << std::setw(20) << c.getName().substr(0,19)
                 << std::setw(15) << c.getLocation()
                 << issue << "\n";
        }
    }

    file.close();
}
