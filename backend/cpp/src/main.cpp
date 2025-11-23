#include "DatabaseManager.h"
#include "TriageSystem.h"
#include "ShelterManager.h"
#include "ResourceManager.h"
#include "ReportGenerator.h"
#include <iostream>
#include <limits>

void displayMenu() {
    std::cout << "\n╔══════════════════════════════════════╗\n";
    std::cout << "║       REScue++ MAIN MENU            ║\n";
    std::cout << "╚══════════════════════════════════════╝\n";
    std::cout << "1. Register New Civilian\n";
    std::cout << "2. View All Civilians\n";
    std::cout << "3. Add to Triage Queue\n";
    std::cout << "4. Process Next Patient\n";
    std::cout << "5. Assign Shelter\n";
    std::cout << "6. View All Shelters\n";
    std::cout << "7. Allocate Resources\n";
    std::cout << "8. View Resource Inventory\n";
    std::cout << "9. Generate Full Report\n";
    std::cout << "10. Export Report to File\n";
    std::cout << "11. Save & Exit\n";
    std::cout << "Enter choice: ";
}

void clearInput() {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

int main() {
    // Initialize managers
    DatabaseManager* dbManager = DatabaseManager::getInstance("civilians.csv");
    dbManager->loadFromFile();
    
    TriageSystem triageSystem;
    ShelterManager shelterManager;
    ResourceManager resourceManager;
    
    // Initialize shelters
    shelterManager.addShelter(std::make_shared<Shelter>(1, "Central Relief Camp", "Downtown", 200));
    shelterManager.addShelter(std::make_shared<Shelter>(2, "East Zone Shelter", "East District", 150));
    shelterManager.addShelter(std::make_shared<Shelter>(3, "West Zone Shelter", "West District", 100));
    
    // Initialize resources
    resourceManager.addResource(std::make_shared<Resource>("Food Packets", 1000, "units"));
    resourceManager.addResource(std::make_shared<Resource>("Water Bottles", 2000, "bottles"));
    resourceManager.addResource(std::make_shared<Resource>("Medical Kits", 500, "kits"));
    resourceManager.addResource(std::make_shared<Resource>("Blankets", 800, "pieces"));
    
    ReportGenerator reportGen(dbManager, &shelterManager, &resourceManager);
    
    int choice;
    bool running = true;
    
    std::cout << "╔══════════════════════════════════════════════════╗\n";
    std::cout << "║  REScue++: Disaster Response Management System  ║\n";
    std::cout << "╚══════════════════════════════════════════════════╝\n\n";
    
    while (running) {
        displayMenu();
        std::cin >> choice;
        
        if (std::cin.fail()) {
            clearInput();
            std::cout << "Invalid input. Please enter a number.\n";
            continue;
        }
        
        clearInput();
        
        switch (choice) {
            case 1: { // Register New Civilian
                int id, age;
                std::string name, gender, location;
                int statusChoice;
                
                std::cout << "\n--- Register New Civilian ---\n";
                std::cout << "Enter ID: ";
                std::cin >> id;
                clearInput();
                
                std::cout << "Enter Name: ";
                std::getline(std::cin, name);
                
                std::cout << "Enter Age: ";
                std::cin >> age;
                clearInput();
                
                std::cout << "Enter Gender: ";
                std::getline(std::cin, gender);
                
                std::cout << "Enter Location: ";
                std::getline(std::cin, location);
                
                std::cout << "Status (0=Safe, 1=Injured, 2=Missing, 3=Deceased): ";
                std::cin >> statusChoice;
                
                auto civilian = std::make_shared<Civilian>(
                    id, name, age, gender, location, static_cast<Status>(statusChoice)
                );
                dbManager->addCivilian(civilian);
                std::cout << "Civilian registered successfully!\n";
                break;
            }
            
            case 2: { // View All Civilians
                dbManager->displayAll();
                break;
            }
            
            case 3: { // Add to Triage
                int id, priority;
                std::cout << "Enter Civilian ID: ";
                std::cin >> id;
                
                auto civilian = dbManager->getCivilian(id);
                if (civilian) {
                    std::cout << "Medical Priority (0=Critical, 1=Moderate, 2=Minor): ";
                    std::cin >> priority;
                    civilian->setMedicalPriority(static_cast<Priority>(priority));
                    triageSystem.addToTriage(civilian);
                } else {
                    std::cout << "Civilian not found.\n";
                }
                break;
            }
            
            case 4: { // Process Next Patient
                auto patient = triageSystem.getNextPatient();
                if (patient) {
                    std::cout << "\nProcessing next patient:\n";
                    patient->display();
                } else {
                    std::cout << "No patients in triage queue.\n";
                }
                break;
            }
            
            case 5: { // Assign Shelter
                int id;
                std::cout << "Enter Civilian ID: ";
                std::cin >> id;
                
                auto civilian = dbManager->getCivilian(id);
                if (civilian) {
                    shelterManager.assignShelter(civilian);
                } else {
                    std::cout << "Civilian not found.\n";
                }
                break;
            }
            
            case 6: { // View Shelters
                shelterManager.displayAllShelters();
                break;
            }
            
            case 7: { // Allocate Resources
                std::string resourceName;
                int quantity;
                
                std::cout << "Resource Name: ";
                clearInput();
                std::getline(std::cin, resourceName);
                
                std::cout << "Quantity: ";
                std::cin >> quantity;
                
                resourceManager.allocateResource(resourceName, quantity);
                break;
            }
            
            case 8: { // View Resources
                resourceManager.displayAllResources();
                break;
            }
            
            case 9: { // Generate Report
                reportGen.generateFullReport();
                break;
            }
            
            case 10: { // Export Report
                std::string filename;
                std::cout << "Enter filename: ";
                std::getline(std::cin, filename);
                reportGen.exportReportToFile(filename);
                break;
            }
            
            case 11: { // Save & Exit
                dbManager->saveToFile();
                std::cout << "Data saved. Exiting...\n";
                running = false;
                break;
            }
            
            default:
                std::cout << "Invalid choice. Try again.\n";
        }
    }
    
    return 0;
}

