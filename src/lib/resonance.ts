// Resonance Score: combines engagement signals with time decay.
// Higher = more resonant. Used to sort the "For You" feed.

export interface ResonanceInput {
  views?: number;
  likes?: number;
  comments?: number;
  reactions?: number;
  reposts?: number;
  createdAt: string | Date;
}

const HALF_LIFE_HOURS = 18;

export function resonanceScore(p: ResonanceInput): number {
  const created = new Date(p.createdAt).getTime();
  const ageHours = Math.max(0, (Date.now() - created) / 3_600_000);
  const decay = Math.pow(0.5, ageHours / HALF_LIFE_HOURS);

  const raw =
    (p.views || 0) * 0.3 +
    (p.likes || 0) * 3 +
    (p.comments || 0) * 5 +
    (p.reactions || 0) * 2 +
    (p.reposts || 0) * 6;

  // log compress to prevent runaway viral posts dominating forever
  const compressed = Math.log2(1 + raw);
  return compressed * decay;
}
