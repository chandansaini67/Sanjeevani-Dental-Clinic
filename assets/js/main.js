/* Sanjeevani Dental Clinic — site JS.
   Plain-JS first: everything works without GSAP; the animation layer is additive.
   CSS never hides content — initial animation states are set here, right before animating. */

(function () {
  "use strict";

  var PHONE = "917005378195";
  var WA_BASE = "https://wa.me/" + PHONE + "?text=";

  /* ---------- current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- live Google rating & review count ----------
     Reads a SAME-ORIGIN /assets/data/reviews.json that a daily GitHub Action refreshes
     from the clinic's Google profile (via Featurable) — no third-party call or CORS in
     the visitor's browser. The HTML ships a correct static baseline ("4.8" / "33+"), so
     every page is right before JS runs and stays right if the fetch ever fails: no throw,
     no console noise, no layout shift. Visible text only — NO AggregateRating schema
     (Google's self-serving-review policy). */
  (function initReviews() {
    var ratingEls = document.querySelectorAll("[data-gmb-rating]");
    var countEls = document.querySelectorAll("[data-gmb-count]");
    if (!ratingEls.length && !countEls.length) return;

    fetch("/assets/data/reviews.json", { cache: "no-cache" })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data) return;
        var r = Number(data.rating);
        var c = Math.round(Number(data.count));
        if (r > 0 && r <= 5) {
          ratingEls.forEach(function (el) {
            el.textContent = (Math.round(r * 10) / 10).toFixed(1);
          });
        }
        if (c > 0) {
          countEls.forEach(function (el) {
            el.textContent = String(c);
          });
        }
      })
      .catch(function () {
        /* keep the baseline; nothing to do */
      });
  })();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- live open/closed status (always IST, via Intl) ---------- */
  function istNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.find(function (x) {
        return x.type === type;
      });
      return p ? p.value : "";
    };
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: days[get("weekday")],
      minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10),
    };
  }

  function updateStatus() {
    var pills = document.querySelectorAll("[data-status-pill]");
    if (!pills.length) return;
    var now = istNow();
    var OPEN = 9 * 60;
    var CLOSE = 17 * 60;
    var text;
    var open = false;

    if (now.day === 0) {
      text = "Closed today (Sunday) · Opens Mon 9 AM";
    } else if (now.minutes >= OPEN && now.minutes < CLOSE) {
      open = true;
      var left = CLOSE - now.minutes;
      text =
        left <= 60
          ? "Open now · Closes in " + left + " min"
          : "Open now · 9 AM – 5 PM";
    } else if (now.minutes < OPEN) {
      var until = OPEN - now.minutes;
      text =
        until <= 60
          ? "Opens in " + until + " min"
          : "Closed now · Opens today 9 AM";
    } else {
      text = now.day === 6 ? "Closed now · Opens Mon 9 AM" : "Closed now · Opens tomorrow 9 AM";
    }

    pills.forEach(function (pill) {
      pill.classList.toggle("is-open", open);
      pill.classList.toggle("is-closed", !open);
      var t = pill.querySelector(".status-text");
      if (t) t.textContent = text;
    });
  }
  updateStatus();
  window.setInterval(updateStatus, 30000);

  /* ---------- WhatsApp booking form ---------- */
  var form = document.querySelector("[data-booking-form]");
  if (form) {
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) {
      var t = new Date();
      var iso =
        t.getFullYear() +
        "-" +
        String(t.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(t.getDate()).padStart(2, "0");
      dateInput.min = iso;
      if (!dateInput.value) dateInput.value = iso;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (name) {
        var el = form.querySelector('[name="' + name + '"]');
        return el ? el.value.trim() : "";
      };
      var date = v("date");
      var formattedDate = date
        ? new Date(date + "T09:00:00").toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";
      var lines = [
        "Hello Sanjeevani Dental Clinic! 👋",
        "",
        "I would like to book an appointment.",
        "",
        "👤 *Name:* " + v("name"),
        "📞 *Phone:* " + v("phone"),
        "🦷 *Service:* " + v("service"),
        "👨‍⚕️ *Preferred Doctor:* " + v("doctor"),
        "📅 *Date:* " + formattedDate,
        "⏰ *Time:* " + v("time"),
      ];
      var note = v("note");
      if (note) lines.push("📝 *Note:* " + note);
      lines.push("", "Please confirm my booking. Thank you!");
      window.open(WA_BASE + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    });
  }

  /* ---------- GSAP layer (additive, guarded) ---------- */
  function initMotion() {
    if (!(window.gsap && window.ScrollTrigger)) return;
    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", function () {
      /* reveal-on-scroll — transforms/opacity only */
      var els = gsap.utils.toArray("[data-reveal]");
      if (els.length) {
        els.forEach(function (el) {
          gsap.set(el, { opacity: 0, y: 26 });
        });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 88%",
          once: true,
          onEnter: function (batch) {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.08,
              overwrite: true,
              clearProps: "transform",
            });
          },
        });
        /* safety net: anything still hidden after load settles becomes visible */
        window.setTimeout(function () {
          ScrollTrigger.refresh();
        }, 400);
      }

      /* stat counters — final value already in HTML; animate up once */
      gsap.utils.toArray("[data-count]").forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        if (isNaN(target)) return;
        var obj = { n: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: function () {
            gsap.to(obj, {
              n: target,
              duration: 1.4,
              ease: "power1.out",
              onUpdate: function () {
                el.textContent = Math.round(obj.n).toLocaleString("en-IN") + suffix;
              },
            });
          },
        });
      });

      return function () {};
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion);
  } else {
    initMotion();
  }
})();
