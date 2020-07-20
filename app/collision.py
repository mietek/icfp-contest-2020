import math

def line_segment(start, end):
    length = distance(start, end)
    if length == 0:
        raise Exception('Invalid length %s %s' % (start, end))
    # if (this.length === 0 || isNaN(this.length) || !isFinite(this.length)) {
    #     throw new Error('Invalid length');
    # }
    direction = (end[0] - start[0], end[1] - start[1])
    return {'start': start, 'end': end, 'length': length, 'direction': direction}

def distance(a, b):
    return math.sqrt(math.pow(b[1] - a[1], 2) + math.pow(b[0] - a[0], 2))

def subtract_points(a, b):
    x = a[0] - b[0]
    y = a[1] - b[1]
    return (x, y)

def add_points(a, b):
    x = a[0] + b[0]
    y = a[1] + b[1]
    return (x, y)

def dot(u, v):
    return u[0] * v[0] + u[1] * v[1]

# 2-dimensional vector cross product v × w = vx wy − vy wx
def cross(v, w):
    return v[0] * w[1] - v[1] * w[0]

epsilon = 1 / 1000000
def equals0(x):
    return math.fabs(x) < epsilon

def intersection(line_segment0, line_segment1):
    p = line_segment0['start']
    r = line_segment0['direction']
    q = line_segment1['start']
    s = line_segment1['direction']
    # // r × s
    r_s = cross(r, s)
    # // (q − p) × r
    q_p_r = cross(subtract_points(q, p), r)
    if equals0(r_s) and equals0(q_p_r):
        # // t0 = (q − p) · r / (r · r)
        # // const t0 = dot(subtractPoints(q, p), r) / dot(r, r);
        # // t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
        # // const t1 = t0 + dot(s, r) / dot(r, r);
        # // NOTE(tp): For some reason (which I haven't spotted yet), the above t0 and hence t1 is wrong
        # // So resorting to calculating it 'backwards'
        t1 = dot(add_points(q, subtract_points(s, p)), r) / dot(r, r)
        t0 = t1 - dot(s, r) / dot(r, r)
        if t0 >= 0 and t0 <= 1 and t1 >= 0 and t1 <= 1:
            return {'result': 'colinear-overlapping', 'ls0t0': t0, 'ls0t1': t1}
        return {'result': 'colinear-disjoint'}
    if equals0(r_s) and not equals0(q_p_r):
        return {'result': 'parallel-non-intersecting'}
    # // t = (q − p) × s / (r × s)
    t = cross(subtract_points(q, p), s) / cross(r, s)
    # // u = (q − p) × r / (r × s)
    u = cross(subtract_points(q, p), r) / cross(r, s)
    if not equals0(r_s) and t >= 0 and t <= 1 and u >= 0 and u <= 1:
        return {'result': 'intersection', 'ls0t': t, 'ls1u': u}
    return {'result': 'no-intersection'}

def is_collision(line_segment0, line_segment1):
    result = intersection(line_segment0, line_segment1)['result']
    return result == 'colinear-overlapping' or result == 'intersection'

def segment_crosses_square(start, end, square_origin, square_radius):
    segment = line_segment(start, end)
    square_ox, square_oy = square_origin
    square_top = line_segment(
      (square_ox - square_radius, square_oy + square_radius),
      (square_ox + square_radius, square_oy + square_radius)
    )
    square_bottom = line_segment(
      (square_ox - square_radius, square_oy - square_radius),
      (square_ox + square_radius, square_oy - square_radius)
    )
    square_left = line_segment(
      (square_ox - square_radius, square_oy + square_radius),
      (square_ox - square_radius, square_oy - square_radius)
    );
    square_right = line_segment(
      (square_ox + square_radius, square_oy + square_radius),
      (square_ox + square_radius, square_oy - square_radius)
    );
    edges = [square_top, square_bottom, square_left, square_right]
    collisions = [is_collision(segment, edge) for edge in edges]
    return any(collisions)
