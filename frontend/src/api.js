import axios from "axios";

export const solveLevel = async (level) => {
  try {
    // ✅ Validate level before sending
    if (!level || !Array.isArray(level) || level.length === 0) {
      throw new Error("⚠️ Level must be a non-empty array");
    }

    if (!level.every((row) => typeof row === "string" && row.length > 0)) {
      throw new Error("⚠️ Each level row must be a non-empty string");
    }

    // ✅ Set timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const res = await axios.post(
      "http://127.0.0.1:5000/solve",
      { level },
      {
        timeout: 30000,
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    // ✅ Validate response format
    if (!res.data) {
      throw new Error("⚠️ Empty response from server");
    }

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (error) {
    // ✅ Handle different error types
    if (error.code === "ECONNABORTED") {
      throw new Error(
        "⚠️ Request timeout - solver took too long (>30 seconds)",
      );
    }

    if (error.message === "Network Error") {
      throw new Error(
        "⚠️ Cannot connect to server. Make sure backend is running on http://127.0.0.1:5000",
      );
    }

    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data.error || "⚠️ Invalid level format");
    }

    if (error.response && error.response.status === 500) {
      throw new Error(
        error.response.data.error ||
          "⚠️ Server error - puzzle might be unsolvable or invalid",
      );
    }

    if (error.message.includes("⚠️")) {
      throw error; // Re-throw validation errors
    }

    throw new Error(`⚠️ Unexpected error: ${error.message}`);
  }
};
