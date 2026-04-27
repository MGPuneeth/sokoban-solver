def is_deadlock(boxes, walls, goals):

    for (x, y) in boxes:

        if (x, y) in goals:
            continue

        # Corner deadlock
        if ((x+1,y) in walls and (x,y+1) in walls) or \
           ((x-1,y) in walls and (x,y+1) in walls) or \
           ((x+1,y) in walls and (x,y-1) in walls) or \
           ((x-1,y) in walls and (x,y-1) in walls):
            return True

        # Wall-line deadlock (simple)
        if (x-1,y) in walls and (x+1,y) in walls:
            if all((gx != x for gx, _ in goals)):
                return True

        if (x,y-1) in walls and (x,y+1) in walls:
            if all((gy != y for _, gy in goals)):
                return True

    return False