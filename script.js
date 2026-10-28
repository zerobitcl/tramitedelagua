const WHATSAPP_NUMBER = "56900000000"; // Reemplace por su número real (ej: 56912345678)

(function () {
  "use strict";

  var form = document.getElementById("wa-form");
  var formCard = document.getElementById("form-card");
  var formError = document.getElementById("form-error");
  var tramiteSelect = document.getElementById("tramite");
  var yearEl = document.getElementById("year");
  var floatWa = document.getElementById("float-wa");

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
      goToForm(btn.getAttribute("data-tramite"));
    });
  });

  if (floatWa) {
    floatWa.addEventListener("click", function (e) {
      e.preventDefault();
      goToForm(null);
    });
  }
})();
