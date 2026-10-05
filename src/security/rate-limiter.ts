export class RateLimiter {
  private readonly buckets = new Map<string, { count:number; reset:number }>();

  constructor(private readonly max = 60, private readonly windowMs = 60_000) {}

  allow(key: string) {
    const now = Date.now();
    const current = this.buckets.get(key);
    if (!current || now >= current.reset) {
      this.buckets.set(key, { count: 1, reset: now + this.windowMs });
      return true;
    }
    if (current.count >= this.max) return false;
    current.count += 1;
    return true;
  }
}
