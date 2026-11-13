/* Han Nay Aung — shared script (menu, reveal-on-scroll, publication filters) */
(function () {
  "use strict";
  var root = document.documentElement;

  /* Footer year */
  var year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile menu (single nav list, collapsible on small screens) ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "閉じる" : "メニュー";
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Fade-in on scroll ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    var fold = window.innerHeight;
    revealEls.forEach(function (el) {
      // Only hide what is still below the fold; visible content never flickers.
      if (el.getBoundingClientRect().top > fold) {
        el.classList.add("reveal-pending");
        io.observe(el);
      }
    });
  }

  /* ---------- Publications: category filter ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cats = document.querySelectorAll(".pub-cat[data-cat]");
  if (chips.length && cats.length) {
    var applyFilter = function (filter) {
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", String(c.getAttribute("data-filter") === filter));
      });
      cats.forEach(function (cat) {
        var hide = filter !== "all" && cat.getAttribute("data-cat") !== filter;
        cat.hidden = hide;
        // Keep the [n] numbering stable: a hidden category still advances the counter.
        var skip = cat.previousElementSibling;
        if (skip && skip.classList.contains("cat-skip")) {
          skip.style.counterIncrement = hide ? "pub " + cat.querySelectorAll(".pub").length : "none";
        }
      });
    };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        applyFilter(chip.getAttribute("data-filter"));
      });
    });
    // Year links inside a hidden category: show everything first.
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (target && target.closest(".pub-cat[hidden]")) applyFilter("all");
    });
  }

  /* ---------- Print: expand every "show more" block ---------- */
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details.more:not([open])").forEach(function (d) {
      d.setAttribute("open", "");
      d.setAttribute("data-print-opened", "");
    });
  });
  window.addEventListener("afterprint", function () {
    document.querySelectorAll("details[data-print-opened]").forEach(function (d) {
      d.removeAttribute("open");
      d.removeAttribute("data-print-opened");
    });
  });
})();
