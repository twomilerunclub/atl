/* =========================================================
   TMR CLUB | ATL — routes

   ▼▼▼  EDIT THIS BLOCK — your routes and their reviews  ▼▼▼

   Each route needs:
     id          short unique key, used to store likes
     name        shown on the card
     distance    e.g. "2.0 mi"
     elevation   e.g. "65 ft"
     difficulty  "Easy" | "Moderate" | "Hilly"  (drives the filter)
     summary     one or two lines about the route
     start       where the group meets for it
     surface     what you're running on
     mapUrl      link to the real route (Google Maps, Strava, Komoot…)
     image       optional — path to a real map screenshot. If set, it
                 replaces the drawn sketch. e.g. "assets/img/route-krog.png"
     video       optional — a preview of the route. Either a YouTube or
                 Vimeo EMBED url ("https://www.youtube.com/embed/XXXX"), or
                 a file you host yourself ("assets/video/krog.mp4"). Leave
                 as "" and the video section simply doesn't appear.
     path        the sketch line (SVG path on a 400 x 260 canvas)
     miles       mile-marker dots: [[x, y, label], …]
     profile     elevation shape, 0 = lowest point, 1 = highest
     likes       starting like count
     reviews     see notes in README before publishing these
   ========================================================= */

const ROUTES = [
  {
    id: "centennial",
    name: "Centennial Park Route",
    distance: "2.0 mi",
    elevation: "65 ft",
    difficulty: "Easy",
    summary: "Wide sidewalks, good lighting and almost no climbing. This is the one we point first-timers at.",
    start: "Centennial Olympic Park, south lawn",
    surface: "Pavement, one short brick stretch",
    mapUrl: "https://maps.google.com/?q=Centennial+Olympic+Park+Atlanta",
    image: "",
    video: "",
    path: "M 60 210 L 60 120 L 130 120 L 130 62 L 250 62 L 250 118 L 330 118 L 330 205 L 150 205 L 150 210 Z",
    miles: [[130, 62, "1"], [330, 190, "2"]],
    profile: [0.30, 0.34, 0.31, 0.38, 0.42, 0.36, 0.33, 0.35, 0.40, 0.34, 0.31, 0.30],
    likes: 34,
    reviews: [
      { name: "Varun P", from: "Georgia State University", rating: 5, likes: 12,
        text: "I never thought I would say this, but I love running. Two miles felt like nothing with a group around me." },
      { name: "Maya T", from: "Downtown", rating: 4, likes: 5,
        text: "Flat the whole way and easy to find. Gets busy near the fountain on weekends but it clears out fast." }
    ]
  },
  {
    id: "krog",
    name: "Krog Street Route",
    distance: "2.1 mi",
    elevation: "90 ft",
    difficulty: "Moderate",
    summary: "Through the tunnel, up onto the Eastside Trail and back. Best murals of any route we run.",
    start: "Krog Street Market, north entrance",
    surface: "Pavement and packed trail",
    mapUrl: "https://maps.google.com/?q=Krog+Street+Tunnel+Atlanta",
    image: "",
    video: "",
    path: "M 55 200 L 120 200 L 150 150 L 220 150 L 250 95 L 340 95 L 340 175 L 260 175 L 230 218 L 100 218",
    miles: [[220, 150, "1"], [340, 170, "2"]],
    profile: [0.22, 0.30, 0.45, 0.58, 0.62, 0.55, 0.60, 0.68, 0.52, 0.38, 0.28, 0.24],
    likes: 51,
    reviews: [
      { name: "Sam S", from: "Georgia Tech", rating: 5, likes: 18,
        text: "Your expectations will fly sky high. I felt like I was soaring by the time we hit the trail." },
      { name: "Dee W", from: "Old Fourth Ward", rating: 4, likes: 7,
        text: "One real hill coming out of the tunnel and then it evens out. Worth it for the murals." }
    ]
  },
  {
    id: "piedmont",
    name: "Piedmont Park Loop",
    distance: "2.0 mi",
    elevation: "110 ft",
    difficulty: "Moderate",
    summary: "A full lap of the meadow and the Active Oval. Grass option the whole way if your knees want a break.",
    start: "Charles Allen Gate",
    surface: "Paved path, grass alternative",
    mapUrl: "https://maps.google.com/?q=Piedmont+Park+Atlanta",
    image: "",
    video: "",
    path: "M 70 215 L 70 140 Q 70 95 115 95 L 205 95 Q 250 95 250 140 L 250 165 L 330 165 L 330 215 L 190 215",
    miles: [[205, 95, "1"], [330, 200, "2"]],
    profile: [0.28, 0.40, 0.52, 0.60, 0.55, 0.48, 0.58, 0.66, 0.50, 0.36, 0.30, 0.27],
    likes: 47,
    reviews: [
      { name: "Priya R", from: "Midtown", rating: 5, likes: 9,
        text: "The skyline view from the meadow at 8am is the reason I keep showing up on Saturdays." }
    ]
  },
  {
    id: "fourthward",
    name: "Old Fourth Ward Climb",
    distance: "2.3 mi",
    elevation: "150 ft",
    difficulty: "Hilly",
    summary: "Our hardest route. Two proper climbs with a flat recovery between them. Walk them if you need to.",
    start: "Historic Fourth Ward Park, skate bowl",
    surface: "Pavement, some broken sidewalk",
    mapUrl: "https://maps.google.com/?q=Historic+Fourth+Ward+Park+Atlanta",
    image: "",
    video: "",
    path: "M 60 220 L 105 165 L 175 165 L 205 105 L 285 105 L 320 60 L 350 60 L 350 130 L 285 195 L 175 195 L 145 225",
    miles: [[205, 105, "1"], [350, 120, "2"]],
    profile: [0.15, 0.35, 0.62, 0.80, 0.72, 0.55, 0.60, 0.85, 0.95, 0.60, 0.32, 0.18],
    likes: 22,
    reviews: [
      { name: "Chris O", from: "Inman Park", rating: 4, likes: 6,
        text: "Genuinely tough for two miles. I walked the second hill on my first try and ran all of it a month later." }
    ]
  }
];

