const WHATSAPP_NUMBER = "56900000000"; // Reemplace por su número real (ej: 56912345678)
const PHONE_NUMBER = "+56900000000"; // Teléfono visible / tel: (mismo número con +)

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

  function formatPhoneDisplay(phone) {
    var digits = String(phone).replace(/\D/g, "");
    if (digits.length === 11 && digits.indexOf("56") === 0) {
      return "+56 " + digits.slice(2, 3) + " " + digits.slice(3, 7) + " " + digits.slice(7);
    }
    return phone;
  }

  function syncPhoneLinks() {
    var href = "tel:" + PHONE_NUMBER.replace(/\s/g, "");
    var label = formatPhoneDisplay(PHONE_NUMBER);
    document.querySelectorAll("[data-phone-link]").forEach(function (el) {
      el.setAttribute("href", href);
      var textTarget = el.querySelector("[data-phone-text]");
      if (textTarget) {
        textTarget.textContent = label;
      } else if (el.hasAttribute("data-phone-full")) {
        el.textContent = "📞 ¿Prefiere llamar? " + label;
      }
    });
  }

  syncPhoneLinks();

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
      "Hola, necesito asesoría con un trámite de aguas.\n\n" +
      "*Nombre:* " + data.nombre + "\n" +
      "*Comuna/Sector:* " + data.ubicacion + "\n" +
      "*Trámite:* " + data.tramite + "\n" +
      "*Situación actual:* " + data.situacion + "\n\n" +
      "Quedo atento(a) para revisar mi caso."
    );
  }

  function openWhatsApp(message) {
    var url =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(message);
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
      trackConversion("generate_lead_whatsapp", payload);
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

  document.querySelectorAll("[data-phone-link]").forEach(function (el) {
    el.addEventListener("click", function () {
      trackConversion("click_phone_call", {
        pagina_origen: window.location.pathname
      });
    });
  });

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
