import React from "react";
import { safeAlert } from "../utils/safeAlert";

const Controls = ({ onSolve, onReset, onUndo, onReplay }) => {
  // ✅ Wrap handlers with error boundaries
  const handleWithError = (handler, handlerName) => {
    return () => {
      try {
        if (typeof handler !== "function") {
          throw new Error(`⚠️ ${handlerName} is not a function`);
        }
        handler();
      } catch (error) {
        console.error(`⚠️ Error in ${handlerName}:`, error);
        safeAlert(`⚠️ Error: ${error.message}`);
      }
    };
  };

  return (
    <div
      style={{
        marginTop: "20px",
        gap: "10px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <button
        onClick={handleWithError(onSolve, "Solve")}
        style={{ padding: "8px 16px" }}
      >
        🔍 Solve
      </button>
      <button
        onClick={handleWithError(onReset, "Reset")}
        style={{ padding: "8px 16px" }}
      >
        🔄 Reset
      </button>
      <button
        onClick={handleWithError(onUndo, "Undo")}
        style={{ padding: "8px 16px" }}
      >
        ⏪ Undo
      </button>
      <button
        onClick={handleWithError(onReplay, "Replay")}
        style={{ padding: "8px 16px" }}
      >
        ▶ Replay
      </button>
    </div>
  );
};

export default Controls;
