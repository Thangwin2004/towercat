/**
 * Voronoi Territorial Province & Continent Generator for "Mèo Chiến Đảo"
 * Generates authentic strategy world geography (Total War, Civilization, Europa Universalis style):
 * - Natural landmasses (mainland continents, peninsulas, straits, and isolated islands).
 * - Open oceanic waters and coastal bays between landmasses with sea routes.
 * - Organic coastal shorelines with headlands, bays, and beaches.
 * - Contiguous provincial partitioning within landmasses without gaps or overlaps.
 */

// Sutherland-Hodgman convex polygon clipping against half-plane (nx*x + ny*y <= d)
function clipPolygon(poly, nx, ny, d) {
  const out = [];
  const len = poly.length;
  if (len === 0) return out;

  for (let i = 0; i < len; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % len];
    const curDist = cur[0] * nx + cur[1] * ny - d;
    const nxtDist = nxt[0] * nx + nxt[1] * ny - d;

    if (curDist <= 0) {
      out.push(cur);
      if (nxtDist > 0) {
        const t = curDist / (curDist - nxtDist);
        out.push([
          cur[0] + t * (nxt[0] - cur[0]),
          cur[1] + t * (nxt[1] - cur[1])
        ]);
      }
    } else if (nxtDist <= 0) {
      const t = curDist / (curDist - nxtDist);
      out.push([
        cur[0] + t * (nxt[0] - cur[0]),
        cur[1] + t * (nxt[1] - cur[1])
      ]);
    }
  }
  return out;
}

/**
 * Organic internal border meandering (simulating natural river valleys / mountain ridges)
 */
function subdivideEdgeOrganic(p1, p2, bounds) {
  const k1 = p1[0] * 1000 + p1[1];
  const k2 = p2[0] * 1000 + p2[1];
  const flip = k1 > k2;
  const a = flip ? p2 : p1;
  const b = flip ? p1 : p2;

  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dist = Math.hypot(dx, dy);

  // If on outer map margin or very short segment, keep straight
  const isOuterA = (a[0] <= bounds.x1 + 2 || a[0] >= bounds.x2 - 2 || a[1] <= bounds.y1 + 2 || a[1] >= bounds.y2 - 2);
  const isOuterB = (b[0] <= bounds.x1 + 2 || b[0] >= bounds.x2 - 2 || b[1] <= bounds.y1 + 2 || b[1] >= bounds.y2 - 2);
  if ((isOuterA && isOuterB) || dist < 28) {
    return [p1, p2];
  }

  // Deterministic pseudo-random seed based on coordinate hashes
  const seed = Math.sin(a[0] * 12.9898 + a[1] * 78.233 + b[0] * 37.719 + b[1] * 11.13) * 43758.5453;
  const hash = seed - Math.floor(seed);
  const perpX = -dy / dist;
  const perpY = dx / dist;

  const offset = (hash - 0.5) * Math.min(16, dist * 0.22);

  const m1x = a[0] + dx * 0.35 + perpX * offset;
  const m1y = a[1] + dy * 0.35 + perpY * offset;
  const m2x = a[0] + dx * 0.65 - perpX * (offset * 0.5);
  const m2y = a[1] + dy * 0.65 - perpY * (offset * 0.5);

  return flip
    ? [b, [m2x, m2y], [m1x, m1y], a]
    : [a, [m1x, m1y], [m2x, m2y], b];
}

/**
 * Group bases into geographic landmass components (continents / islands)
 * strictly connected by overland ('land') or mountain pass ('mountain') routes.
 * Bases connected exclusively by 'sea' routes belong to separate landmasses with open water between them!
 */
export function getLandmassComponents(bases, routes = []) {
  const adj = new Map();
  for (const b of bases) adj.set(b.id, []);

  if (routes && routes.length > 0) {
    for (const r of routes) {
      if (r.type === 'land' || r.type === 'mountain') {
        adj.get(r.from)?.push(r.to);
        adj.get(r.to)?.push(r.from);
      }
    }
  } else {
    // If no explicit routes, cluster based on proximity
    for (let i = 0; i < bases.length; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        const dist = Math.hypot(bases[i].x - bases[j].x, bases[i].y - bases[j].y);
        if (dist <= 220) {
          adj.get(bases[i].id).push(bases[j].id);
          adj.get(bases[j].id).push(bases[i].id);
        }
      }
    }
  }

  const visited = new Set();
  const components = [];

  for (const b of bases) {
    if (!visited.has(b.id)) {
      const comp = [];
      const queue = [b.id];
      visited.add(b.id);
      while (queue.length > 0) {
        const curId = queue.shift();
        const baseObj = bases.find(x => x.id === curId);
        if (baseObj) comp.push(baseObj);
        for (const neighborId of (adj.get(curId) || [])) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      components.push(comp);
    }
  }

  return components;
}

/**
 * Build organic landmass boundary polygon for a group of bases.
 * Uses radial harmonic contouring around the component center and bases,
 * forming natural peninsulas, headlands, and coastal bays.
 */
