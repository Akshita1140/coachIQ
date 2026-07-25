import { google } from "googleapis";

let oauth2Client = null;

/**
 * Lazily builds the OAuth2 client authenticated as the mentor, using the
 * long-lived refresh token generated once via scripts/getGoogleRefreshToken.js.
 * Every request to Google is made "as the mentor" — students never need
 * their own Google account or OAuth consent for this to work.
 */
function getAuthClient() {
  if (oauth2Client) return oauth2Client;

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      "Google Calendar is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and " +
        "GOOGLE_REFRESH_TOKEN in backend/.env (see backend/.env.example and " +
        "scripts/getGoogleRefreshToken.js)."
    );
  }

  oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || "http://localhost:5000/oauth2callback"
  );
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  return oauth2Client;
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getAuthClient() });
}

const MENTOR_TIMEZONE = process.env.MENTOR_TIMEZONE || "Asia/Kolkata";
const SESSION_MINUTES = 30;
const BUSINESS_START_HOUR = 10; // 10 AM mentor time
const BUSINESS_END_HOUR = 19; // 7 PM mentor time
const DAYS_AHEAD = 7;

/**
 * Builds every candidate 30-min slot across the next DAYS_AHEAD days within
 * business hours, then removes any that overlap the mentor's existing
 * Calendar events (via freebusy.query). Returns the open slots only.
 */
export async function getAvailableSlots() {
  const calendar = getCalendarClient();

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setMinutes(0, 0, 0);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + DAYS_AHEAD);

  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      timeZone: MENTOR_TIMEZONE,
      items: [{ id: "primary" }],
    },
  });

  const busy = (freebusy.data.calendars?.primary?.busy || []).map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));

  const overlapsBusy = (slotStart, slotEnd) =>
    busy.some((b) => slotStart < b.end && slotEnd > b.start);

  const slots = [];
  for (let day = 0; day < DAYS_AHEAD; day++) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() + day);

    for (let hour = BUSINESS_START_HOUR; hour < BUSINESS_END_HOUR; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(dayDate);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + SESSION_MINUTES * 60 * 1000);

        if (slotStart <= now) continue; // no slots in the past
        if (overlapsBusy(slotStart, slotEnd)) continue;

        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
    }
  }

  return slots;
}

/**
 * Creates a Calendar event on the mentor's primary calendar with a
 * Google Meet link auto-attached, invites the student by email, and
 * returns the created event's Meet link + Calendar link.
 */
export async function createMentorSession({ start, end, studentEmail, studentName, topic }) {
  const calendar = getCalendarClient();

  const summary = `CoachIQ mentor session — ${studentName || studentEmail}`;
  const description = topic
    ? `1:1 mentor session booked via CoachIQ.\nFocus area: ${topic}`
    : "1:1 mentor session booked via CoachIQ.";

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1, // required for Google Meet link generation
    sendUpdates: "all", // emails the student their invite automatically
    requestBody: {
      summary,
      description,
      start: { dateTime: start, timeZone: MENTOR_TIMEZONE },
      end: { dateTime: end, timeZone: MENTOR_TIMEZONE },
      attendees: studentEmail ? [{ email: studentEmail }] : [],
      conferenceData: {
        createRequest: {
          requestId: `coachiq-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "email", minutes: 60 * 12 },
        ],
      },
    },
  });

  const event = response.data;
  const meetLink = event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri;

  return {
    eventId: event.id,
    meetLink: meetLink || null,
    calendarLink: event.htmlLink,
    start: event.start?.dateTime,
    end: event.end?.dateTime,
  };
}