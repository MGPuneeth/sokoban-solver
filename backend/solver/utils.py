from collections import deque

from collections import deque

def find_path(start, target, walls, boxes):
    queue = deque([start])
    visited = {start: None}

    blocked = set(walls) | set(boxes)

    while queue:
        pos = queue.popleft()

        if pos == target:
            # reconstruct path
            path = []
            while pos is not None:
                path.append(pos)
                pos = visited[pos]
            return path[::-1]  # reverse

        x, y = pos

        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            nxt = (x+dx, y+dy)

            if nxt not in blocked and nxt not in visited:
                visited[nxt] = pos
                queue.append(nxt)

    return []


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

def get_pushes(player, boxes, walls):
    reachable = get_reachable(player, walls, boxes)
    pushes = []

    box_set = set(boxes)

    for (bx, by) in box_set:
        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:

            player_pos = (bx - dx, by - dy)
            new_box_pos = (bx + dx, by + dy)

            if player_pos in reachable:
                if new_box_pos not in walls and new_box_pos not in box_set:

                    new_boxes = set(box_set)
                    new_boxes.remove((bx, by))
                    new_boxes.add(new_box_pos)

                    pushes.append((
                        player_pos,                    # move target
                        tuple(sorted(new_boxes)),      # updated boxes
                        (bx, by)                       # player after push
                    ))

    return pushes

def parse_level(level):

    walls = set()
    boxes = []
    goals = []
    player = None

    for i, row in enumerate(level):
        for j, ch in enumerate(row):

            if ch == '#':
                walls.add((i, j))
            elif ch == 'P':
                player = (i, j)
            elif ch == 'B':
                boxes.append((i, j))
            elif ch == '.':
                goals.append((i, j))
            elif ch == '*':  # box on goal
                boxes.append((i, j))
                goals.append((i, j))
            elif ch == '+':  # player on goal
                player = (i, j)
                goals.append((i, j))

    return player, tuple(boxes), tuple(goals), walls