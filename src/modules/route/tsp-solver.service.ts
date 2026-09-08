import { Injectable } from '@nestjs/common';

export interface TspPoint {
  id: string;
  latitude: number;
  longitude: number;
}

export interface TspResult {
  optimizedOrder: Array<{
    id: string;
    sequence: number;
    latitude: number;
    longitude: number;
  }>;
  totalDistanceKm: number;
}

@Injectable()
export class TspSolverService {

  /**
   * Entry point: Nearest Neighbor → 2-opt improvement.
   */
  solve(depot: { latitude: number; longitude: number }, points: TspPoint[]): TspResult {
    if (points.length === 0) {
      return { optimizedOrder: [], totalDistanceKm: 0 };
    }

    if (points.length === 1) {
      const d = this.haversine(
        depot.latitude, depot.longitude,
        points[0].latitude, points[0].longitude,
      );
      return {
        optimizedOrder: [{
          id: points[0].id, sequence: 0,
          latitude: points[0].latitude, longitude: points[0].longitude,
        }],
        totalDistanceKm: Math.round(d * 2 * 100) / 100, // đi + về
      };
    }

    // Build distance matrix: index 0 = depot, 1..N = points
    const coords: [number, number][] = [
      [depot.latitude, depot.longitude],
      ...points.map(p => [p.latitude, p.longitude] as [number, number]),
    ];
    const dist = this.buildDistanceMatrix(coords);

    // Nearest Neighbor
    let tour = this.nearestNeighbor(dist);

    // 2-opt improvement
    tour = this.twoOpt(tour, dist);

    // Extract result (skip depot at start/end)
    const optimizedOrder = tour
      .slice(1, -1) // bỏ depot đầu + cuối
      .map((pointIndex, seq) => {
        const point = points[pointIndex - 1]; // pointIndex 1-based → 0-based
        return {
          id: point.id,
          sequence: seq,
          latitude: point.latitude,
          longitude: point.longitude,
        };
      });

    const totalDistanceKm = Math.round(
      this.tourDistance(tour, dist) * 100,
    ) / 100;

    return { optimizedOrder, totalDistanceKm };
  }

  // ─── HAVERSINE ───────────────────────────────────
  private haversine(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
  ): number {
    const R = 6371.0; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  // ─── DISTANCE MATRIX ────────────────────────────
  private buildDistanceMatrix(coords: [number, number][]): number[][] {
    const n = coords.length;
    const matrix: number[][] = Array.from({ length: n }, () =>
      new Array(n).fill(0),
    );
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = this.haversine(
          coords[i][0], coords[i][1],
          coords[j][0], coords[j][1],
        );
        matrix[i][j] = d;
        matrix[j][i] = d;
      }
    }
    return matrix;
  }

  // ─── NEAREST NEIGHBOR ───────────────────────────
  private nearestNeighbor(dist: number[][]): number[] {
    const n = dist.length;
    const visited = new Array(n).fill(false);
    const tour: number[] = [0]; // start at depot
    visited[0] = true;

    for (let step = 0; step < n - 1; step++) {
      const current = tour[tour.length - 1];
      let nearest = -1;
      let nearestDist = Infinity;

      for (let j = 0; j < n; j++) {
        if (!visited[j] && dist[current][j] < nearestDist) {
          nearest = j;
          nearestDist = dist[current][j];
        }
      }

      tour.push(nearest);
      visited[nearest] = true;
    }

    tour.push(0); // return to depot
    return tour;
  }

  // ─── 2-OPT IMPROVEMENT ─────────────────────────
  private twoOpt(tour: number[], dist: number[][]): number[] {
    const n = tour.length;
    let improved = true;

    while (improved) {
      improved = false;
      for (let i = 1; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
          const delta =
            dist[tour[i - 1]][tour[j]] +
            dist[tour[i]][tour[j + 1]] -
            dist[tour[i - 1]][tour[i]] -
            dist[tour[j]][tour[j + 1]];

          if (delta < -1e-10) {
            // Reverse segment [i..j]
            this.reverseSegment(tour, i, j);
            improved = true;
          }
        }
      }
    }

    return tour;
  }

  private reverseSegment(tour: number[], i: number, j: number): void {
    while (i < j) {
      [tour[i], tour[j]] = [tour[j], tour[i]];
      i++;
      j--;
    }
  }

  // ─── TOUR DISTANCE ──────────────────────────────
  private tourDistance(tour: number[], dist: number[][]): number {
    let total = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      total += dist[tour[i]][tour[i + 1]];
    }
    return total;
  }
}
