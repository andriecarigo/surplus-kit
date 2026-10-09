/**
 * Pickup windows: split the time before close into slots customers can reserve.
 */

export interface PickupSlot {
  start: Date;
  end: Date;
  capacity: number;
  reserved: number;
}

export interface SlotOptions {
  /** When pickups can start. */
  opensAt: Date;
  /** When the store closes (last pickup ends here). */
  closesAt: Date;
  /** Slot length in minutes. Default 15. */
  slotMinutes?: number;
  /** Max reservations per slot. Default 5. */
  capacityPerSlot?: number;
}

export function buildPickupSlots(options: SlotOptions): PickupSlot[] {
  const slotMs = (options.slotMinutes ?? 15) * 60_000;
  const capacity = options.capacityPerSlot ?? 5;
  if (slotMs <= 0) throw new RangeError('slotMinutes must be > 0');
  if (options.closesAt <= options.opensAt) throw new RangeError('closesAt must be after opensAt');

  const slots: PickupSlot[] = [];
  for (let t = options.opensAt.getTime(); t < options.closesAt.getTime(); t += slotMs) {
    const end = Math.min(t + slotMs, options.closesAt.getTime());
    slots.push({ start: new Date(t), end: new Date(end), capacity, reserved: 0 });
  }
  return slots;
}

/** Slots that still have room and haven't ended by `now`. */
export function availableSlots(slots: PickupSlot[], now: Date = new Date()): PickupSlot[] {
  return slots.filter((s) => s.reserved < s.capacity && s.end > now);
}

/**
 * Reserves one spot in the slot starting at `start`. Returns the updated slot,
 * or null when the slot is full, already over, or doesn't exist.
 */
export function reserveSlot(slots: PickupSlot[], start: Date, now: Date = new Date()): PickupSlot | null {
  const slot = slots.find((s) => s.start.getTime() === start.getTime());
  if (!slot || slot.reserved >= slot.capacity || slot.end <= now) return null;
  slot.reserved += 1;
  return slot;
}
