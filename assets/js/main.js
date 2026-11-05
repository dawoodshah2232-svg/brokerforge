/* Forex Setup — shared behaviour. No external JS. */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header: shadow on scroll, hide on scroll down / show on scroll up */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY || 0;
  function onScroll(){
    var y = window.scrollY || 0;
    if(header){
      header.classList.toggle("scrolled", y > 8);
      if(y > 320 && y > lastY + 4){ header.classList.add("hidden-nav"); }
      else if(y < lastY - 4 || y <= 320){ header.classList.remove("hidden-nav"); }
    }
    var top = document.querySelector(".to-top");
    if(top){ top.classList.toggle("show", y > 600); }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* Mobile drawer */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("overlay");
  var closeBtn = document.querySelector(".drawer-close");
  var mobileCta = document.querySelector(".mobile-cta");
  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle("open", open);
    if(overlay) overlay.classList.toggle("show", open);
    if(toggle){ toggle.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); }
    if(mobileCta) mobileCta.style.visibility = open ? "hidden" : "";
    document.body.style.overflow = open ? "hidden" : "";
  }
  if(toggle) toggle.addEventListener("click", function(){ setDrawer(!drawer.classList.contains("open")); });
  if(closeBtn) closeBtn.addEventListener("click", function(){ setDrawer(false); });
  if(overlay) overlay.addEventListener("click", function(){ setDrawer(false); });
  drawer && drawer.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ setDrawer(false); });
  });

  /* Drawer sub-menus (tap) */
  document.querySelectorAll(".sub-toggle").forEach(function(btn){
    btn.addEventListener("click", function(){
      var sub = btn.nextElementSibling;
      if(sub) sub.classList.toggle("open");
      btn.setAttribute("aria-expanded", sub && sub.classList.contains("open") ? "true" : "false");
    });
  });

  /* Desktop dropdowns: click toggles (hover handled in CSS) */
  var dropBtns = document.querySelectorAll(".has-drop > button");
  function closeDrops(){
    document.querySelectorAll(".has-drop.open").forEach(function(x){
      x.classList.remove("open");
      var b = x.querySelector("> button");
      if(b) b.setAttribute("aria-expanded", "false");
    });
  }
  dropBtns.forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var li = btn.parentElement;
      var wasOpen = li.classList.contains("open");
      closeDrops();
      if(!wasOpen){ li.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });
  document.addEventListener("click", closeDrops);
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){ closeDrops(); setDrawer(false); }
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function(item){
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if(!q || !a) return;
    q.addEventListener("click", function(){
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        o.classList.remove("open");
        var oa = o.querySelector(".faq-a");
        if(oa) oa.style.maxHeight = null;
      });
      if(!open){
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* Scroll reveals */
  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, {threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("visible"); });
  }

  /* Animated counters */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if(reduceMotion){ el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function tick(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if("IntersectionObserver" in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCount(en.target); cio.unobserve(en.target); }
      });
    }, {threshold:.5});
    counters.forEach(function(el){ cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* Back to top */
  var topBtn = document.querySelector(".to-top");
  if(topBtn) topBtn.addEventListener("click", function(){
    window.scrollTo({top:0, behavior: reduceMotion ? "auto" : "smooth"});
  });

  /* Active nav highlighting — incl. Solutions parent when a child page is open */
  var page = (location.pathname.split("/").pop() || "index.html").split("?")[0].split("#")[0];
  if(!page) page = "index.html";
  var solutionPages = ["white-label.html","turnkey.html","prop-trading.html","crm.html","liquidity.html","payments.html","launch-services.html"];
  document.querySelectorAll(".main-nav a, .drawer a").forEach(function(a){
    var href = a.getAttribute("href");
    if(href === page){ a.classList.add("active"); }
  });
  if(solutionPages.indexOf(page) !== -1){
    var solBtn = document.querySelector(".has-drop > button");
    if(solBtn) solBtn.classList.add("active");
    var solToggle = document.querySelector(".drawer .sub-toggle");
    if(solToggle) solToggle.classList.add("active");
  }

  /* Contact / quote form: client-side validation, success state, nothing sent */
  var form = document.getElementById("contact-form");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function(f){
        var field = f.closest(".field") || f.parentElement;
        var valid = f.value.trim().length > 0;
        if(f.type === "email" && valid){
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
        }
        if(field) field.classList.toggle("invalid", !valid);
        if(!valid) ok = false;
      });
      if(!ok){
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if(firstBad) firstBad.focus();
        return;
      }
      form.style.display = "none";
      var success = document.getElementById("form-success");
      if(success) success.classList.add("show");
      /* WhatsApp fallback: same message, prefilled */
      var waSend = document.getElementById("wa-send");
      if(waSend){
        var lines = [];
        form.querySelectorAll("input, select, textarea").forEach(function(f){
          if(f.value.trim()) lines.push(f.name + ": " + f.value.trim());
        });
        waSend.href = "https://wa.me/971523222946?text=" + encodeURIComponent("Hi Forex Setup, " + lines.join(" | "));
      }
      if(success) success.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block:"center"});
    });
    form.querySelectorAll("input, select, textarea").forEach(function(f){
      f.addEventListener("input", function(){
        var field = f.closest(".field");
        if(field) field.classList.remove("invalid");
      });
    });
  }
})();

