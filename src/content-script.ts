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
