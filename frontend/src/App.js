import React, { useState, useEffect } from "react";
import Grid from "./components/Grid";
import Controls from "./components/Controls";
import { levels } from "./levels";
import { solveLevel } from "./api";

// 🔹 Parse level into grid, player, boxes, goals
const parseLevel = (level) => {
  let grid = [];
  let player = null;
  let boxes = [];
  let goals = [];

  level.forEach((row, i) => {
    let gridRow = [];
    row.split("").forEach((cell, j) => {
      if (cell === "#") gridRow.push("#");
      else gridRow.push(" ");

      if (cell === "P") player = [i, j];
      if (cell === "B") boxes.push([i, j]);
      if (cell === ".") goals.push([i, j]);
      if (cell === "*") {
        boxes.push([i, j]);
        goals.push([i, j]);
      }
      if (cell === "+") {
        player = [i, j];
        goals.push([i, j]);
      }
    });
    grid.push(gridRow);
  });

  return { grid, player, boxes, goals };
};

function App() {
  const levelIndex = 0; // 🔹 You can later make this dynamic

  const initial = levels[levelIndex]
    ? parseLevel(levels[levelIndex])
    : { grid: null, player: null, boxes: [], goals: [] };

  // 🔹 Game state
  const [player, setPlayer] = useState(initial.player);
  const [boxes, setBoxes] = useState(initial.boxes);

  // 🔹 Animation state
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  // 🔹 Stats (for UI)
  const [stats, setStats] = useState({ nodes: 0, time: 0 });

  // 🎬 Animation loop (ONLY animation system)
  useEffect(() => {
    if (steps.length === 0 || stepIndex >= steps.length) return;

    const timer = setTimeout(() => {
      const step = steps[stepIndex];
      setPlayer(step.player);
      setBoxes(step.boxes);
      setStepIndex(stepIndex + 1);
    }, 200); // 🔥 speed control

    return () => clearTimeout(timer);
  }, [stepIndex, steps]);

  // ▶ Solve
  const handleSolve = async () => {
    const res = await solveLevel(levels[levelIndex]);

    console.log("Solver result:", res);

    if (!res || !res.steps || res.steps.length === 0) {
      alert("No solution found!");
      return;
    }

    setSteps(res.steps);
    setStepIndex(0);

    setStats({
      nodes: res.nodes_explored,
      time: res.time_ms,
    });
  };

  // 🔄 Reset
  const handleReset = () => {
    setPlayer(initial.player);
    setBoxes(initial.boxes);
    setSteps([]);
    setStepIndex(0);
  };

  // ⏪ Undo
  const handleUndo = () => {
    if (stepIndex <= 1) return;

    const prev = steps[stepIndex - 2];
    setPlayer(prev.player);
    setBoxes(prev.boxes);
    setStepIndex(stepIndex - 1);
  };

  // 🔁 Replay
  const handleReplay = () => {
    if (steps.length === 0) return;

    setStepIndex(0);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Sokoban AI Solver</h1>

      {/* 📊 Stats (optional but impressive) */}
      <div style={{ marginBottom: "10px" }}>
        Nodes: {stats.nodes} | Time: {stats.time} ms
      </div>

      {/* 🧩 Grid */}
      {initial.grid && (
        <Grid
          grid={initial.grid}
          player={player}
          boxes={boxes}
          goals={initial.goals}
        />
      )}

      {/* 🎮 Controls */}
      <Controls
        onSolve={handleSolve}
        onReset={handleReset}
        onUndo={handleUndo}
        onReplay={handleReplay}
      />
    </div>
  );
}

export default App;
