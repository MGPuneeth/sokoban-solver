import React, { useState, useEffect } from "react";
import Grid from "./components/Grid";
import Controls from "./components/Controls";
import { levels } from "./levels";
import { solveLevel } from "./api";
import { safeAlert } from "./utils/safeAlert";

// 🔹 Parse level into grid, player, boxes, goals with error handling
const parseLevel = (level) => {
  try {
    // ✅ Validate level exists
    if (!level || !Array.isArray(level) || level.length === 0) {
      throw new Error("⚠️ Level is empty or invalid");
    }

    let grid = [];
    let player = null;
    let boxes = [];
    let goals = [];

    level.forEach((row, i) => {
      // ✅ Validate each row is a string
      if (typeof row !== "string") {
        throw new Error(`⚠️ Row ${i} is not a string`);
      }

      if (row.length === 0) {
        throw new Error(`⚠️ Row ${i} is empty`);
      }

      let gridRow = [];
      row.split("").forEach((cell, j) => {
        // ✅ Validate characters
        const validChars = ["#", "P", "B", ".", "*", "+", " "];
        if (!validChars.includes(cell)) {
          throw new Error(
            `⚠️ Invalid character '${cell}' at row ${i}, col ${j}`,
          );
        }

        if (cell === "#") gridRow.push("#");
        else gridRow.push(" ");

        if (cell === "P") {
          if (player !== null) {
            throw new Error("⚠️ Multiple players found (only one P allowed)");
          }
          player = [i, j];
        }
        if (cell === "B") boxes.push([i, j]);
        if (cell === ".") goals.push([i, j]);
        if (cell === "*") {
          boxes.push([i, j]);
          goals.push([i, j]);
        }
        if (cell === "+") {
          if (player !== null) {
            throw new Error("⚠️ Multiple players found");
          }
          player = [i, j];
          goals.push([i, j]);
        }
      });
      grid.push(gridRow);
    });

    // ✅ Validate parsed data
    if (player === null) {
      throw new Error("⚠️ No player found in level (needs P or +)");
    }
    if (goals.length === 0) {
      throw new Error("⚠️ No goals found in level (needs . or *)");
    }
    if (boxes.length === 0) {
      throw new Error("⚠️ No boxes found in level (needs B or *)");
    }
    if (boxes.length !== goals.length) {
      throw new Error(
        `⚠️ Box count (${boxes.length}) doesn't match goal count (${goals.length})`,
      );
    }

    return { grid, player, boxes, goals };
  } catch (error) {
    throw error;
  }
};

