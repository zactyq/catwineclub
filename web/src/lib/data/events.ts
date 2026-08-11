import "server-only";
import {
  TABLES,
  createRecord,
  createRecords,
  listRecords,
  whereEq,
  type Attachment,
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
  Image: Attachment[] | null;
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
  mySignup: { plusOnes: number } | null;
};

export type NewEventInput = {
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  capacity: number;
  createdByEmail: string;
  image?: Attachment;
};

function toFields(input: NewEventInput) {
  return {
    Title: input.title,
    Description: input.description ?? null,
    EventDate: input.eventDate,
    Location: input.location ?? null,
    Capacity: input.capacity,
    CreatedByEmail: input.createdByEmail,
    Image: input.image ? [input.image] : null,
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

function withAvailability(
  event: EventRecord,
  signups: EventSignup[],
  viewerEmail?: string
): EventWithAvailability {
  const spotsTaken = signups.reduce((sum, s) => sum + 1 + s.PlusOnes, 0);
  const mine = viewerEmail
    ? signups.find((s) => s.MemberEmail.toLowerCase() === viewerEmail.toLowerCase())
    : undefined;
  return {
    ...event,
    spotsTaken,
    spotsRemaining: Math.max(0, event.Capacity - spotsTaken),
    mySignup: mine ? { plusOnes: mine.PlusOnes } : null,
  };
}

export async function listEvents(viewerEmail?: string): Promise<EventWithAvailability[]> {
  const [events, signupsMap] = await Promise.all([
    listRecords<EventRecord>(TABLES.events, { sort: "EventDate" }),
    signupsByEventId(),
  ]);
  return events.map((event) =>
    withAvailability(event, signupsMap.get(event.Id) ?? [], viewerEmail)
  );
}

export async function getEvent(
  id: number,
  viewerEmail?: string
): Promise<EventWithAvailability | null> {
  const events = await listRecords<EventRecord>(TABLES.events, { where: whereEq("Id", id) });
  const event = events[0];
  if (!event) return null;
  const signups = await listRecords<EventSignup>(TABLES.eventSignups, {
    where: whereEq("EventId", id),
  });
  return withAvailability(event, signups, viewerEmail);
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
  const event = await getEvent(eventId, memberEmail);
  if (!event) throw new SignupError("This event no longer exists.");
  if (event.mySignup) throw new SignupError("You're already signed up for this event.");
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

export type MySignup = EventSignup & { eventTitle: string; eventDate: string };

export async function listSignupsForMember(memberEmail: string): Promise<MySignup[]> {
  const [signups, events] = await Promise.all([
    listRecords<EventSignup>(TABLES.eventSignups, {
      where: whereEq("MemberEmail", memberEmail),
      sort: "-CreatedAt",
    }),
    listRecords<EventRecord>(TABLES.events),
  ]);
  const eventsById = new Map(events.map((e) => [e.Id, e]));
  return signups.map((s) => ({
    ...s,
    eventTitle: eventsById.get(s.EventId)?.Title ?? "Unknown event",
    eventDate: eventsById.get(s.EventId)?.EventDate ?? "",
  }));
}
