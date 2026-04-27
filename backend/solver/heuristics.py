def manhattan(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def assignment_heuristic(boxes, goals):
    boxes = list(boxes)
    goals = list(goals)

    total_cost = 0

    while boxes:
        min_dist = float('inf')
        best_pair = None

        for b in boxes:
            for g in goals:
                d = manhattan(b, g)
                if d < min_dist:
                    min_dist = d
                    best_pair = (b, g)

        b, g = best_pair
        total_cost += min_dist

        boxes.remove(b)
        goals.remove(g)

    return total_cost