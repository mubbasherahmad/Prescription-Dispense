// Strategy Pattern: Base Strategy Interface
class SortStrategy {
  sort(prescriptions) {
    throw new Error('sort() must be implemented by subclass');
  }

  getName() {
    throw new Error('getName() must be implemented by subclass');
  }
}

// Concrete Strategy: Sort by Date (newest first)
class SortByDateStrategy extends SortStrategy {
  sort(prescriptions) {
    return [...prescriptions].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getName() {
    return 'Date (Newest First)';
  }
}

// Concrete Strategy: Sort by Date (oldest first)
class SortByDateOldestStrategy extends SortStrategy {
  sort(prescriptions) {
    return [...prescriptions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  getName() {
    return 'Date (Oldest First)';
  }
}

// Context: Manages the current sorting strategy
class PrescriptionSorter {
  constructor(strategy) {
    this.strategy = strategy || new SortByDateStrategy();
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(prescriptions) {
    return this.strategy.sort(prescriptions);
  }

  getStrategyName() {
    return this.strategy.getName();
  }
}

// Export only the used strategies and the context
export {
  SortStrategy,
  SortByDateStrategy,
  SortByDateOldestStrategy,
  PrescriptionSorter
};
