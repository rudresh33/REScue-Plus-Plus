#include "../include/TriageSystem.h"

void TriageSystem::addCivilian(const Civilian& civilian) {
    triageQueue.push(civilian);
}

Civilian TriageSystem::getNextPatient() {
    if (triageQueue.empty()) {
        // Return a placeholder if empty
        return Civilian(-1, "None", 0, "None", "None", "None");
    }
    Civilian next = triageQueue.top();
    triageQueue.pop();
    return next;
}

bool TriageSystem::isEmpty() const {
    return triageQueue.empty();
}
