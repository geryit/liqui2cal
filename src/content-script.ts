import { buildCalendarUrl } from "./google-calendar";

function getTournament(): string {
  return (
    document.querySelector(".mw-page-title-main")?.textContent?.trim() ?? ""
  );
}

function extractMatch(item: Element): {
  players: string[];
  timestamp: number;
  stage: string;
} | null {
  const timer = item.querySelector<HTMLElement>(".timer-object");
  const timestamp = Number(timer?.dataset.timestamp);
  if (!timestamp) return null;

  const names = Array.from(
    item.querySelectorAll(".match-info-opponent-row .name")
  )
    .map((el) => el.textContent?.trim())
    .filter((n): n is string => !!n);

  const stage =
    item.querySelector(".match-info-stage")?.textContent?.trim() ?? "";

  return { players: names, timestamp, stage };
}

function createButton(url: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "btn btn-secondary btn-extrasmall liqui2cal-btn";
  link.style.cssText =
    "display:flex;align-items:center;gap:4px;margin-top:6px;justify-content:center;";
  link.textContent = "Add to Calendar";
  return link;
}

function injectButtons(): void {
  const tournament = getTournament();
  const pageUrl = window.location.href;
  const items = document.querySelectorAll(".carousel-item");

  items.forEach((item) => {
    if (item.querySelector(".liqui2cal-btn")) return;

    const match = extractMatch(item);
    if (!match) return;

    const url = buildCalendarUrl({
      ...match,
      tournament,
      pageUrl,
    });

    const btn = createButton(url);
    const matchInfo = item.querySelector(".match-info");
    if (matchInfo) {
      matchInfo.appendChild(btn);
    }
  });
}

injectButtons();
