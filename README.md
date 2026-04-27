# 📦 Sokoban Solver

A smart and efficient **Sokoban puzzle solver** that uses classic **AI search algorithms** to find optimal solutions. This project models Sokoban as a **state-space search problem** and applies algorithmic techniques to automatically solve puzzles.

---

## 🧠 About the Project

Sokoban is a classic puzzle game where a player pushes boxes onto target locations in a grid. The challenge lies in planning moves carefully since boxes **cannot be pulled** and incorrect moves can make the puzzle unsolvable.

This project treats Sokoban as a **graph/state-space problem**, where:
- Each configuration of the board is a **state**
- Moves generate **new states**
- The goal is to reach a state where all boxes are on target positions

---

## ✨ Features

- 🔍 Multiple search algorithms:
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - A* Search (heuristic-based)
- 📊 Efficient state-space exploration
- 🎯 Finds optimal or near-optimal solutions
- 🧩 Handles different puzzle configurations
- 🧱 Grid-based board representation
- 🔁 Avoids repeated states (optimization)

---

## ⚙️ Algorithms Used

### 1. Breadth-First Search (BFS)
- Guarantees shortest path
- Explores all states level by level

### 2. Depth-First Search (DFS)
- Uses less memory
- May not guarantee optimal solution

### 3. A* Search
- Uses heuristics (e.g., Manhattan distance)
- Faster and more efficient for complex puzzles  
- Prioritizes promising states



