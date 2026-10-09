/**
 * Markdown pricing: lower the price of surplus items as closing time gets closer.
 */

export interface MarkdownStep {
  /** Minutes before close at which this discount starts applying. */
  minutesBeforeClose: number;
  /** Discount as a fraction, e.g. 0.3 = 30% off. */
  discount: number;
}

export interface MarkdownOptions {
  /** Ordered or unordered steps; the deepest applicable discount wins. */
  steps: MarkdownStep[];
  /** Never sell below this fraction of the original price. Default 0.2 (80% off max). */
  floor?: number;
  /** Round the final price to this increment, e.g. 0.05 or 0.5. Default 0.01. */
  roundTo?: number;
}

export const DEFAULT_STEPS: MarkdownStep[] = [
  { minutesBeforeClose: 180, discount: 0.3 },
  { minutesBeforeClose: 90, discount: 0.5 },
  { minutesBeforeClose: 30, discount: 0.7 },
];

function roundPrice(value: number, increment: number): number {
  const rounded = Math.round(value / increment) * increment;
  return Math.round(rounded * 100) / 100;
}

/**
 * Returns the discount fraction that applies `minutesLeft` minutes before close.
 * Returns 0 when no step applies yet.
 */
export function discountAt(minutesLeft: number, steps: MarkdownStep[] = DEFAULT_STEPS): number {
  if (minutesLeft < 0) minutesLeft = 0;
  let best = 0;
  for (const step of steps) {
    if (step.discount < 0 || step.discount >= 1) {
      throw new RangeError(`discount must be in [0, 1), got ${step.discount}`);
    }
    if (minutesLeft <= step.minutesBeforeClose && step.discount > best) best = step.discount;
  }
  return best;
}

/** Marked-down price for an item with `originalPrice`, `minutesLeft` before close. */
export function markdownPrice(
  originalPrice: number,
  minutesLeft: number,
  options: MarkdownOptions = { steps: DEFAULT_STEPS },
): number {
  if (originalPrice < 0) throw new RangeError('originalPrice must be >= 0');
  const floor = options.floor ?? 0.2;
  const roundTo = options.roundTo ?? 0.01;
  const discount = discountAt(minutesLeft, options.steps);
  const price = Math.max(originalPrice * (1 - discount), originalPrice * floor);
  return roundPrice(price, roundTo);
}
