/*
 * Medición GA4 (G-WY301LWY4E). No cambiar el ID de medición.
 * Instrucción operativa: en Google Analytics 4 (GA4 → Administrador → Eventos),
 * marcar generate_lead, click_whatsapp y phone_click como Eventos clave (Key Events).
 * form_submit se despacha junto con generate_lead en el envío del formulario.
 */
const WHATSAPP_NUMBER = "56900000000"; // Solo se usa tras enviar el formulario (no se muestra en el sitio)

(function () {
  "use strict";

  var form = document.getElementById("wa-form");
  var formCard = document.getElementById("form-card");
  var formError = document.getElementById("form-error");
  var tramiteSelect = document.getElementById("tramite");
  var yearEl = document.getElementById("year");
  var floatWa = document.getElementById("float-wa");
  var privacyDialog = document.getElementById("privacy-dialog");
  var openPrivacy = document.getElementById("open-privacy");
  var closePrivacy = document.getElementById("close-privacy");

  window.dataLayer = window.dataLayer || [];

  function trackConversion(eventName, payload) {
    var data = Object.assign({ event: eventName }, payload || {});
    window.dataLayer.push(data);
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload || {});
    }
  }

  function isWhatsAppUrl(href) {
    if (!href) return false;
    return /wa\.me|api\.whatsapp\.com/i.test(href);
  }

  function isTelUrl(href) {
    if (!href) return false;
    return /^tel:/i.test(href);
  }

  // Key events: click_whatsapp / phone_click en cualquier enlace del DOM
  document.addEventListener(
    "click",
    function (e) {
      var link = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (isWhatsAppUrl(href)) {
        trackConversion("click_whatsapp", {
          link_url: href,
          pagina_origen: window.location.pathname
        });
      } else if (isTelUrl(href)) {
        trackConversion("phone_click", {
          link_url: href,
          pagina_origen: window.location.pathname
        });
      }
    },
    true
  );

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function clearErrors() {
    if (!form) return;
    form.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
    });
    if (formError) formError.hidden = true;
  }

  function validate() {
    if (!form) return false;
    var ok = true;
    clearErrors();
    ["nombre", "ubicacion", "tramite", "situacion"].forEach(function (id) {
      var el = form.elements[id];
      var val = el && String(el.value || "").trim();
      if (!val) {
        if (el) el.classList.add("invalid");
        ok = false;
      }
    });
    if (!ok && formError) formError.hidden = false;
    return ok;
  }

  function buildMessage(data) {
    return (
      "Hola, necesito el trámite obligatorio CPA/CBR (regularización, perfeccionamiento o inscripción de derechos de aguas).\n\n" +
      "*Nombre:* " + data.nombre + "\n" +
      "*Comuna/Sector:* " + data.ubicacion + "\n" +
      "*Tipo según título:* " + data.tramite + "\n" +
      "*Situación actual:* " + data.situacion + "\n\n" +
      "Quedo atento(a) para diagnosticar mi caso."
    );
  }

  function openWhatsApp(message) {
    var url =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);
    trackConversion("click_whatsapp", {
      link_url: url.split("?")[0],
      metodo: "form_redirect",
      pagina_origen: window.location.pathname
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var first = form.querySelector(".invalid");
        if (first) first.focus();
        return;
      }
      var payload = {
        comuna: form.ubicacion.value.trim(),
        tramite: form.tramite.value,
        situacion: form.situacion.value,
        pagina_origen: window.location.pathname
      };
      // Key events de conversión (marcarlos en GA4 → Admin → Eventos clave)
      trackConversion("generate_lead", payload);
      trackConversion("form_submit", payload);
      openWhatsApp(
        buildMessage({
          nombre: form.nombre.value.trim(),
          ubicacion: form.ubicacion.value.trim(),
          tramite: form.tramite.value,
          situacion: form.situacion.value
        })
      );
    });

    form.querySelectorAll("input, select").forEach(function (field) {
      field.addEventListener("input", clearErrors);
      field.addEventListener("change", clearErrors);
    });
  }

  function glowForm() {
    if (!formCard) return;
    formCard.classList.add("is-glow");
    window.setTimeout(function () {
      formCard.classList.remove("is-glow");
    }, 1000);
  }

  function goToForm(tramiteValue) {
    var target = document.getElementById("cotizador");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (tramiteSelect && tramiteValue) {
      var exists = Array.prototype.some.call(tramiteSelect.options, function (o) {
        return o.value === tramiteValue;
      });
      if (exists) tramiteSelect.value = tramiteValue;
    }

    glowForm();

    window.setTimeout(function () {
      if (tramiteValue && tramiteSelect) {
        tramiteSelect.focus({ preventScroll: true });
      } else {
        var nombre = document.getElementById("nombre");
        if (nombre) nombre.focus({ preventScroll: true });
      }
    }, 400);
  }

  document.querySelectorAll(".service-pick").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var servicio = btn.getAttribute("data-tramite") || "";
      trackConversion("select_water_service", {
        servicio_seleccionado: servicio
      });
      goToForm(servicio);
    });
  });

  if (floatWa) {
    floatWa.addEventListener("click", function (e) {
      e.preventDefault();
      goToForm(null);
    });
  }

  if (privacyDialog) {
    if (openPrivacy) {
      openPrivacy.addEventListener("click", function (e) {
        e.preventDefault();
        if (typeof privacyDialog.showModal === "function") {
          privacyDialog.showModal();
        } else {
          privacyDialog.setAttribute("open", "");
        }
      });
    }
    if (closePrivacy) {
      closePrivacy.addEventListener("click", function () {
        if (typeof privacyDialog.close === "function") {
          privacyDialog.close();
        } else {
          privacyDialog.removeAttribute("open");
        }
      });
    }
    privacyDialog.addEventListener("click", function (e) {
      if (e.target === privacyDialog) {
        if (typeof privacyDialog.close === "function") privacyDialog.close();
      }
    });
  }
})();
