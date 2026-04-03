interface MatchData {
  timestamp: number;
  players: string[];
  stage: string;
  tournament: string;
  pageUrl: string;
}

function formatDateUTC(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export function buildCalendarUrl(match: MatchData): string {
  const start = new Date(match.timestamp * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const title = match.players.join(" vs ");
  const description = `${match.tournament} - ${match.stage}\n${match.pageUrl}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDateUTC(start)}/${formatDateUTC(end)}`,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export type { MatchData };
