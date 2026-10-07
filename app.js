/* =========================================================
   Pau Alarcón — Currículum
   JavaScript sin dependencias. Cada bloque es autónomo:
   si uno falla, el resto del documento sigue funcionando.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Almacenamiento tolerante a fallos ---------- */
  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  }

  /* ---------- Idioma: castellano, catalán e inglés ----------
     El castellano se lee del HTML; el resto sale de i18n.js. */
  var I18N = window.CV_I18N || {};
  var LANGS = ["es", "ca", "en"];
  var lang = "es";
  var esText = {};
  var metaDesc = document.querySelector('meta[name="description"]');
  var i18nNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var i18nAttrNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-attr]"));

  function attrPairs(el) {
    return el.getAttribute("data-i18n-attr").split(",").map(function (pair) {
      var parts = pair.split(":");
      return { attr: parts[0].trim(), key: parts[1].trim() };
    });
  }

  i18nNodes.forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    el._i18nEs = el.innerHTML;
    if (!(key in esText)) esText[key] = el.innerHTML;
  });
  i18nAttrNodes.forEach(function (el) {
    el._i18nEs = {};
    attrPairs(el).forEach(function (pair) {
      var value = el.getAttribute(pair.attr) || "";
      el._i18nEs[pair.attr] = value;
      if (!(pair.key in esText)) esText[pair.key] = value;
    });
  });
  esText["meta.title"] = document.title;
  if (metaDesc) esText["meta.desc"] = metaDesc.getAttribute("content");

  function t(key) {
    var table = I18N[lang] || {};
    if (lang !== "es" && key in table) return table[key];
    if (key in esText) return esText[key];
    return (I18N.es && I18N.es[key]) || key;
  }

  function detectLang() {
    var saved = store("cv-lang");
    if (LANGS.indexOf(saved) !== -1) return saved;
    var prefs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) !== -1) return code;
    }
    return "es";
  }

  function setLang(next, persist) {
    if (LANGS.indexOf(next) === -1) next = "es";
    lang = next;
    root.setAttribute("lang", next);

    i18nNodes.forEach(function (el) {
      el.innerHTML = next === "es" ? el._i18nEs : t(el.getAttribute("data-i18n"));
    });
    i18nAttrNodes.forEach(function (el) {
      attrPairs(el).forEach(function (pair) {
        el.setAttribute(pair.attr, next === "es" ? el._i18nEs[pair.attr] : t(pair.key));
      });
    });
    document.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));

    Array.prototype.forEach.call(document.querySelectorAll("[data-lang]"), function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === next ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".sk-word[data-level]"), function (word) {
      word.textContent = levelWord(parseInt(word.getAttribute("data-level"), 10));
    });
    if (typeof palette !== "undefined" && palette && !palette.hidden) render(input.value);

    if (persist) store("cv-lang", next);
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-lang]");
    if (btn) setLang(btn.getAttribute("data-lang"), true);
  });

  setLang(detectLang(), false);

  /* ---------- Año del pie ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Tema claro / oscuro ---------- */
  var saved = store("cv-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("cv-theme", next);
    toast(t(next === "dark" ? "theme.dark" : "theme.light"));
  }

  ["themeBtn", "themeBtnM"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", toggleTheme);
  });

  /* ---------- Aviso flotante ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  /* ---------- Copiar al portapapeles ---------- */
  function copy(text) {
    function fallback() {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        toast(t("copied") + text);
      } catch (e) {
        toast(t("copy.manual") + text);
      }
      document.body.removeChild(field);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        toast(t("copied") + text);
      }, fallback);
    } else {
      fallback();
    }
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-copy]");
    if (trigger) copy(trigger.getAttribute("data-copy"));
  });

  /* ---------- Imprimir / PDF ---------- */
  function print() {
    window.print();
  }
  ["printBtn", "pdfRow"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", print);
  });

  /* ---------- Matriz de competencias: puntos ---------- */
  var TOTAL_DOTS = 10;
  function levelWord(level) {
    if (level >= 88) return t("level.adv");
    if (level >= 75) return t("level.solid");
    return t("level.dev");
  }

  Array.prototype.forEach.call(document.querySelectorAll(".matrix-col li[data-level]"), function (item) {
    var level = parseInt(item.getAttribute("data-level"), 10) || 0;
    var filled = Math.round(level / 10);

    var foot = document.createElement("div");
    foot.className = "sk-foot";

    var dots = document.createElement("div");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    for (var i = 0; i < TOTAL_DOTS; i++) {
      var dot = document.createElement("span");
      dot.className = i < filled ? "dot on" : "dot";
      dot.style.transitionDelay = reduceMotion ? "0ms" : i * 35 + "ms";
      dots.appendChild(dot);
    }

    var word = document.createElement("span");
    word.className = "sk-word";
    word.setAttribute("data-level", String(level));
    word.textContent = levelWord(level);

    foot.appendChild(dots);
    foot.appendChild(word);
    item.appendChild(foot);
  });

  /* ---------- Entrada en escena ---------- */
  var animated = [].concat(
    Array.prototype.slice.call(document.querySelectorAll(".band-head, .statement, .pillars li, .ledger, .matrix-col, .tools, .work > li, .repo-card, .tl-item, .langs, .contact-big, .contact-lead, .contact-rows, .facts li, .hero-lead"))
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    animated.forEach(function (el) {
      el.classList.add("reveal");
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    animated.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    animated.forEach(function (el) {
      el.classList.add("reveal-in");
    });
  }

  /* ---------- Portada: el nombre entra por líneas ---------- */
  if (!reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll(".display .w"), function (word, index) {
      word.style.transform = "translateY(105%)";
      word.style.transition = "transform 0.95s cubic-bezier(0.22, 1, 0.36, 1) " + (index * 110 + 90) + "ms";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          word.style.transform = "none";
        });
      });
    });
  }

  /* ---------- Tarjetas: foco que sigue al ratón ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (event) {
      var card = event.target.closest && event.target.closest(".spot");
      if (!card) return;
      var box = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - box.left + "px");
      card.style.setProperty("--my", event.clientY - box.top + "px");
    }, { passive: true });
  }

  /* ---------- Índice activo ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".rail-nav a"));
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.setAttribute("aria-current", link.getAttribute("href") === "#" + entry.target.id ? "true" : "false");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Barra de progreso ---------- */
  var bar = document.getElementById("progressBar");
  if (bar) {
    var ticking = false;
    var updateBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateBar);
      },
      { passive: true }
    );
    updateBar();
  }

  /* ---------- Herramientas: cinta continua ---------- */
  var toolsList = document.querySelector(".tools-list");
  if (toolsList && !reduceMotion) {
    var clone = toolsList.cloneNode(true);
    Array.prototype.forEach.call(clone.children, function (child) {
      child.setAttribute("aria-hidden", "true");
      toolsList.appendChild(child);
    });
  }

  /* ---------- Paleta de comandos ---------- */
  var palette = document.getElementById("palette");
  var input = document.getElementById("paletteInput");
  var list = document.getElementById("paletteList");
  var lastFocus = null;
  var active = 0;
  var visible = [];

  /* key: clave de i18n.js · extra: texto fijo detrás · text: etiqueta sin traducir */
  var commands = [
    { num: "01", key: "nav.perfil", kind: "section", run: function () { go("#perfil"); } },
    { num: "02", key: "cmd.xp", kind: "section", run: function () { go("#experiencia"); } },
    { num: "03", key: "nav.formacion", kind: "section", run: function () { go("#formacion"); } },
    { num: "04", key: "cmd.skills", kind: "section", run: function () { go("#competencias"); } },
    { num: "05", key: "nav.proyectos", kind: "section", run: function () { go("#proyectos"); } },
    { num: "06", key: "nav.contacto", kind: "section", run: function () { go("#contacto"); } },
    { num: "@", key: "cmd.copyEmail", extra: "pau20470@gmail.com", kind: "action", run: function () { copy("pau20470@gmail.com"); } },
    { num: "#", key: "cmd.copyPhone", extra: "644 562 230", kind: "action", run: function () { copy("644 562 230"); } },
    { num: "✉", key: "cmd.mail", kind: "link", run: function () { window.location.href = "mailto:pau20470@gmail.com"; } },
    { num: "☎", key: "cmd.call", extra: "644 562 230", kind: "link", run: function () { window.location.href = "tel:+34644562230"; } },
    { num: "↗", key: "cmd.linkedin", kind: "link", run: function () { window.open("https://www.linkedin.com/in/pau-alarcon-ruiz-4a1424437/", "_blank", "noopener"); } },
    { num: "↗", key: "cmd.github", kind: "link", run: function () { window.open("https://github.com/Tortuanapai", "_blank", "noopener"); } },
    { num: "↗", key: "cmd.hardysoft", kind: "link", run: function () { window.open("https://www.hardysoft.es/", "_blank", "noopener"); } },
    { num: "⌄", key: "cmd.expand", kind: "action", run: function () { setWork(true); toast(t("cmd.expanded")); } },
    { num: "⌃", key: "cmd.collapse", kind: "action", run: function () { setWork(false); toast(t("cmd.collapsed")); } },
    { num: "◐", key: "theme.toggle", kind: "action", run: toggleTheme },
    { num: "⎙", key: "cmd.pdf", kind: "action", run: print },
    { num: "ES", text: "Ver en castellano", kind: "lang", run: function () { setLang("es", true); } },
    { num: "CA", text: "Veure en català", kind: "lang", run: function () { setLang("ca", true); } },
    { num: "EN", text: "View in English", kind: "lang", run: function () { setLang("en", true); } }
  ];

  function labelOf(command) {
    return command.text || t(command.key) + (command.extra || "");
  }

  function kindOf(command) {
    return t("kind." + command.kind);
  }

  function go(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", hash);
  }

  function setWork(open) {
    Array.prototype.forEach.call(document.querySelectorAll(".work details"), function (details) {
      details.open = open;
    });
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function render(query) {
    if (!list) return;
    var needle = normalize(query.trim());
    visible = commands.filter(function (command) {
      return !needle || normalize(labelOf(command) + " " + kindOf(command)).indexOf(needle) !== -1;
    });

    list.innerHTML = "";
    if (!visible.length) {
      var empty = document.createElement("li");
      empty.className = "p-empty";
      empty.textContent = t("palette.empty");
      list.appendChild(empty);
      return;
    }

    active = 0;
    visible.forEach(function (command, index) {
      var row = document.createElement("li");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", index === 0 ? "true" : "false");
      row.innerHTML =
        '<span class="p-num"></span><span class="p-label"></span><span class="p-kind"></span>';
      row.querySelector(".p-num").textContent = command.num;
      row.querySelector(".p-label").textContent = labelOf(command);
      row.querySelector(".p-kind").textContent = kindOf(command);
      row.addEventListener("mouseenter", function () {
        select(index);
      });
      row.addEventListener("click", function () {
        closePalette();
        command.run();
      });
      list.appendChild(row);
    });
  }

  function select(index) {
    if (!list || !visible.length) return;
    var rows = list.querySelectorAll('li[role="option"]');
    active = (index + visible.length) % visible.length;
    Array.prototype.forEach.call(rows, function (row, i) {
      row.setAttribute("aria-selected", i === active ? "true" : "false");
    });
    if (rows[active]) rows[active].scrollIntoView({ block: "nearest" });
  }

  function openPalette() {
    if (!palette || !input) return;
    lastFocus = document.activeElement;
    palette.hidden = false;
    input.value = "";
    render("");
    input.focus();
  }

  function closePalette() {
    if (!palette) return;
    palette.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  ["paletteOpen", "paletteOpenM"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", openPalette);
  });

  if (palette) {
    palette.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-close")) closePalette();
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      render(input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        select(active + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        select(active - 1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        var command = visible[active];
        if (command) {
          closePalette();
          command.run();
        }
      } else if (event.key === "Tab") {
        event.preventDefault();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    var open = palette && !palette.hidden;
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open ? closePalette() : openPalette();
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closePalette();
      return;
    }
    if (event.key === "/" && !open && !typing) {
      event.preventDefault();
      openPalette();
    }
  });

  /* ---------- Impresión: todo el detalle visible ---------- */
  var beforePrint = [];
  window.addEventListener("beforeprint", function () {
    beforePrint = [];
    Array.prototype.forEach.call(document.querySelectorAll("details"), function (details) {
      beforePrint.push([details, details.open]);
      details.open = true;
    });
  });
  window.addEventListener("afterprint", function () {
    beforePrint.forEach(function (pair) {
      pair[0].open = pair[1];
    });
  });
})();
