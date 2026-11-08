document.addEventListener("DOMContentLoaded", function () {
  const CLAVE = "incidencias";
  const campos = ["consultor", "fecha", "estado", "entregable", "tipo", "descripcion"];
  const form = document.getElementById("incidenciaForm");

  // ----- Barra superior (usuario, menú y fecha) -----
  const correo = sessionStorage.getItem("correoCertus") || "usuario@certus.edu.pe";
  document.getElementById("userEmail").textContent = correo;
  document.getElementById("userName").textContent = correo.split("@")[0];
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("es-PE", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });

  document.getElementById("userButton").addEventListener("click", function () {
    document.getElementById("userMenu").classList.toggle("hidden");
  });

  document.getElementById("logoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("correoCertus");
    window.location.href = "index.html";
  });

  document.getElementById("menuToggle").addEventListener("click", function () {
    document.getElementById("mainNav").classList.toggle("open");
  });

  document.querySelectorAll(".module-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      mostrarAviso("La sección " + link.dataset.module + " será desarrollada por el equipo.");
    });
  });

  // ----- Formulario -----
  function fijarFechaHoy() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    document.getElementById("fecha").value = hoy.getFullYear() + "-" + mes + "-" + dia;
  }

  function leerIncidencias() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch (e) {
      return [];
    }
  }

  function marcar(campo, mensaje) {
    const contenedor = campo.closest(".field");
    contenedor.classList.toggle("invalid", Boolean(mensaje));
    contenedor.querySelector(".form-message").textContent = mensaje || "";
  }

  function validar() {
    let valido = true;
    campos.forEach(function (id) {
      const campo = document.getElementById(id);
      const vacio = campo.value.trim() === "";
      marcar(campo, vacio ? "Este campo es obligatorio." : "");
      if (vacio) valido = false;
    });
    return valido;
  }

  function limpiar() {
    form.reset();
    fijarFechaHoy();
    campos.forEach(function (id) {
      marcar(document.getElementById(id), "");
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validar()) return;

    const incidencias = leerIncidencias();
    const nueva = { id: Date.now() };
    campos.forEach(function (id) {
      nueva[id] = document.getElementById(id).value.trim();
    });
    incidencias.push(nueva);
    localStorage.setItem(CLAVE, JSON.stringify(incidencias));

    limpiar();
    mostrarAviso("Incidencia registrada correctamente.");
  });

  document.getElementById("limpiarBtn").addEventListener("click", limpiar);

  campos.forEach(function (id) {
    document.getElementById(id).addEventListener("input", function (e) {
      marcar(e.target, "");
    });
  });

  fijarFechaHoy();
});