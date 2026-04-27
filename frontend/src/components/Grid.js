import React from "react";
import "./Grid.css";
import playerImg from "../assets/player.png";
import boxImg from "../assets/box.png";
import wallImg from "../assets/wall.png";

const Grid = ({ grid, player, boxes, goals }) => {
  if (!grid) return <div>Loading...</div>;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, 50px)`,
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const isPlayer = player?.[0] === i && player?.[1] === j;
          const isBox = boxes?.some((b) => b[0] === i && b[1] === j);
          const isGoal = goals?.some((g) => g[0] === i && g[1] === j);

          return (
            <div key={`${i}-${j}`} className="cell">
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
        }),
      )}
    </div>
  );
};

export default Grid;
