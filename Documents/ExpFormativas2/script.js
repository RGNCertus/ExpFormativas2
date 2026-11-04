document.addEventListener("DOMContentLoaded", function () {
  // INICIO DE SESIÓN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const correoInput = document.getElementById("correo");
    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const correo = correoInput.value.trim().toLowerCase();

      if (!correo) {
        loginMessage.textContent = "Ingresa tu correo institucional.";
        return;
      }

      if (!correo.endsWith("@certus.edu.pe")) {
        loginMessage.textContent = "Utiliza tu correo institucional @certus.edu.pe.";
        return;
      }

      sessionStorage.setItem("correoCertus", correo);
      window.location.href = "dashboard.html";
    });

    const googleButton = document.getElementById("googleButton");
    googleButton.addEventListener("click", function () {
      loginMessage.textContent = "La autenticación real con Google se habilitará al integrar el servicio institucional.";
      correoInput.focus();
    });

    document.getElementById("supportLink").addEventListener("click", function (event) {
      event.preventDefault();
      loginMessage.textContent = "Solicita ayuda al área de Soporte Técnico de CERTUS.";
    });
  }

  // DASHBOARD
  const chart = document.getElementById("monthlyChart");

  if (chart) {
    const datos = [
      { mes: "Ene", valor: 21 }, { mes: "Feb", valor: 18 },
      { mes: "Mar", valor: 30 }, { mes: "Abr", valor: 25 },
      { mes: "May", valor: 20 }, { mes: "Jun", valor: 19 },
      { mes: "Jul", valor: 22 }, { mes: "Ago", valor: 16 },
      { mes: "Sep", valor: 16 }, { mes: "Oct", valor: 17 }
    ];

    datos.forEach(function (dato) {
      const columna = document.createElement("div");
      columna.className = "chart-column";

      const valor = document.createElement("span");
      valor.className = "chart-value";
      valor.textContent = dato.valor;

      const barra = document.createElement("div");
      barra.className = "chart-bar";
      barra.style.height = (dato.valor / 30 * 78) + "%";
      barra.title = dato.valor + " incidencias";

      const mes = document.createElement("span");
      mes.className = "chart-month";
      mes.textContent = dato.mes;

      columna.appendChild(valor);
      columna.appendChild(barra);
      columna.appendChild(mes);
      chart.appendChild(columna);
    });

    const correo = sessionStorage.getItem("correoCertus") || "usuario@certus.edu.pe";
    const userEmail = document.getElementById("userEmail");
    const userName = document.getElementById("userName");

    userEmail.textContent = correo;
    userName.textContent = correo.split("@")[0];

    const fecha = new Date();
    document.getElementById("currentDate").textContent =
      fecha.toLocaleDateString("es-PE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });

    const userButton = document.getElementById("userButton");
    const userMenu = document.getElementById("userMenu");

    userButton.addEventListener("click", function () {
      userMenu.classList.toggle("hidden");
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
      sessionStorage.removeItem("correoCertus");
      window.location.href = "index.html";
    });

    document.querySelectorAll(".module-link").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        mostrarAviso("La sección " + link.dataset.module + " será desarrollada por el equipo.");
      });
    });

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    menuToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }
});

function mostrarAviso(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensaje;
  toast.classList.add("show");

  window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}