/* ▲▲▲  END OF EDIT BLOCK  ▲▲▲ */

/* ---------- tiny helpers ---------- */
function esc(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* Likes are remembered in this browser only. Wrapped because private
   modes and sandboxed previews can throw on storage access. */
function readLikes() {
  try { return JSON.parse(localStorage.getItem("tmr-likes") || "{}"); }
  catch (e) { return {}; }
}
function writeLikes(state) {
  try { localStorage.setItem("tmr-likes", JSON.stringify(state)); }
  catch (e) { /* storage unavailable — likes just won't survive a reload */ }
}
let liked = readLikes();

function stars(rating) {
  let out = "";
  for (let i = 1; i <= 5; i++) out += i <= rating ? "★" : "☆";
  return '<span class="stars" aria-label="' + rating + ' out of 5">' + out + "</span>";
}

/* ---------- schematic map ---------- */
function seeded(seed) {
  let value = seed * 9301 + 49297;
  return function () { value = (value * 9301 + 49297) % 233280; return value / 233280; };
}

function mapSVG(route, index) {
  if (route.image) {
    return '<img class="route-map__img" src="' + esc(route.image) + '" alt="Map of the ' +
      esc(route.name) + '" loading="lazy">';
  }

  const rand = seeded(index + 3);
  let streets = "";

  for (let i = 0; i < 5; i++) {
    const x = 30 + Math.round(rand() * 340);
    streets += '<line x1="' + x + '" y1="0" x2="' + (x + Math.round(rand() * 20 - 10)) + '" y2="260"/>';
  }
  for (let i = 0; i < 4; i++) {
    const y = 25 + Math.round(rand() * 210);
    streets += '<line x1="0" y1="' + y + '" x2="400" y2="' + (y + Math.round(rand() * 16 - 8)) + '"/>';
  }
  streets += '<line x1="-10" y1="' + (40 + Math.round(rand() * 60)) + '" x2="410" y2="' + (200 + Math.round(rand() * 40)) + '"/>';

  const blockX = 40 + Math.round(rand() * 90);
  const blockY = 40 + Math.round(rand() * 60);
  const green = '<rect class="route-map__block" x="' + blockX + '" y="' + blockY +
    '" width="' + (70 + Math.round(rand() * 60)) + '" height="' + (55 + Math.round(rand() * 40)) + '" rx="4"/>';

  const start = route.path.match(/M\s*([\d.]+)\s+([\d.]+)/);
  const sx = start ? start[1] : 60;
  const sy = start ? start[2] : 200;

  const markers = route.miles.map(function (m) {
    return '<g class="route-map__mile"><circle cx="' + m[0] + '" cy="' + m[1] + '" r="11"/>' +
      '<text x="' + m[0] + '" y="' + (m[1] + 4) + '">' + esc(m[2]) + "</text></g>";
  }).join("");

  return '<svg class="route-map__svg" viewBox="0 0 400 260" role="img" aria-label="Schematic map of the ' +
    esc(route.name) + '">' +
    '<g class="route-map__streets">' + streets + "</g>" + green +
    '<path class="route-map__line" d="' + route.path + '"/>' +
    '<g class="route-map__start"><circle cx="' + sx + '" cy="' + sy + '" r="9"/>' +
    '<text x="' + (Number(sx) + 15) + '" y="' + (Number(sy) - 13) + '">Start</text></g>' +
    markers + "</svg>";
}

/* ---------- elevation sparkline ---------- */
function sparkSVG(profile) {
  const w = 220, h = 46, step = w / (profile.length - 1);
  const points = profile.map(function (v, i) {
    return (i * step).toFixed(1) + "," + (h - 6 - v * (h - 14)).toFixed(1);
  });
  return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true" preserveAspectRatio="none">' +
    '<polygon class="spark__fill" points="0,' + h + " " + points.join(" ") + " " + w + "," + h + '"/>' +
    '<polyline class="spark__line" points="' + points.join(" ") + '"/></svg>';
}

/* ---------- cards ---------- */
function likeCount(route) {
  return route.likes + (liked[route.id] ? 1 : 0);
}

function cardHTML(route, index) {
  const on = !!liked[route.id];
  const count = route.reviews.length;
  return '<article class="route-card reveal" data-difficulty="' + esc(route.difficulty) + '">' +
    '<div class="route-map">' + mapSVG(route, index) + "</div>" +
    '<div class="route-card__body">' +
      '<h3 class="h-sm">' + esc(route.name) + "</h3>" +
      '<dl class="route-stats">' +
        "<div><dt>Distance</dt><dd>" + esc(route.distance) + "</dd></div>" +
        "<div><dt>Elevation</dt><dd>" + esc(route.elevation) + "</dd></div>" +
        "<div><dt>Difficulty</dt><dd>" + esc(route.difficulty) + "</dd></div>" +
      "</dl>" +
      "<p>" + esc(route.summary) + "</p>" +
      '<div class="route-spark"><span class="item__key" style="border:0;padding:0;margin:0">Elevation</span>' +
        sparkSVG(route.profile) + "</div>" +
      '<div class="route-card__actions">' +
        '<button class="like' + (on ? " is-on" : "") + '" type="button" data-like="' + esc(route.id) +
          '" aria-pressed="' + on + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.5-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z"/></svg>' +
          '<span data-likecount="' + esc(route.id) + '">' + likeCount(route) + "</span>" +
          '<span class="visually-hidden">people like the ' + esc(route.name) + "</span>" +
        "</button>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-open="' + esc(route.id) + '">' +
          "Reviews (" + count + ")</button>" +
        '<a class="btn btn--sm btn--ghost" href="' + esc(route.mapUrl) + '" target="_blank" rel="noopener">Map</a>' +
      "</div>" +
    "</div></article>";
}

/* ---------- review dialog ---------- */
function reviewHTML(review, routeId, i) {
  const key = routeId + ":" + i;
  const on = !!liked[key];
  return '<li class="review">' +
    '<div class="review__head">' +
      '<span class="avatar" aria-hidden="true">' + esc(review.name.charAt(0)) + "</span>" +
      "<div><p class=\"review__name\">" + esc(review.name) + "</p>" +
      '<p class="review__from">' + esc(review.from || "TMR Club") + "</p></div>" +
      stars(review.rating) +
    "</div>" +
    "<p>" + esc(review.text) + "</p>" +
    '<button class="like like--sm' + (on ? " is-on" : "") + '" type="button" data-like="' + esc(key) +
      '" aria-pressed="' + on + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.5-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z"/></svg>' +
      '<span data-likecount="' + esc(key) + '">' + (review.likes + (on ? 1 : 0)) + "</span>" +
      '<span class="visually-hidden">found this helpful</span>' +
    "</button></li>";
}

function videoHTML(route) {
  if (!route.video) return "";
  const isFile = /\.(mp4|webm|mov)$/i.test(route.video);
  const player = isFile
    ? '<video controls preload="metadata" playsinline src="' + esc(route.video) + '"></video>'
    : '<iframe src="' + esc(route.video) + '" title="Preview of the ' + esc(route.name) +
      '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
  return '<p class="item__key">Route preview</p><div class="video">' + player + "</div>";
}

/* ---------- testimonials: the best-liked reviews across every route ---------- */
function testimonials() {
  const rail = document.getElementById("testimonials");
  if (!rail) return;

  const all = [];
  ROUTES.forEach(function (route) {
    route.reviews.forEach(function (review) {
      all.push({ review: review, route: route });
    });
  });

  const top = all.sort(function (a, b) { return b.review.likes - a.review.likes; }).slice(0, 3);
  if (!top.length) { rail.closest("section").hidden = true; return; }

  rail.innerHTML = top.map(function (entry) {
    return '<figure class="quote reveal">' +
      '<blockquote>' + esc(entry.review.text) + "</blockquote>" +
      '<figcaption><span class="avatar" aria-hidden="true">' + esc(entry.review.name.charAt(0)) + "</span>" +
      "<span><span class=\"review__name\">" + esc(entry.review.name) + "</span>" +
      '<span class="review__from">' + esc(entry.review.from || "TMR Club") + " &middot; " +
      esc(entry.route.name) + "</span></span></figcaption></figure>";
  }).join("");
}

function openRoute(id) {
  const route = ROUTES.find(function (r) { return r.id === id; });
  if (!route) return;
  const dialog = document.getElementById("route-dialog");

  dialog.querySelector("[data-slot=title]").textContent = route.name;
  dialog.querySelector("[data-slot=meta]").innerHTML =
    "<span>" + esc(route.distance) + "</span><span>" + esc(route.elevation) + "</span>" +
    "<span>" + esc(route.difficulty) + "</span>";
  dialog.querySelector("[data-slot=video]").innerHTML = videoHTML(route);
  dialog.querySelector("[data-slot=detail]").innerHTML =
    "<p>" + esc(route.summary) + "</p>" +
    '<dl class="route-stats route-stats--stack">' +
      "<div><dt>Start</dt><dd>" + esc(route.start) + "</dd></div>" +
      "<div><dt>Surface</dt><dd>" + esc(route.surface) + "</dd></div>" +
    "</dl>";
  dialog.querySelector("[data-slot=reviews]").innerHTML = route.reviews.length
    ? route.reviews.map(function (r, i) { return reviewHTML(r, route.id, i); }).join("")
    : '<li class="review review--empty"><p>No reviews yet. Run it on Saturday and be the first to say something.</p></li>';

  dialog.querySelector("[name=route]").value = route.name;
  dialog.dataset.route = route.id;
  dialog.showModal();
}

/* ---------- likes ---------- */
function toggleLike(key, button) {
  const on = !liked[key];
  if (on) liked[key] = 1; else delete liked[key];
  writeLikes(liked);

  button.classList.toggle("is-on", on);
  button.setAttribute("aria-pressed", String(on));

  document.querySelectorAll('[data-likecount="' + key + '"]').forEach(function (el) {
    el.textContent = Number(el.textContent) + (on ? 1 : -1);
  });
}

/* ---------- review submission ---------- */
function reviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = form.elements.name;
    const text = form.elements.text;
    let bad = false;

    [name, text].forEach(function (input) {
      const field = input.closest(".field");
      const empty = !input.value.trim();
      field.classList.toggle("is-invalid", empty);
      if (empty) { field.querySelector(".error").textContent = "We need this to post your review."; bad = true; }
    });
    if (bad) return;

    const done = function () {
      form.hidden = true;
      document.getElementById("review-thanks").hidden = false;
      if (!CLUB.formEndpoint) document.getElementById("review-setup").hidden = false;
    };

    if (!CLUB.formEndpoint) { done(); return; }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending…";

    fetch(CLUB.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(); done(); })
      .catch(function () {
        button.disabled = false;
        button.textContent = "Post review";
        document.getElementById("review-failed").hidden = false;
      });
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("route-grid");
  if (!grid) return;

  grid.innerHTML = ROUTES.map(cardHTML).join("");
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.05 });
    grid.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    grid.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  document.addEventListener("click", function (event) {
    const likeBtn = event.target.closest("[data-like]");
    if (likeBtn) { toggleLike(likeBtn.dataset.like, likeBtn); return; }
    const openBtn = event.target.closest("[data-open]");
    if (openBtn) { openRoute(openBtn.dataset.open); return; }
    if (event.target.closest("[data-close]")) { document.getElementById("route-dialog").close(); }
  });

  // filter by difficulty
  const chips = document.querySelectorAll("[data-filter]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const value = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      let shown = 0;
      grid.querySelectorAll(".route-card").forEach(function (card) {
        const match = value === "all" || card.dataset.difficulty === value;
        card.hidden = !match;
        if (match) shown++;
      });
      document.getElementById("filter-empty").hidden = shown > 0;
      document.getElementById("filter-count").textContent =
        shown + (shown === 1 ? " route" : " routes");
    });
  });

  const dialog = document.getElementById("route-dialog");
  dialog.addEventListener("close", function () {
    const form = document.getElementById("review-form");
    form.hidden = false;
    form.reset();
    form.querySelectorAll(".is-invalid").forEach(function (f) { f.classList.remove("is-invalid"); });
    const button = form.querySelector("button[type=submit]");
    button.disabled = false;
    button.textContent = "Post review";
    document.getElementById("review-thanks").hidden = true;
    document.getElementById("review-failed").hidden = true;
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  reviewForm();
  testimonials();
  document.getElementById("filter-count").textContent = ROUTES.length + " routes";
});
