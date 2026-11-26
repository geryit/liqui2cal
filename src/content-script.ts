import { buildCalendarUrl } from "./google-calendar";

function getTournament(): string {
  return (
    document
      .querySelector(".mw-page-title-main, #firstHeading")
      ?.textContent?.trim() ?? ""
  );
}

interface ScrapedMatch {
  players: string[];
  timestamp: number;
  stage: string;
  tournament: string;
}

function text(el: Element | null | undefined): string {
  return el?.textContent?.trim() ?? "";
}

function getTimestamp(item: Element): number {
  const timer = item.querySelector<HTMLElement>(".timer-object");
  const timestamp = Number(timer?.dataset.timestamp);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

// Team names render three variants inside .name, so take a single one
function opponentName(opponent: Element): string {
  const names = Array.from(opponent.querySelectorAll(".name"))
    .map((name) => text(name.querySelector(".team-name")) || text(name))
    .filter(Boolean);
  return names.join(" / ") || text(opponent.firstElementChild);
}

function extractTickerCard(card: Element): ScrapedMatch | null {
  const timestamp = getTimestamp(card);
  if (!timestamp) return null;

  const players = Array.from(
    card.querySelectorAll(".match-ticker-card__opponent")
  )
    .map(opponentName)
    .filter(Boolean);

  const stage = text(
    card.querySelector(".match-ticker-card__header > div:last-child")
  );

  // Main page cards carry the tournament name per match
  const tournament = text(
    card.querySelector(".match-ticker-card-tournament-wrapper")
  );

  return { players, timestamp, stage, tournament };
}

function extractLegacyMatch(item: Element): ScrapedMatch | null {
  const timestamp = getTimestamp(item);
  if (!timestamp) return null;

  const players = Array.from(
    item.querySelectorAll(
      ".match-info-opponent-row .name, .match-info-header-opponent .name"
    )
  )
    .map(text)
    .filter(Boolean);

  return {
    players,
    timestamp,
    stage: text(item.querySelector(".match-info-stage")),
    tournament: text(item.querySelector(".match-info-tournament-name")),
  };
}

function createCalendarIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", "3");
  rect.setAttribute("y", "4");
  rect.setAttribute("width", "18");
  rect.setAttribute("height", "18");
  rect.setAttribute("rx", "2");
  svg.appendChild(rect);

  for (const [x1, y1, x2, y2] of [["16","2","16","6"], ["8","2","8","6"], ["3","10","21","10"]]) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.appendChild(line);
  }

  // Plus sign
  for (const [x1, y1, x2, y2] of [["12","14","12","18"], ["10","16","14","16"]]) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svg.appendChild(line);
  }

  return svg;
}

function createButton(url: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.className = "liqui2cal-btn";
  link.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "gap:5px",
    "margin-top:8px",
    "padding:4px 12px",
    "background:#34d399",
    "color:#111827",
    "border-radius:6px",
    "font-size:12px",
    "font-weight:600",
    "text-decoration:none",
    "transition:background 0.15s,transform 0.1s",
    "cursor:pointer",
    "justify-content:center",
  ].join(";");

  link.appendChild(createCalendarIcon());
  link.appendChild(document.createTextNode("Add to Calendar"));

  link.addEventListener("mouseenter", () => {
    link.style.background = "#2abb87";
    link.style.transform = "scale(1.02)";
  });
  link.addEventListener("mouseleave", () => {
    link.style.background = "#34d399";
    link.style.transform = "scale(1)";
  });

  return link;
}

function injectButtons(): void {
  const pageTournament = getTournament();
  const pageUrl = window.location.href;

  const inject = (
    container: Element | null,
    match: ScrapedMatch | null
  ): void => {
    if (!container || !match || container.querySelector(".liqui2cal-btn")) {
      return;
    }

    const url = buildCalendarUrl({
      ...match,
      tournament: match.tournament || pageTournament,
      pageUrl,
    });

    container.appendChild(createButton(url));
  };

  // Current markup, tournament and main pages: .match-ticker-card
  document.querySelectorAll(".match-ticker-card").forEach((card) => {
    inject(card, extractTickerCard(card));
  });

  // Older markup: .carousel-item > .match-info and .new-match-style > .match-info
  document
    .querySelectorAll(".carousel-item, .new-match-style > .match-info")
    .forEach((item) => {
      const container = item.classList.contains("match-info")
        ? item
        : item.querySelector(".match-info");
      inject(container, extractLegacyMatch(item));
    });
}

injectButtons();
