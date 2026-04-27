import React, { useEffect, useRef } from "react";
import "./Grid.css";
import playerImg from "../assets/player.png";
import boxImg from "../assets/box.png";
import wallImg from "../assets/wall.png";
import { safeAlert } from "../utils/safeAlert";

const Grid = ({ grid, player, boxes, goals }) => {
  const alertedErrorsRef = useRef(new Set());
  const notifyErrorOnce = (message) => {
    if (alertedErrorsRef.current.has(message)) {
      return;
    }
    alertedErrorsRef.current.add(message);
    safeAlert(message);
  };

  let validationError = null;

  // ✅ Validate inputs
  if (!grid) validationError = "⚠️ Grid not loaded";
  else if (!Array.isArray(grid) || grid.length === 0)
    validationError = "⚠️ Invalid grid format";
  else if (!Array.isArray(grid[0]) || grid[0].length === 0)
    validationError = "⚠️ Grid first row is invalid";

  // ✅ Validate all rows have same length
  const rowLength = !validationError ? grid[0].length : 0;
  if (
    !validationError &&
    !grid.every((row) => Array.isArray(row) && row.length === rowLength)
  ) {
    validationError = "⚠️ Grid rows have inconsistent lengths";
  }

  // ✅ Validate player and boxes arrays
  if (!validationError && player && !Array.isArray(player)) {
    validationError = "⚠️ Invalid player data";
  }

  if (!validationError && boxes && !Array.isArray(boxes)) {
    validationError = "⚠️ Invalid boxes data";
  }

  if (!validationError && goals && !Array.isArray(goals)) {
    validationError = "⚠️ Invalid goals data";
  }

  useEffect(() => {
    if (validationError) {
      notifyErrorOnce(validationError);
    }
  }, [validationError]);

  if (validationError) {
    return null;
  }

  try {
    return (
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 50px)`,
        }}
      >
        {grid.map((row, i) =>
          row.map((cell, j) => {
            try {
              const isPlayer = player?.[0] === i && player?.[1] === j;
              const isBox = boxes?.some((b) => b[0] === i && b[1] === j);
              const isGoal = goals?.some((g) => g[0] === i && g[1] === j);

              return (
                <div key={`${i}-${j}`} className="cell" title={`(${i},${j})`}>
                  {/* Floor (default background) */}

                  {/* Goal (circle) */}
                  {isGoal && <div className="goal"></div>}

                  {/* Wall */}
                  {cell === "#" && <img src={wallImg} alt="wall" />}

                  {/* Box */}
                  {isBox && <img src={boxImg} alt="box" />}

                  {/* Player */}
                  {isPlayer && <img src={playerImg} alt="player" />}
                </div>
              );
            } catch (cellError) {
              console.error(`⚠️ Error rendering cell (${i},${j}):`, cellError);
              notifyErrorOnce(
                `⚠️ Rendering issue at cell (${i},${j}). Displaying safe fallback.`,
              );
              return <div key={`${i}-${j}`} className="cell" />;
            }
          }),
        )}
      </div>
    );
  } catch (error) {
    console.error("⚠️ Error rendering grid:", error);
    notifyErrorOnce(`⚠️ Error rendering grid: ${error.message}`);
    return null;
  }
};

export default Grid;
