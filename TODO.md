# Optimizing AI Engine for RAM Usage

This is for AI Engine V8.

To enhance the performance of the AI engine in Mega Tic Tac Toe, we plan to optimize RAM usage. This will improve efficiency by reducing memory consumption and allow the AI to handle larger simulations.

## Detailed Plan

### Simplify and Optimize Game State Data Structure
- **Objective**: Reduce the memory footprint of the game state representation.
- **Actions**:
    - Review the current game state to identify unnecessary data.
    - Remove redundant or duplicate information.
    - Use more memory-efficient data structures where appropriate.
- **Notes**:
    - Simplifying the game state will decrease the amount of memory each simulation requires.
    - Ensure that the simplification doesn't affect the functionality or accuracy of the game logic.

### Optimize Tree Data Structure for Garbage Collection
- **Objective**: Improve memory management by allowing efficient garbage collection.
- **Actions**:
    - Refactor the tree structure to eliminate circular references.
    - Remove all "to" and "from" pointers that create loops.
    - Ensure that once a node is no longer needed, it can be garbage collected.
- **Notes**:
    - Circular references can prevent the JavaScript garbage collector from freeing memory.
    - Optimizing the tree structure will help prevent memory leaks.

### Optimize Monte Carlo Tree Search (MCTS) for RAM
- **Objective**: Reduce memory usage during the MCTS process.
- **Actions**:
    - Implement an expansion method that limits tree branching.
        - Expand only the most promising nodes based on certain criteria.
    - Use live computation to calculate values on-the-fly instead of storing them.
- **Notes**:
    - Reducing tree branching will lower the number of nodes in memory.
    - Live computation can save memory but may increase CPU usage, so balance is necessary.

## Conclusion

By implementing these optimizations, we aim to improve the efficiency and scalability of the AI engine, enabling it to perform better with limited RAM resources.
