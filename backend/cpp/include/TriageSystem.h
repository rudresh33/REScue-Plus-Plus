#ifndef TRIAGESYSTEM_H
#define TRIAGESYSTEM_H

#include <queue>
#include <vector>
#include <string>
#include "Civilian.h"

class TriageSystem {
public:
    struct ComparePriority {
        int getScore(const std::string& injury) const {
            if (injury == "Critical") return 3;
            if (injury == "Moderate") return 2;
            if (injury == "Minor") return 1;
            return 0;
        }
        bool operator()(const Civilian& a, const Civilian& b) const {
            return getScore(a.getInjurySeverity()) < getScore(b.getInjurySeverity());
        }
    };

    void addCivilian(const Civilian& civilian);
    Civilian getNextPatient();
    bool isEmpty() const;

private:
    std::priority_queue<Civilian, std::vector<Civilian>, ComparePriority> triageQueue;
};

#endif