/* ---- Forex Setup tools (client-side only; all demo data labelled) ---- */
(function(){
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = "https://wa.me/971523222946";

  /* 1. Market ticker — simulated demo prices, ticks every 2s, pauses on hover */
  var tickerEl = document.getElementById("ticker");
  if(tickerEl){
    var symbols = [
      {s:"XAUUSD", p:4085.20, d:2, v:0.0006, chg:0},
      {s:"EURUSD", p:1.1582, d:4, v:0.0004, chg:0},
      {s:"GBPUSD", p:1.3125, d:4, v:0.0004, chg:0},
      {s:"BTCUSD", p:103450, d:0, v:0.0012, chg:0},
      {s:"ETHUSD", p:3420, d:0, v:0.0012, chg:0},
      {s:"US30", p:46850, d:0, v:0.0005, chg:0},
      {s:"NAS100", p:25120, d:0, v:0.0005, chg:0}
    ];
    var paused = false;
    function fmt(n, d){ return n.toLocaleString("en-US", {minimumFractionDigits:d, maximumFractionDigits:d}); }
    function renderTicker(){
      var html = symbols.map(function(x){
        var cls = x.chg >= 0 ? "up" : "down";
        var arrow = x.chg >= 0 ? "▲" : "▼";
        return '<span class="ticker-item"><b>' + x.s + '</b> ' + fmt(x.p, x.d) + ' <em class="' + cls + '">' + arrow + ' ' + Math.abs(x.chg).toFixed(2) + '%</em></span>';
      }).join("");
      tickerEl.innerHTML = html + '<span class="ticker-note">Simulated demo prices — not live market data</span>';
    }
    function tick(){
      if(paused) return;
      symbols.forEach(function(x){
        var move = (Math.random() - 0.5) * 2 * x.v;
        x.p = x.p * (1 + move);
        x.chg = move * 100;
      });
      renderTicker();
    }
    renderTicker();
    if(!reduceMotion){ setInterval(tick, 2000); }
    tickerEl.addEventListener("mouseenter", function(){ paused = true; });
    tickerEl.addEventListener("mouseleave", function(){ paused = false; });
  }

  /* 2. Launch quote calculator — estimates only, never fixed prices */
  var EST = {
    platform: {"MT5-type":2000, "MT4-type":1500, "cTrader":1500, "DXtrade":1200, "Match-Trader":900, "TradeLocker":900},
    crm:500, liquidity:1000, prop:1500, website:800, psp:600
  };
  var EST_LABEL = {crm:"Forex CRM", liquidity:"Multi-LP liquidity", prop:"Prop-firm module", website:"Brokerage website", psp:"PSP integration"};
  document.querySelectorAll(".quote-calc").forEach(function(calc){
    var out = calc.querySelector(".calc-result");
    var wa = calc.querySelector(".calc-wa");
    function compute(){
      var sel = calc.querySelector("[data-calc-platform]");
      var low = 0, parts = [], weeks = 2;
      if(sel && sel.value){
        low += EST.platform[sel.value] || 0;
        parts.push("Platform: " + sel.value);
        weeks += 1;
      }
      calc.querySelectorAll("[data-calc-add]").forEach(function(cb){
        if(cb.checked){
          low += EST[cb.value] || 0;
          parts.push(EST_LABEL[cb.value] || cb.value);
          weeks += 1;
        }
      });
      if(low === 0){
        if(out) out.textContent = "Choose a platform to see an estimate.";
        if(wa) wa.style.visibility = "hidden";
        return;
      }
      var high = Math.round(low * 1.6 / 100) * 100;
      var text = "Estimated from $" + low.toLocaleString("en-US") + " – $" + high.toLocaleString("en-US") + " · about " + Math.min(weeks, 4) + " weeks to launch.";
      if(out) out.textContent = text;
      if(wa){
        wa.style.visibility = "visible";
        wa.href = WA + "?text=" + encodeURIComponent("Hi Forex Setup, please quote this launch: " + parts.join(", ") + ". " + text + " (Estimate only — final quote to confirm.)");
      }
    }
    calc.addEventListener("change", compute);
    compute();
  });

  /* 3. Platform comparison — filter + pick 2–3 to compare */
  var PLATFORMS = [
    {name:"MT5-type", best:"Multi-asset brokers", mobile:"Excellent", algo:"EAs (MQL5)", web:"Yes", prop:"Yes"},
    {name:"cTrader", best:"FX & CFD traders", mobile:"Excellent", algo:"cBots (C#)", web:"Yes", prop:"Yes"},
    {name:"DXtrade", best:"Modern web brokers", mobile:"Good", algo:"Limited", web:"Yes", prop:"Yes"},
    {name:"Match-Trader", best:"Mobile-first brokers", mobile:"Excellent", algo:"Limited", web:"Yes", prop:"Yes"},
    {name:"TradeLocker", best:"Retail web traders", mobile:"Good", algo:"Basic", web:"Yes", prop:"Yes"}
  ];
  var compareWrap = document.getElementById("platform-compare");
  if(compareWrap){
    var picked = ["MT5-type", "cTrader"];
    var filter = "all";
    var cardsEl = compareWrap.querySelector(".compare-cards");
    var outEl = document.getElementById("compare-out");
    function matchesFilter(p){
      if(filter === "all") return true;
      if(filter === "mobile") return p.mobile === "Excellent";
      if(filter === "algo") return p.algo.indexOf("Limited") === -1 && p.algo.indexOf("Basic") === -1;
      if(filter === "prop") return p.prop === "Yes";
      return true;
    }
    function renderTable(){
      if(!outEl) return;
      if(picked.length < 2){ outEl.innerHTML = "<p>Pick at least 2 platforms to compare.</p>"; return; }
      var rows = [["Best for", "best"], ["Mobile", "mobile"], ["Algo trading", "algo"], ["Web terminal", "web"], ["Prop-ready", "prop"]];
      var html = '<table class="compare"><tr><th></th>' + picked.map(function(n){ return "<th>" + n + "</th>"; }).join("") + "</tr>";
      rows.forEach(function(r){
        html += "<tr><td><b>" + r[0] + "</b></td>" + picked.map(function(n){
          var p = PLATFORMS.filter(function(x){ return x.name === n; })[0];
          return "<td>" + p[r[1]] + "</td>";
        }).join("") + "</tr>";
      });
      outEl.innerHTML = html + "</table>";
    }
    function renderCards(){
      cardsEl.innerHTML = PLATFORMS.filter(matchesFilter).map(function(p){
        var on = picked.indexOf(p.name) !== -1;
        return '<label class="compare-card' + (on ? " picked" : "") + '"><input type="checkbox" data-platform="' + p.name + '"' + (on ? " checked" : "") + '> <b>' + p.name + '</b><span>' + p.best + '</span></label>';
      }).join("");
      cardsEl.querySelectorAll("input").forEach(function(cb){
        cb.addEventListener("change", function(){
          if(cb.checked){
            if(picked.length >= 3){ cb.checked = false; return; }
            picked.push(cb.getAttribute("data-platform"));
          } else {
            picked = picked.filter(function(n){ return n !== cb.getAttribute("data-platform"); });
          }
          renderCards(); renderTable();
        });
      });
    }
    compareWrap.querySelectorAll("[data-filter]").forEach(function(btn){
      btn.addEventListener("click", function(){
        filter = btn.getAttribute("data-filter");
        compareWrap.querySelectorAll("[data-filter]").forEach(function(b){ b.classList.toggle("active", b === btn); });
        renderCards();
      });
    });
    renderCards(); renderTable();
  }

  /* 4. Interactive 6-step launch stepper */
  var STEPS = [
    {t:"Discovery & planning", d:"We map your model, markets and timeline.", w:"Week 1"},
    {t:"Company & regulatory pathway", d:"Right jurisdiction, structured for banks and PSPs.", w:"Weeks 1–2"},
    {t:"Trading infrastructure", d:"Platform, liquidity and bridge, configured.", w:"Weeks 2–3"},
    {t:"Software deployment", d:"CRM, prop ops and admin — under your brand.", w:"Weeks 2–3"},
    {t:"Integration & QA", d:"Payments, KYC and risk — tested end to end.", w:"Weeks 3–4"},
    {t:"Launch, training & support", d:"Go live together. Support stays 24/7.", w:"Week 4"}
  ];
  document.querySelectorAll(".launch-stepper").forEach(function(stepper){
    var btns = stepper.querySelectorAll(".stepper-btn");
    var detail = stepper.querySelector(".stepper-detail");
    var bar = stepper.querySelector(".stepper-progress i");
    function show(i){
      btns.forEach(function(b, j){ b.classList.toggle("active", j === i); b.setAttribute("aria-selected", j === i ? "true" : "false"); });
      if(detail){
        detail.querySelector("h3").textContent = (i + 1) + ". " + STEPS[i].t;
        detail.querySelector("p").textContent = STEPS[i].d;
        var when = detail.querySelector(".stepper-when");
        if(when) when.textContent = STEPS[i].w;
      }
      if(bar) bar.style.width = (i / (STEPS.length - 1) * 100) + "%";
    }
    btns.forEach(function(b, i){ b.addEventListener("click", function(){ show(i); }); });
    show(0);
  });

  /* 5. Package selector — toggle + highlight, CTAs carry ?package= */
  var pkgWrap = document.getElementById("package-selector");
  if(pkgWrap){
    var cards = pkgWrap.querySelectorAll(".price-card");
    cards.forEach(function(card){
      card.addEventListener("click", function(e){
        if(e.target.closest("a")) return;
        cards.forEach(function(c){ c.classList.remove("selected"); });
        card.classList.add("selected");
      });
    });
    pkgWrap.querySelectorAll(".pkg-toggle button").forEach(function(btn){
      btn.addEventListener("click", function(){
        pkgWrap.querySelectorAll(".pkg-toggle button").forEach(function(b){ b.classList.toggle("active", b === btn); });
        var mode = btn.getAttribute("data-mode");
        pkgWrap.querySelectorAll(".pkg-mode").forEach(function(m){
          m.textContent = mode === "managed" ? "Setup + 12 months managed support" : "One-off setup";
        });
      });
    });
    var pre = new URLSearchParams(location.search).get("package");
    if(pre){
      cards.forEach(function(c){ c.classList.toggle("selected", c.getAttribute("data-package") === pre); });
    }
  }

  /* 6a. Solutions search + filter */
  var solSearch = document.getElementById("solutions-search");
  if(solSearch){
    var solCards = Array.prototype.slice.call(document.querySelectorAll("#solutions-list .card"));
    if(solCards.length === 0) solCards = Array.prototype.slice.call(document.querySelectorAll("main .card"));
    var CAT_MAP = {"Complete setups":"setups", "Platforms & apps":"platforms", "Software & plugins":"software", "Liquidity & infrastructure":"liquidity"};
    function cardCat(card){
      var sec = card.closest("section");
      var eb = sec && sec.querySelector(".eyebrow");
      var key = eb ? eb.textContent.trim() : "";
      return CAT_MAP[key] || (card.getAttribute("data-cat") || "");
    }
    var solCount = document.getElementById("solutions-count");
    var solNone = document.getElementById("solutions-none");
    var cat = "all";
    function applySolFilter(){
      var q = solSearch.value.trim().toLowerCase();
      var shown = 0;
      solCards.forEach(function(card){
        var text = card.textContent.toLowerCase();
        var okQ = !q || text.indexOf(q) !== -1;
        var okC = cat === "all" || cardCat(card) === cat;
        var show = okQ && okC;
        card.style.display = show ? "" : "none";
        if(show) shown++;
      });
      if(solCount) solCount.textContent = shown + " of " + solCards.length + " solutions";
      if(solNone) solNone.style.display = shown === 0 ? "" : "none";
    }
    solSearch.addEventListener("input", applySolFilter);
    document.querySelectorAll("[data-sol-cat]").forEach(function(btn){
      btn.addEventListener("click", function(){
        cat = btn.getAttribute("data-sol-cat");
        document.querySelectorAll("[data-sol-cat]").forEach(function(b){ b.classList.toggle("active", b === btn); });
        applySolFilter();
      });
    });
    applySolFilter();
  }

  /* 6b. FAQ search */
  var faqSearch = document.getElementById("faq-search");
  if(faqSearch){
    var items = Array.prototype.slice.call(document.querySelectorAll(".faq .faq-item"));
    faqSearch.addEventListener("input", function(){
      var q = faqSearch.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function(it){
        var show = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        it.style.display = show ? "" : "none";
        if(show) shown++;
      });
      var none = document.getElementById("faq-none");
      if(none) none.style.display = shown === 0 ? "" : "none";
    });
  }

  /* 6c. Contact prefill from ?package= / ?quote= */
  var params = new URLSearchParams(location.search);
  var PKG_NAMES = {"start-up-accelerator":"Start-Up Accelerator", "growth-catalyst":"Growth Catalyst", "enterprise-institution":"Enterprise Institution"};
  var pkgParam = params.get("package");
  var quoteParam = params.get("quote");
  var banner = document.getElementById("package-note");
  var interest = document.getElementById("f-interest");
  var msg = document.getElementById("f-message");
  if(pkgParam && PKG_NAMES[pkgParam]){
    if(banner){ banner.style.display = ""; banner.querySelector("b").textContent = PKG_NAMES[pkgParam]; }
    if(interest){
      var opt = Array.prototype.slice.call(interest.options).filter(function(o){ return o.value === pkgParam; })[0];
      if(opt) interest.value = pkgParam;
    }
    if(msg && !msg.value) msg.value = "I'm interested in the " + PKG_NAMES[pkgParam] + " package. ";
  }
  if(quoteParam && msg){
    msg.value = decodeURIComponent(quoteParam);
  }
})();
