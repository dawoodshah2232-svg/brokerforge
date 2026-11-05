/* BrokerForge — shared behaviour. No external JS. */
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
  function setDrawer(open){
    if(!drawer) return;
    drawer.classList.toggle("open", open);
    if(overlay) overlay.classList.toggle("show", open);
    if(toggle){ toggle.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); }
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
  document.querySelectorAll(".has-drop > button").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var li = btn.parentElement;
      var wasOpen = li.classList.contains("open");
      document.querySelectorAll(".has-drop.open").forEach(function(x){ x.classList.remove("open"); });
      if(!wasOpen) li.classList.add("open");
    });
  });
  document.addEventListener("click", function(){
    document.querySelectorAll(".has-drop.open").forEach(function(x){ x.classList.remove("open"); });
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

  /* Active nav highlighting */
  var page = (location.pathname.split("/").pop() || "index.html").split("?")[0].split("#")[0];
  if(!page) page = "index.html";
  document.querySelectorAll(".main-nav a, .drawer a").forEach(function(a){
    var href = a.getAttribute("href");
    if(href === page){ a.classList.add("active"); }
  });

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
