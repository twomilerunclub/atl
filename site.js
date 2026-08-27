/* =========================================================
   TMR CLUB | ATL

   ▼▼▼  EDIT THIS BLOCK — it fills in the whole site  ▼▼▼
   Change a value here and it updates on every page.
   ========================================================= */

const CLUB = {
  city: "Atlanta, GA",
  distance: "2 miles",

  run: {
    day: "Saturday",     // shown on the site
    dayIndex: 6,         // 0 = Sunday ... 6 = Saturday
    time: "8:00 AM",     // shown on the site
    start24: "08:00",    // 24h, used for the calendar file
    end24: "09:15",      // 24h, used for the calendar file
    spot: "Piedmont Park — Charles Allen Gate",
    mapUrl: "https://maps.google.com/?q=Charles+Allen+Gate+Piedmont+Park+Atlanta"
  },

  // Where signups get sent. Create a free form at https://formspree.io,
  // then paste its endpoint here. Until you do, the form will tell you
  // it isn't connected instead of silently losing signups.
  formEndpoint: "",

  links: {
    instagram: "https://instagram.com/",   // your IG
    strava: "",                            // your Strava club (leave "" to hide)
    groupChat: "",                         // WhatsApp / GroupMe invite (leave "" to hide)
    email: "hello@tmrclub.com"
  }
};

/* ▲▲▲  END OF EDIT BLOCK  ▲▲▲ */

/* ---------- fill placeholders from the config ---------- */
function paint() {
  const map = {
    "run-day": CLUB.run.day,
    "run-days": CLUB.run.day + "s",
    "run-time": CLUB.run.time,
    "run-spot": CLUB.run.spot,
    "run-when": CLUB.run.day + "s, " + CLUB.run.time,
    "club-city": CLUB.city,
    "club-distance": CLUB.distance
  };
  document.querySelectorAll("[data-club]").forEach(function (el) {
    const value = map[el.dataset.club];
    if (value) el.textContent = value;
  });
  document.querySelectorAll("[data-club-href]").forEach(function (el) {
    const key = el.dataset.clubHref;
    const url = key === "map" ? CLUB.run.mapUrl : CLUB.links[key];
    if (url) { el.href = key === "email" ? "mailto:" + url : url; }
    else { el.closest("li") ? el.closest("li").remove() : el.remove(); }
  });
}

/* ---------- scroll reveal ---------- */
function reveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (item) { io.observe(item); });
}

/* ---------- calendar file for the weekly run ---------- */
function nextRunDate() {
  const now = new Date();
  const date = new Date(now);
  date.setDate(now.getDate() + ((CLUB.run.dayIndex - now.getDay() + 7) % 7));
  const parts = CLUB.run.start24.split(":");
  date.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  if (date < now) date.setDate(date.getDate() + 7);
  return date;
}

function stamp(date, time24) {
  const p = function (n) { return String(n).padStart(2, "0"); };
  const t = time24.split(":");
  return "" + date.getFullYear() + p(date.getMonth() + 1) + p(date.getDate()) +
    "T" + p(Number(t[0])) + p(Number(t[1])) + "00";
}

function downloadRunInvite() {
  const date = nextRunDate();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TMR Club ATL//EN",
    "BEGIN:VEVENT",
    "UID:" + Date.now() + "@tmrclub",
    "DTSTART:" + stamp(date, CLUB.run.start24),
    "DTEND:" + stamp(date, CLUB.run.end24),
    "RRULE:FREQ=WEEKLY",
    "SUMMARY:TMR Club run — " + CLUB.distance,
    "LOCATION:" + CLUB.run.spot,
    "DESCRIPTION:Two miles at your pace. Everyone finishes. Run today, run TMR.",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "tmr-club-run.ics";
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- registration ---------- */
function validate(form) {
  let firstBad = null;
  form.querySelectorAll("[required]").forEach(function (input) {
    const field = input.closest(".field");
    const empty = !input.value.trim();
    const badEmail = input.type === "email" && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value);
    const invalid = empty || badEmail;
    field.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (invalid) {
      field.querySelector(".error").textContent = badEmail
        ? "That email address is missing something — check it over."
        : "We need this one to sign you up.";
      if (!firstBad) firstBad = input;
    }
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}

function showBib(form) {
  const first = (form.elements.first_name.value || "").trim();
  const last = (form.elements.last_name.value || "").trim();
  const number = String(Math.floor(Math.random() * 8999) + 1000);

  document.getElementById("bib-number").textContent = number;
  document.getElementById("bib-name").textContent = (first + " " + last).trim().toUpperCase();

  form.hidden = true;
  const panel = document.getElementById("success");
  panel.hidden = false;
  panel.setAttribute("tabindex", "-1");
  panel.focus();
  panel.scrollIntoView({ block: "center" });
}

function registration() {
  const form = document.getElementById("join-form");
  if (!form) return;

  form.addEventListener("input", function (event) {
    const field = event.target.closest(".field.is-invalid");
    if (field && event.target.value.trim()) field.classList.remove("is-invalid");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate(form)) return;

    const button = form.querySelector("button[type=submit]");
    const label = button.textContent;

    if (!CLUB.formEndpoint) {
      document.getElementById("setup-notice").hidden = false;
      showBib(form);
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";

    fetch(CLUB.formEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Bad response");
        showBib(form);
      })
      .catch(function () {
        button.disabled = false;
        button.textContent = label;
        const failure = document.getElementById("send-failed");
        failure.hidden = false;
        failure.scrollIntoView({ block: "center" });
      });
  });

  const calendar = document.getElementById("add-calendar");
  if (calendar) calendar.addEventListener("click", downloadRunInvite);
}

/* ---------- go ---------- */
document.addEventListener("DOMContentLoaded", function () {
  paint();
  reveals();
  registration();
  document.querySelectorAll("[data-calendar]").forEach(function (el) {
    el.addEventListener("click", downloadRunInvite);
  });
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
