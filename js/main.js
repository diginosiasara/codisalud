/* ==========================================================================
   CodiSalud · Comportamiento (JavaScript sin dependencias)
   Mejora progresiva: la página es plenamente usable si este archivo no carga.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktop = window.matchMedia("(min-width: 48em)");

  /* ---------- 1. Menú de navegación (patrón "disclosure") ---------- */
  function initMenu() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("menu-principal");
    if (!header || !toggle || !nav) return;

    header.classList.add("js-menu");

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("data-open", String(open));
      if (!open && returnFocus) toggle.focus();
    }

    // Estado inicial: cerrado en móvil, siempre visible en escritorio
    setOpen(false, false);

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    // Escape cierra el menú y devuelve el foco al botón
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });

    // Cerrar al elegir un enlace interno
    nav.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (link && link.getAttribute("href").charAt(0) === "#") setOpen(false, false);
    });

    // Cerrar al hacer clic fuera
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(e.target)) {
        setOpen(false, false);
      }
    });

    // Al pasar a escritorio, restablecer
    function onBreakpoint() { if (desktop.matches) setOpen(false, false); }
    if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
    else desktop.addListener(onBreakpoint);
  }

  /* ---------- 2. Vídeo: control de pausa (WCAG 2.2.2) ---------- */
  function initVideo() {
    var video = document.getElementById("video-demo");
    var btn = document.getElementById("video-toggle");
    if (!video || !btn) return;

    var userPaused = false;
    btn.hidden = false; // el control solo aparece si JS funciona

    function render() {
      var paused = video.paused;
      btn.setAttribute("data-state", paused ? "paused" : "playing");
      btn.setAttribute("aria-label", paused ? "Reproducir vídeo" : "Pausar vídeo");
    }

    function play() {
      var p = video.play();
      if (p && typeof p.catch === "function") p.catch(function () { render(); });
    }

    btn.addEventListener("click", function () {
      if (video.paused) { userPaused = false; play(); }
      else { userPaused = true; video.pause(); }
    });
    video.addEventListener("play", render);
    video.addEventListener("pause", render);

    // Respeta "reducir movimiento": el vídeo no arranca solo
    if (reduceMotion.matches) {
      userPaused = true;
    }
    render();

    // Reproduce solo cuando es visible (ahorra batería y datos)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { if (!userPaused) play(); }
          else if (!video.paused) video.pause();
        });
      }, { threshold: 0.4 }).observe(video);
    } else if (!userPaused) {
      play();
    }

    // Si el usuario activa "reducir movimiento" mientras navega
    var onMotion = function () { if (reduceMotion.matches) { userPaused = true; video.pause(); } };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onMotion);
    else reduceMotion.addListener(onMotion);
  }

  /* ---------- 3. Año actual en el pie ---------- */
  function initYear() {
    var el = document.getElementById("anio");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() { initMenu(); initVideo(); initYear(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
