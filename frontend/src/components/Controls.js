import React from "react";

const Controls = ({ onSolve, onReset, onUndo, onReplay }) => {
  return (
    <div>
      <button onClick={onSolve}>Solve</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onUndo}>Undo</button>
      <button onClick={onReplay}>Replay</button>
    </div>
  );
};

export default Controls;