function App() {
  const levelIndex = 0; // 🔹 You can later make this dynamic

  // ✅ Initialize with error handling
  let initial = { grid: null, player: null, boxes: [], goals: [] };

  try {
    if (levels[levelIndex]) {
      initial = parseLevel(levels[levelIndex]);
    } else {
      console.error("⚠️ No levels available");
    }
  } catch (error) {
    console.error("⚠️ Error parsing initial level:", error);
    safeAlert("⚠️ Error loading level: " + error.message);
  }

  // 🔹 Game state
  const [player, setPlayer] = useState(initial.player);
  const [boxes, setBoxes] = useState(initial.boxes);

  // 🔹 Animation state
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSolving, setIsSolving] = useState(false);

  // 🔹 Stats (for UI)
  const [stats, setStats] = useState({ nodes: 0, time: 0 });

  // 🎬 Animation loop (ONLY animation system)
  useEffect(() => {
    if (steps.length === 0 || stepIndex >= steps.length) return;

    const timer = setTimeout(() => {
      try {
        const step = steps[stepIndex];
        if (
          !step ||
          !Array.isArray(step.player) ||
          step.player.length !== 2 ||
          !Array.isArray(step.boxes)
        ) {
          throw new Error(`⚠️ Invalid animation step at index ${stepIndex}`);
        }

        setPlayer(step.player);
        setBoxes(step.boxes);
        setStepIndex(stepIndex + 1);
      } catch (error) {
        console.error("Animation error:", error);
        safeAlert(error.message || "⚠️ Animation data is invalid");
        setSteps([]);
        setStepIndex(0);
      }
    }, 200); // 🔥 speed control

    return () => clearTimeout(timer);
  }, [stepIndex, steps]);

  useEffect(() => {
    const onUnhandledError = (event) => {
      console.error("Unhandled runtime error:", event.error || event.message);
      safeAlert("⚠️ Unexpected app error occurred. Please try again.");
    };

    const onUnhandledRejection = (event) => {
      const reason = event.reason?.message || event.reason || "Unknown error";
      console.error("Unhandled promise rejection:", event.reason);
      safeAlert(`⚠️ Operation failed: ${reason}`);
    };

    window.addEventListener("error", onUnhandledError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onUnhandledError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  // ▶ Solve with comprehensive error handling
  const handleSolve = async () => {
    try {
      if (isSolving) {
        safeAlert("⚠️ Solver is already running. Please wait.");
        return;
      }

      // ✅ Validate level exists
      if (!levels[levelIndex]) {
        safeAlert("⚠️ Level does not exist at index " + levelIndex);
        return;
      }

      setIsSolving(true);

      console.log("Solving level:", levels[levelIndex]);

      let res;
      try {
        res = await solveLevel(levels[levelIndex]);
      } catch (apiError) {
        // ✅ Catch API and validation errors
        throw apiError;
      }

      // ✅ Validate response
      if (!res) {
        throw new Error("⚠️ Server returned empty response");
      }

      if (res.error) {
        throw new Error(res.error);
      }

      // ✅ Validate solution data
      if (!res.steps) {
        throw new Error("⚠️ No solution steps in response");
      }

      if (!Array.isArray(res.steps)) {
        throw new Error("⚠️ Invalid solution format (steps not an array)");
      }

      if (res.steps.length === 0) {
        safeAlert(
          "✓ Puzzle is already solved! All boxes are on goals.\n\nNodes explored: " +
            (res.nodes_explored || 0) +
            "\nTime: " +
            (res.time_ms || 0) +
            "ms",
        );
        return;
      }

      // ✅ Validate each step
      for (let i = 0; i < res.steps.length; i++) {
        const step = res.steps[i];
        if (!step.player || !Array.isArray(step.player)) {
          throw new Error(`⚠️ Step ${i}: Invalid player position`);
        }
        if (!step.boxes || !Array.isArray(step.boxes)) {
          throw new Error(`⚠️ Step ${i}: Invalid boxes data`);
        }
      }

      // ✅ Set the solution
      setSteps(res.steps);
      setStepIndex(0);

      setStats({
        nodes: res.nodes_explored || 0,
        time: res.time_ms || 0,
      });

      // ✅ Show success feedback
      safeAlert(
        "✓ Solution found!\n\n" +
          res.steps.length +
          " steps\n" +
          "Nodes explored: " +
          (res.nodes_explored || 0) +
          "\n" +
          "Time: " +
          (res.time_ms || 0) +
          "ms",
      );
    } catch (error) {
      // ✅ Show error alert to user
      console.error("Solve error:", error);
      safeAlert(error.message || "⚠️ Error solving puzzle");
    } finally {
      setIsSolving(false);
    }
  };

  // 🔄 Reset
  const handleReset = () => {
    if (!initial.player || !initial.grid) {
      safeAlert("⚠️ Cannot reset: initial level state is invalid");
      return;
    }
    setPlayer(initial.player);
    setBoxes(initial.boxes);
    setSteps([]);
    setStepIndex(0);
  };

  // ⏪ Undo
  const handleUndo = () => {
    if (stepIndex <= 1) {
      safeAlert("⚠️ No previous move available to undo");
      return;
    }

    const prev = steps[stepIndex - 2];
    if (!prev || !Array.isArray(prev.player) || !Array.isArray(prev.boxes)) {
      safeAlert("⚠️ Cannot undo due to invalid previous step data");
      return;
    }
    setPlayer(prev.player);
    setBoxes(prev.boxes);
    setStepIndex(stepIndex - 1);
  };

  // 🔁 Replay
  const handleReplay = () => {
    if (steps.length === 0) {
      safeAlert("⚠️ No solution steps available to replay");
      return;
    }

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
