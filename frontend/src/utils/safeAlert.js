export const safeAlert = (message) => {
  if (typeof window !== "undefined" && typeof window.alert === "function") {
    window.alert(message);
    return;
  }

  // Fallback for non-browser/test environments
  console.error(message);
};
