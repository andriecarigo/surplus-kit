import { markdownPrice, buildPickupSlots, buildBags } from '../src/index.js';

const closesAt = new Date('2026-01-01T21:00:00');

// 1. A $4.50 pastry, 45 minutes before close.
console.log('Pastry price 45 min before close:', markdownPrice(4.5, 45));

// 2. Pickup slots for the last hour.
const slots = buildPickupSlots({ opensAt: new Date('2026-01-01T20:00:00'), closesAt, slotMinutes: 15 });
console.log('Pickup slots:', slots.map((s) => s.start.toTimeString().slice(0, 5)).join(', '));

// 3. Turn leftovers into $5 mystery bags worth at least $15 each.
const { bags, leftover } = buildBags(
  [
    { id: 'bagel', name: 'Bagel', price: 2.5, quantity: 8 },
    { id: 'muffin', name: 'Muffin', price: 3.5, quantity: 5 },
    { id: 'salad', name: 'Salad bowl', price: 9, quantity: 2 },
  ],
  { bagPrice: 5 },
);
console.log(`Built ${bags.length} bags:`);
for (const bag of bags) console.log(`  $${bag.price} bag worth $${bag.shelfValue}:`, bag.items.map((i) => `${i.quantity}x ${i.name}`).join(', '));
console.log('Left over:', leftover.map((i) => `${i.quantity}x ${i.name}`).join(', ') || 'nothing');
