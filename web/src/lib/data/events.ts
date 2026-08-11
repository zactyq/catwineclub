import "server-only";
import {
  TABLES,
  createRecord,
  createRecords,
  listRecords,
  whereEq,
} from "@/lib/nocodb";

export type EventRecord = {
  Id: number;
  CreatedAt: string;
  Title: string;
  Description: string | null;
  EventDate: string;
  Location: string | null;
  Capacity: number;
  CreatedByEmail: string | null;
};

export type EventSignup = {
  Id: number;
  CreatedAt: string;
  EventId: number;
  MemberEmail: string;
  PlusOnes: number;
};

export type EventWithAvailability = EventRecord & {
  spotsTaken: number;
  spotsRemaining: number;
};

export type NewEventInput = {
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  capacity: number;
  createdByEmail: string;
};

function toFields(input: NewEventInput) {
  return {
    Title: input.title,
    Description: input.description ?? null,
    EventDate: input.eventDate,
    Location: input.location ?? null,
    Capacity: input.capacity,
    CreatedByEmail: input.createdByEmail,
  };
}

async function signupsByEventId(): Promise<Map<number, EventSignup[]>> {
  const signups = await listRecords<EventSignup>(TABLES.eventSignups);
  const map = new Map<number, EventSignup[]>();
  for (const signup of signups) {
    const list = map.get(signup.EventId) ?? [];
    list.push(signup);
    map.set(signup.EventId, list);
  }
  return map;
}

function withAvailability(event: EventRecord, signups: EventSignup[]): EventWithAvailability {
  const spotsTaken = signups.reduce((sum, s) => sum + 1 + s.PlusOnes, 0);
  return {
    ...event,
    spotsTaken,
    spotsRemaining: Math.max(0, event.Capacity - spotsTaken),
  };
}

export async function listEvents(): Promise<EventWithAvailability[]> {
  const [events, signupsMap] = await Promise.all([
    listRecords<EventRecord>(TABLES.events, { sort: "EventDate" }),
    signupsByEventId(),
  ]);
  return events.map((event) => withAvailability(event, signupsMap.get(event.Id) ?? []));
}

export async function getEvent(id: number): Promise<EventWithAvailability | null> {
  const events = await listRecords<EventRecord>(TABLES.events, { where: whereEq("Id", id) });
  const event = events[0];
  if (!event) return null;
  const signups = await listRecords<EventSignup>(TABLES.eventSignups, {
    where: whereEq("EventId", id),
  });
  return withAvailability(event, signups);
}

export async function createEvent(input: NewEventInput): Promise<EventRecord> {
  return createRecord<EventRecord>(TABLES.events, toFields(input));
}

export async function createEventsBulk(inputs: NewEventInput[]): Promise<EventRecord[]> {
  return createRecords<EventRecord>(TABLES.events, inputs.map(toFields));
}

export class SignupError extends Error {}

export async function signUpForEvent(
  eventId: number,
  memberEmail: string,
  plusOnes: number
): Promise<EventSignup> {
  const event = await getEvent(eventId);
  if (!event) throw new SignupError("This event no longer exists.");
  if (plusOnes < 0) throw new SignupError("Plus-ones can't be negative.");
  const partySize = 1 + plusOnes;
  if (partySize > event.spotsRemaining) {
    throw new SignupError(
      `Only ${event.spotsRemaining} spot(s) left — not enough room for your party of ${partySize}.`
    );
  }
  return createRecord<EventSignup>(TABLES.eventSignups, {
    EventId: eventId,
    MemberEmail: memberEmail,
    PlusOnes: plusOnes,
  });
}

export async function listSignupsForEvent(eventId: number): Promise<EventSignup[]> {
  return listRecords<EventSignup>(TABLES.eventSignups, { where: whereEq("EventId", eventId) });
}