function buildLandmassPolygon(compBases, bounds, isSingleIsland = false) {
  if (isSingleIsland || compBases.length === 1) {
    // Isolated circular/organic island
    const b = compBases[0];
    const baseRadius = 78;
    const numPts = 32;
    const pts = [];

    for (let i = 0; i < numPts; i++) {
      const ang = (Math.PI * 2 * i) / numPts;
      // Multi-harmonic coastal wave
      const w1 = Math.sin(ang * 3 + b.x * 0.05) * 6;
      const w2 = Math.cos(ang * 5 + b.y * 0.05) * 4;
      const w3 = Math.sin(ang * 7) * 2.5;
      const r = baseRadius + w1 + w2 + w3;

      const px = Math.max(bounds.x1 + 4, Math.min(bounds.x2 - 4, b.x + Math.cos(ang) * r));
      const py = Math.max(bounds.y1 + 4, Math.min(bounds.y2 - 4, b.y + Math.sin(ang) * (r * 0.92)));
      pts.push([Math.round(px * 10) / 10, Math.round(py * 10) / 10]);
    }
    return pts;
  }

  // Multi-base continent / large landmass
  // Calculate bounding envelope of the bases
  let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
  for (const b of compBases) {
    if (b.x < minX) minX = b.x;
    if (b.x > maxX) maxX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.y > maxY) maxY = b.y;
  }

  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;

  // Continental radius per angle depends on distance to the closest base in that direction
  const numSteps = 40;
  const pts = [];

  for (let i = 0; i < numSteps; i++) {
    const ang = (Math.PI * 2 * i) / numSteps;
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);

    // Find furthest projection among member bases in direction (dirX, dirY)
    let maxProj = -9999;
    for (const b of compBases) {
      const bx = b.x - cx;
      const by = b.y - cy;
      const proj = bx * dirX + by * dirY;
      if (proj > maxProj) maxProj = proj;
    }

    // Baseline land buffer from furthest base in this direction
    const buffer = 82;
    // Multi-octave natural coastal harmonics
    const wave = Math.sin(ang * 3 + cx * 0.02) * 8
               + Math.cos(ang * 6 + cy * 0.02) * 5
               + Math.sin(ang * 11) * 2.5;

    const r = Math.max(70, maxProj + buffer + wave);

    const px = Math.max(bounds.x1 + 6, Math.min(bounds.x2 - 6, cx + dirX * r));
    const py = Math.max(bounds.y1 + 6, Math.min(bounds.y2 - 6, cy + dirY * (r * 0.94)));

    pts.push([Math.round(px * 10) / 10, Math.round(py * 10) / 10]);
  }

  return pts;
}

/**
 * Main export: Compute realistic geographic continents, islands, and provinces
 * with authentic landmasses, natural coastlines, and seamless internal boundaries.
 */
export function computeTerritoryProvinces(bases, routes = [], bounds = { x1: 45, y1: 40, x2: 755, y2: 560 }) {
  if (!bases || bases.length === 0) return [];

  // 1. Group bases into geographic landmasses (continents & islands)
  const components = getLandmassComponents(bases, routes);
  const provinces = [];

  for (let cIdx = 0; cIdx < components.length; cIdx++) {
    const comp = components[cIdx];
    const isSingleIsland = comp.length === 1;

    // 2. Build continent boundary polygon for this landmass
    const continentPoly = buildLandmassPolygon(comp, bounds, isSingleIsland);

    if (isSingleIsland) {
      // Single isolated island province
      provinces.push({
        id: comp[0].id,
        poly: continentPoly,
        isIsland: true,
        landmassId: cIdx
      });
      continue;
    }

    // 3. Partition multi-base continent among its member bases
    for (let i = 0; i < comp.length; i++) {
      const base = comp[i];
      let poly = continentPoly.map(pt => [pt[0], pt[1]]);

      // Voronoi clipping against other bases in the SAME continent
      for (let j = 0; j < comp.length; j++) {
        if (i === j) continue;
        const other = comp[j];

        const mx = (base.x + other.x) * 0.5;
        const my = (base.y + other.y) * 0.5;
        const nx = other.x - base.x;
        const ny = other.y - base.y;
        const d = mx * nx + my * ny;

        poly = clipPolygon(poly, nx, ny, d);
      }

      if (poly.length < 3) {
        poly = continentPoly;
      }

      // 4. Subdivide shared interior borders with organic meandering
      const organicPoly = [];
      const len = poly.length;
      for (let e = 0; e < len; e++) {
        const p1 = poly[e];
        const p2 = poly[(e + 1) % len];
        const sub = subdivideEdgeOrganic(p1, p2, bounds);
        for (let s = 0; s < sub.length - 1; s++) {
          organicPoly.push(sub[s]);
        }
      }

      provinces.push({
        id: base.id,
        poly: organicPoly.length >= 3 ? organicPoly : poly,
        isIsland: false,
        landmassId: cIdx
      });
    }
  }

  return provinces;
}
