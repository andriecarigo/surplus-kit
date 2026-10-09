# surplus-kit

Tiny, dependency-free TypeScript toolkit for apps that sell end-of-day surplus food. Think "rescue bag" apps for bakeries, cafés and grocers.

It covers the three things every surplus-food app has to get right:

- **Markdown pricing**: lower prices step by step as closing time gets closer, with a price floor and rounding.
- **Pickup windows**: split the time before close into reservable slots with a capacity per slot.
- **Mystery bags**: bundle leftover items into fixed-price bags that are guaranteed to be worth a set multiple of what the customer pays.

No dependencies, no network calls, no accounts. Pure functions you can drop into any backend or app.

## Install

```bash
npm install surplus-kit
```

## Usage

```ts
import { markdownPrice, buildPickupSlots, buildBags } from 'surplus-kit';

// A $4.50 pastry, 45 minutes before close -> 2.25 (50% off by default)
markdownPrice(4.5, 45);

// 15-minute pickup slots for the last hour, 5 people per slot
buildPickupSlots({
  opensAt: new Date('2026-01-01T20:00:00'),
  closesAt: new Date('2026-01-01T21:00:00'),
  slotMinutes: 15,
  capacityPerSlot: 5,
});

// $5 bags, each worth at least $15 of shelf value
const { bags, leftover } = buildBags(
  [
    { id: 'bagel', name: 'Bagel', price: 2.5, quantity: 8 },
    { id: 'muffin', name: 'Muffin', price: 3.5, quantity: 5 },
  ],
  { bagPrice: 5, valueMultiple: 3 },
);
```

### Markdown steps

The default schedule is 30% off from 3 hours before close, 50% off from 90 minutes, and 70% off from 30 minutes. Pass your own:

```ts
markdownPrice(10, 20, {
  steps: [
    { minutesBeforeClose: 120, discount: 0.25 },
    { minutesBeforeClose: 30, discount: 0.6 },
  ],
  floor: 0.3,     // never below 30% of the original price
  roundTo: 0.05,  // round to the nearest 5 cents
});
```

### Mystery bags

`buildBags` fills each bag with the highest-value items left until it reaches `bagPrice x valueMultiple`. A bag that can't reach that value is never returned, so customers always get at least what was promised. Your input array is not modified.

## Development

```bash
npm install
npm test          # builds and runs the tests
npm run example   # runs examples/basic.ts
```

## Contributing

Issues and pull requests are welcome. Ideas on the roadmap: per-category markdown schedules, allergen-aware bag building, and timezone helpers for pickup windows.

## License

MIT
