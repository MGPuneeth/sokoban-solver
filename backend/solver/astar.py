import heapq
import time
from collections import deque

from solver.heuristics import assignment_heuristic
from solver.deadlock import is_deadlock


# ----------------------------
# 🔹 GLOBAL CACHE (BIG SPEED BOOST)
# ----------------------------
path_cache = {}


# ----------------------------
# 🔹 PATHFINDING (BFS + CACHE)
# ----------------------------
def find_path(start, target, walls, boxes):
    key = (start, target, tuple(sorted(boxes)))

    if key in path_cache:
        return path_cache[key]

    queue = deque([start])
    visited = {start: None}
    blocked = set(walls) | set(boxes)

    while queue:
        pos = queue.popleft()

        if pos == target:
            path = []
            while pos is not None:
                path.append(pos)
                pos = visited[pos]
            result = path[::-1]
            path_cache[key] = result
            return result

        x, y = pos

        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            nxt = (x+dx, y+dy)

            if nxt not in blocked and nxt not in visited:
                visited[nxt] = pos
                queue.append(nxt)

    path_cache[key] = []
    return []


# ----------------------------
# 🔹 REACHABLE AREA
# ----------------------------
def get_reachable(player, walls, boxes):
    queue = deque([player])
    visited = set([player])

    blocked = set(walls) | set(boxes)

    while queue:
        x, y = queue.popleft()

        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            nxt = (x+dx, y+dy)

            if nxt not in blocked and nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

    return visited


# ----------------------------
# 🔹 HEURISTIC (IMPROVED)
# ----------------------------
def player_to_box_cost(player, boxes):
    return min(abs(player[0]-b[0]) + abs(player[1]-b[1]) for b in boxes)


def heuristic(player, boxes, goals):
    return assignment_heuristic(boxes, goals) + player_to_box_cost(player, boxes)


# ----------------------------
# 🔹 GENERATE PUSHES (SMART ORDER)
# ----------------------------
def get_pushes(player, boxes, walls, goals):
    reachable = get_reachable(player, walls, boxes)
    pushes = []

    box_set = set(boxes)

    # 🔥 Better ordering (goal + player distance)
    sorted_boxes = sorted(
        box_set,
        key=lambda b: (
            min(abs(b[0]-g[0]) + abs(b[1]-g[1]) for g in goals),
            abs(player[0]-b[0]) + abs(player[1]-b[1])
        )
    )

    for (bx, by) in sorted_boxes:
        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:

            player_pos = (bx - dx, by - dy)
            new_box_pos = (bx + dx, by + dy)

            if player_pos in reachable:
                if new_box_pos not in walls and new_box_pos not in box_set:

                    new_boxes = set(box_set)
                    new_boxes.remove((bx, by))
                    new_boxes.add(new_box_pos)

                    pushes.append((
                        player_pos,
                        tuple(sorted(boxes)),
                        tuple(sorted(new_boxes)),
                        (bx, by)
                    ))

    return pushes


# ----------------------------
# 🔹 EXPAND FULL MOVEMENT
# ----------------------------
def expand_full_path(push_path, start_player, walls):

    full_steps = []
    current_player = start_player

    for player_pos, old_boxes, new_boxes, new_player in push_path:

        path = find_path(current_player, player_pos, walls, old_boxes)

        for pos in path:
            full_steps.append({
                "player": list(pos),
                "boxes": [list(b) for b in old_boxes]
            })

        full_steps.append({
            "player": list(new_player),
            "boxes": [list(b) for b in new_boxes]
        })

        current_player = new_player

    return full_steps


# ----------------------------
# 🔹 MAIN A* SOLVER (WEIGHTED)
# ----------------------------
def astar_solver(player, boxes, goals, walls):

    start_time = time.time()

    boxes = tuple(sorted(boxes))
    goals = tuple(goals)

    visited = set()
    pq = []
    counter = 0

    WEIGHT = 1.5  # 🔥 speed vs optimality balance

    h = heuristic(player, boxes, goals)
    heapq.heappush(pq, (h, 0, counter, player, boxes, []))

    nodes_explored = 0

    while pq:
        f, g, _, player, boxes, path = heapq.heappop(pq)

        state_key = (player, boxes)

        if state_key in visited:
            continue
        visited.add(state_key)

        nodes_explored += 1

        if set(boxes) == set(goals):
            full_steps = expand_full_path(path, player, walls)

            return {
                "steps": full_steps,
                "nodes_explored": nodes_explored,
                "time_ms": int((time.time() - start_time) * 1000)
            }

        for player_pos, old_boxes, new_boxes, new_player in get_pushes(player, boxes, walls, goals):

            if (new_player, new_boxes) in visited:
                continue

            if is_deadlock(new_boxes, walls, goals):
                continue

            new_g = g + 1
            new_h = heuristic(new_player, new_boxes, goals)

            counter += 1

            f = new_g + WEIGHT * new_h

            heapq.heappush(
                pq,
                (
                    f,
                    new_g,
                    counter,
                    new_player,
                    new_boxes,
                    path + [(player_pos, old_boxes, new_boxes, new_player)]
                )
            )

    return {"steps": [], "nodes_explored": nodes_explored, "time_ms": 0}