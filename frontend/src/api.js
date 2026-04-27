import axios from "axios";

export const solveLevel = async (level) => {
  const res = await axios.post("http://127.0.0.1:5000/solve", {
    level,
  });
  return res.data;
};
