/**
 * Mystery bags: bundle leftover items into fixed-price bags worth more than they cost.
 */

export interface SurplusItem {
  id: string;
  name: string;
  /** Normal shelf price of one unit. */
  price: number;
  /** Units left at end of day. */
  quantity: number;
}

export interface BagOptions {
  /** Price the customer pays per bag, e.g. 5. */
  bagPrice: number;
  /** Target shelf value per bag as a multiple of bagPrice. Default 3 (pay 5, get ~15 of food). */
  valueMultiple?: number;
  /** Max bags to build. Default: as many as stock allows. */
  maxBags?: number;
}

export interface Bag {
  items: { id: string; name: string; quantity: number }[];
  shelfValue: number;
  price: number;
}

/**
 * Greedy bag builder: fills each bag with the highest-value items left until the
 * bag reaches its target shelf value. Only bags that reach the target are returned,
 * so a customer never gets a bag worth less than promised.
 */
export function buildBags(stock: SurplusItem[], options: BagOptions): { bags: Bag[]; leftover: SurplusItem[] } {
  if (options.bagPrice <= 0) throw new RangeError('bagPrice must be > 0');
  const target = options.bagPrice * (options.valueMultiple ?? 3);
  const remaining = stock
    .filter((i) => i.quantity > 0 && i.price > 0)
    .map((i) => ({ ...i }))
    .sort((a, b) => b.price - a.price);

  const bags: Bag[] = [];
  const limit = options.maxBags ?? Number.POSITIVE_INFINITY;

  while (bags.length < limit) {
    const contents = new Map<string, { id: string; name: string; quantity: number }>();
    let value = 0;
    for (const item of remaining) {
      while (item.quantity > 0 && value < target) {
        item.quantity -= 1;
        value += item.price;
        const line = contents.get(item.id) ?? { id: item.id, name: item.name, quantity: 0 };
        line.quantity += 1;
        contents.set(item.id, line);
      }
      if (value >= target) break;
    }
    if (value < target) {
      // Not enough stock for a full bag: put the units back and stop.
      for (const line of contents.values()) {
        const item = remaining.find((i) => i.id === line.id);
        if (item) item.quantity += line.quantity;
      }
      break;
    }
    bags.push({ items: [...contents.values()], shelfValue: Math.round(value * 100) / 100, price: options.bagPrice });
  }

  return { bags, leftover: remaining.filter((i) => i.quantity > 0) };
}
