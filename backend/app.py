from flask import Flask, request, jsonify
from flask_cors import CORS   # ✅ ADD THIS

from solver.astar import astar_solver
from solver.utils import parse_level   # ✅ THIS LINE
app = Flask(__name__)
CORS(app)   # ✅ ADD THIS


@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.json
        level = data["level"]

        player, boxes, goals, walls = parse_level(level)

        print("START SOLVER")   # 👈 debug

        result = astar_solver(player, boxes, goals, walls)

        print("END SOLVER")     # 👈 debug

        return jsonify(result)

    except Exception as e:
        print("ERROR:", str(e))   # 👈 CRITICAL
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)