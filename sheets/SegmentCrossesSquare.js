function SegmentCrossesSquare(
  fromX, fromY, toX, toY,
  squareOriginX, squareOriginY, squareRadius
) {
  const segment = new LineSegment({ x: fromX, y: fromY }, { x: toX, y: toY });
  const squareTop = new LineSegment(
    { x: squareOriginX - squareRadius, y: squareOriginY + squareRadius },
    { x: squareOriginX + squareRadius, y: squareOriginY + squareRadius }
  );
  const squareBottom = new LineSegment(
    { x: squareOriginX - squareRadius, y: squareOriginY - squareRadius },
    { x: squareOriginX + squareRadius, y: squareOriginY - squareRadius }
  );
  const squareLeft = new LineSegment(
    { x: squareOriginX - squareRadius, y: squareOriginY + squareRadius },
    { x: squareOriginX - squareRadius, y: squareOriginY - squareRadius }
  );
  const squareRight = new LineSegment(
    { x: squareOriginX + squareRadius, y: squareOriginY + squareRadius },
    { x: squareOriginX + squareRadius, y: squareOriginY - squareRadius }
  );
  const edges = [squareTop, squareBottom, squareLeft, squareRight];
  for (let edge of edges) {
    const result = intersection(segment, edge);
    console.log(result);
    if (result.type === 'colinear-overlapping' || result.type === 'intersection') {
      return true;
    }
  }
  return false;
}

// from https://gist.github.com/tp/75cb619a7e40e6ad008ef2a6837bbdb2
// compiled with https://www.typescriptlang.org/play
// based on: https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
class LineSegment {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.length = distance(start, end);
        if (this.length === 0 || isNaN(this.length) || !isFinite(this.length)) {
            throw new Error('Invalid length');
        }
        this.direction = {
            x: end.x - start.x,
            y: end.y - start.y,
        };
    }
}
function distance(p1, p2) {
    const distance = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
    return distance;
}
function subtractPoints(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
function addPoints(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
function dot(u, v) {
    return u.x * v.x + u.y * v.y;
}
/**
 * 2-dimensional vector cross product v × w = vx wy − vy wx
 */
function cross(v, w) {
    return v.x * w.y - v.y * w.x;
}
const epsilon = 1 / 1000000;
function equals0(x) {
    return Math.abs(x) < epsilon;
}
/**
 *
 * p + t r = q + u s
 *
 */
function intersection(ls0, ls1) {
    const p = ls0.start;
    const r = ls0.direction;
    const q = ls1.start;
    const s = ls1.direction;
    // r × s
    const r_s = cross(r, s);
    // (q − p) × r
    const q_p_r = cross(subtractPoints(q, p), r);
    if (equals0(r_s) && equals0(q_p_r)) {
        // t0 = (q − p) · r / (r · r)
        // const t0 = dot(subtractPoints(q, p), r) / dot(r, r);
        // t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
        // const t1 = t0 + dot(s, r) / dot(r, r);
        // NOTE(tp): For some reason (which I haven't spotted yet), the above t0 and hence t1 is wrong
        // So resorting to calculating it 'backwards'
        const t1 = dot(addPoints(q, subtractPoints(s, p)), r) / dot(r, r);
        const t0 = t1 - dot(s, r) / dot(r, r);
        if (t0 >= 0 && t0 <= 1 || t1 >= 0 && t1 <= 1) {
            return { type: 'colinear-overlapping', ls0t0: t0, ls0t1: t1 };
        }
        return { type: 'colinear-disjoint' };
    }
    if (equals0(r_s) && !equals0(q_p_r)) {
        return { type: 'parallel-non-intersecting' };
    }
    // t = (q − p) × s / (r × s)
    const t = cross(subtractPoints(q, p), s) / cross(r, s);
    // u = (q − p) × r / (r × s)
    const u = cross(subtractPoints(q, p), r) / cross(r, s);
    if (!equals0(r_s) && t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return { type: 'intersection', ls0t: t, ls1u: u };
    }
    return { type: 'no-intersection' };
}

// console.log(SegmentCrossesSquare(5, 25, 0, -25, 0, 0, 18));

