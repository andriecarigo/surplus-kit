import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  discountAt,
  markdownPrice,
  buildPickupSlots,
  availableSlots,
  reserveSlot,
  buildBags,
} from '../src/index.js';

test('discountAt picks the deepest step that applies', () => {
  assert.equal(discountAt(300), 0);
  assert.equal(discountAt(180), 0.3);
  assert.equal(discountAt(60), 0.5);
  assert.equal(discountAt(10), 0.7);
  assert.equal(discountAt(-5), 0.7);
});

test('markdownPrice respects floor and rounding', () => {
  assert.equal(markdownPrice(10, 300), 10);
  assert.equal(markdownPrice(10, 60), 5);
  assert.equal(markdownPrice(10, 10, { steps: [{ minutesBeforeClose: 30, discount: 0.95 }], floor: 0.2 }), 2);
  assert.equal(markdownPrice(3.33, 60, { steps: [{ minutesBeforeClose: 90, discount: 0.5 }], roundTo: 0.05 }), 1.65);
});

test('markdownPrice rejects bad input', () => {
  assert.throws(() => markdownPrice(-1, 10));
  assert.throws(() => discountAt(10, [{ minutesBeforeClose: 30, discount: 1 }]));
});

test('pickup slots split the window and fill up', () => {
  const opensAt = new Date('2026-01-01T17:00:00Z');
  const closesAt = new Date('2026-01-01T18:00:00Z');
  const slots = buildPickupSlots({ opensAt, closesAt, slotMinutes: 20, capacityPerSlot: 1 });
  assert.equal(slots.length, 3);

  const now = new Date('2026-01-01T16:00:00Z');
  assert.ok(reserveSlot(slots, opensAt, now));
  assert.equal(reserveSlot(slots, opensAt, now), null);
  assert.equal(availableSlots(slots, now).length, 2);
  assert.equal(availableSlots(slots, new Date('2026-01-01T17:59:00Z')).length, 1);
});

test('buildBags only returns bags that hit the promised value', () => {
  const stock = [
    { id: 'croissant', name: 'Croissant', price: 3, quantity: 6 },
    { id: 'loaf', name: 'Sourdough loaf', price: 7, quantity: 2 },
    { id: 'cookie', name: 'Cookie', price: 2, quantity: 3 },
  ];
  const { bags, leftover } = buildBags(stock, { bagPrice: 5, valueMultiple: 3 });
  assert.ok(bags.length >= 1);
  for (const bag of bags) assert.ok(bag.shelfValue >= 15);
  const unitsInBags = bags.flatMap((b) => b.items).reduce((n, i) => n + i.quantity, 0);
  const unitsLeft = leftover.reduce((n, i) => n + i.quantity, 0);
  assert.equal(unitsInBags + unitsLeft, 11);
  assert.equal(stock[0].quantity, 6, 'input stock is not mutated');
});
