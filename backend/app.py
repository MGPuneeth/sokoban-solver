from flask import Flask, request, jsonify
from flask_cors import CORS

from solver.astar import astar_solver
from solver.utils import parse_level

app = Flask(__name__)
CORS(app)


@app.route('/solve', methods=['POST'])
def solve():
    """
    Solve a Sokoban puzzle with comprehensive error handling
    """
    try:
        # ✅ Validate request has JSON
        if not request.json:
            return jsonify({"error": "⚠️ No JSON data provided"}), 400
        
        data = request.json
        
        # ✅ Validate 'level' field exists
        if "level" not in data:
            return jsonify({"error": "⚠️ Missing 'level' field in request"}), 400
        
        level = data["level"]
        
        # ✅ Validate level is not empty
        if not level or len(level) == 0:
            return jsonify({"error": "⚠️ Level cannot be empty"}), 400
        
        # ✅ Validate level format (should be list of strings)
        if not isinstance(level, list) or not all(isinstance(row, str) for row in level):
            return jsonify({"error": "⚠️ Level must be an array of strings"}), 400
        
        # ✅ Validate level isn't too large (prevent DOS)
        max_size = 100
        if any(len(row) > max_size or len(row) == 0 for row in level) or len(level) > max_size:
            return jsonify({"error": f"⚠️ Level too large (max {max_size}x{max_size})"}), 400
        
        # ✅ Parse the level
        try:
            player, boxes, goals, walls = parse_level(level)
        except Exception as parse_err:
            return jsonify({"error": f"⚠️ Invalid level format: {str(parse_err)}"}), 400
        
        # ✅ Validate that player exists
        if player is None:
            return jsonify({"error": "⚠️ Level must have a player (P)"}), 400
        
        # ✅ Validate that goals exist
        if not goals or len(goals) == 0:
            return jsonify({"error": "⚠️ Level must have at least one goal (.)"}), 400
        
        # ✅ Validate that boxes exist
        if not boxes or len(boxes) == 0:
            return jsonify({"error": "⚠️ Level must have at least one box (B)"}), 400
        
        # ✅ Validate number of boxes matches goals
        if len(boxes) != len(goals):
            return jsonify({"error": f"⚠️ Number of boxes ({len(boxes)}) must match goals ({len(goals)})"}), 400
        
        # ✅ Validate coordinates are valid
        all_coords = set(walls) | set(boxes) | {player} | set(goals)
        if any(x < 0 or y < 0 for x, y in all_coords):
            return jsonify({"error": "⚠️ Invalid coordinates (negative values)"}), 400
        
        print("START SOLVER")
        result = astar_solver(player, boxes, goals, walls)
        print("END SOLVER")
        
        # ✅ Validate result
        if not result:
            return jsonify({"error": "⚠️ Solver returned empty result"}), 500
        
        return jsonify(result)

    except KeyError as e:
        return jsonify({"error": f"⚠️ Missing required field: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({"error": f"⚠️ Invalid value: {str(e)}"}), 400
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"error": f"⚠️ Unexpected error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)