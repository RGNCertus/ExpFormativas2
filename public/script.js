import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCfvf_BlEnHarMncRuEznpcWU9mQVFv4L0",
    authDomain: "gestionincidenciascertus.firebaseapp.com",
    projectId: "gestionincidenciascertus",
    storageBucket: "gestionincidenciascertus.firebasestorage.app",
    messagingSenderId: "595922279650",
    appId: "1:595922279650:web:674a9721e5ca211bd092bb"
};

document.addEventListener("DOMContentLoaded", function () {
    const emailLoginForm = document.getElementById("emailLoginForm");
    const loginMessage = document.getElementById("loginMessage");
    const emailLoginButton = document.getElementById("emailLoginButton");
    emailLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const correo = document.getElementById("emailInput").value.trim().toLowerCase();
        const contraseña = document.getElementById("passwordInput").value;

        if (!correo.endsWith("@certus.edu.pe")) {
            loginMessage.textContent = "Utiliza un correo institucional de CERTUS.";
            return;
        }
        loginMessage.textContent = "Verificando datos...";
        emailLoginButton.disabled = true;

        signInWithEmailAndPassword(auth, correo, contraseña)
            .then(function (result) {
                const usuario = result.user;
                const correo = usuario.email.toLowerCase();

                if (!correo.endsWith("@certus.edu.pe")) {
                    return signOut(auth).then(function () {
                        throw new Error("Correo institucional no válido.");
                    });
                }

                sessionStorage.setItem("correoCertus", correo);

                sessionStorage.setItem(
                    "nombreCertus",
                    usuario.displayName || correo.split("@")[0]
                );

                window.location.href = "dashboard.html";
            })
            .catch(function (error) {
                console.error("Error de inicio de sesión:", error);
                loginMessage.textContent = "Correo o contraseña incorrectos.";
            })
            .finally(function () {
                emailLoginButton.disabled = false;
            });
    });
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    hd: "certus.edu.pe",
    prompt: "select_account"
});

document.addEventListener("DOMContentLoaded", function () {

    const googleButton = document.getElementById("googleButton");
    const loginMessage = document.getElementById("loginMessage");

    if (googleButton) {

        googleButton.addEventListener("click", function () {

            loginMessage.textContent = "Conectando con Google...";
            googleButton.disabled = true;

            signInWithPopup(auth, provider)

                .then(function (result) {

                    const usuario = result.user;
                    const correo = (usuario.email || "").toLowerCase();

                    if (
                        !correo.endsWith("@certus.edu.pe") ||
                        !usuario.emailVerified
                    ) {

                        loginMessage.textContent =
                            "Acceso denegado. Utiliza una cuenta institucional de CERTUS.";

                        signOut(auth);
                        return;
                    }

                    sessionStorage.setItem("correoCertus", correo);

                    sessionStorage.setItem(
                        "nombreCertus",
                        usuario.displayName || correo.split("@")[0]
                    );

                    window.location.href = "../dashboard.html";

                })

                .catch(function (error) {

                    console.error("Error de autenticación:", error);

                    loginMessage.textContent =
                        "No se pudo iniciar sesión. Intenta nuevamente.";

                })

                .finally(function () {
                    googleButton.disabled = false;
                });

        });
    }
});

// DASHBOARD
document.addEventListener("DOMContentLoaded", function () {

    const chart = document.getElementById("monthlyChart");

    if (chart) {

        onAuthStateChanged(auth, function (usuario) {

            if (!usuario) {
                window.location.href = "index.html";
                return;
            }

            const correo = usuario.email || "";

            if (!correo.toLowerCase().endsWith("@certus.edu.pe")) {
                signOut(auth).then(function () {
                    window.location.href = "index.html";
                });
                return;
            }

            document.getElementById("userEmail").textContent = correo;

            const nombre = usuario.displayName || correo.split("@")[0];

            document.getElementById("userName").textContent = nombre;

            document.querySelector(".user-avatar").textContent =
                nombre.charAt(0).toUpperCase();

            const fecha = new Date();

            document.getElementById("currentDate").textContent =
                fecha.toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

        });

        pintarDashboard();
        window.addEventListener("storage", function (e) {
        if (e.key === "incidencias") pintarDashboard();
        });

        const logoutButton = document.getElementById("logoutButton");

        logoutButton.addEventListener("click", function () {

            signOut(auth).then(function () {
                window.location.href = "index.html";
            });

        });

        const userButton = document.getElementById("userButton");
        const userMenu = document.getElementById("userMenu");

        userButton.addEventListener("click", function () {
            userMenu.classList.toggle("hidden");
        });

        document.querySelectorAll(".module-link").forEach(function (link) {

            link.addEventListener("click", function (event) {

                event.preventDefault();

                mostrarAviso(
                    "La sección " + link.dataset.module +
                    " será desarrollada por el equipo."
                );

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
function leerIncidencias() {
    try {
        const a = JSON.parse(localStorage.getItem("incidencias") || "[]");
        return Array.isArray(a) ? a : [];
    } catch (e) {
        return [];
    }
}

function pintarDashboard() {
    const incidencias = leerIncidencias();

    // Mismos consultores base que usan los reportes
    const base = ["Consultor 01", "Consultor 02", "Consultor 03", "Consultor 04", "Consultor 05"];
    const nombres = [...new Set(base.concat(incidencias.map(function (x) { return x.consultor; })).filter(Boolean))];

    // Agrupar por consultor
    const porConsultor = {};
    nombres.forEach(function (n) { porConsultor[n] = []; });
    incidencias.forEach(function (x) { if (x.consultor) porConsultor[x.consultor].push(x); });

    const sinResolver = function (x) { return x.estado !== "Resuelto"; };

    // ----- Tarjetas -----
    const alertas = incidencias.filter(sinResolver).length;
    const retrasos = incidencias.filter(function (x) { return x.tipo === "Entrega fuera de plazo"; }).length;
    const enSeguimiento = nombres.filter(function (n) { return porConsultor[n].some(sinResolver); }).length;
    const conPendientes = nombres.filter(function (n) {
        return porConsultor[n].some(function (x) { return x.estado === "Pendiente"; });
    }).length;
    const total = nombres.length;

    document.getElementById("statAlertas").textContent = alertas;
    document.getElementById("statEnSeguimiento").textContent = enSeguimiento;
    document.getElementById("statRetrasos").textContent = retrasos;
    document.getElementById("statTotalConsultores").textContent = total;

    // ----- Estado de seguimiento -----
    const pct = function (v) { return total ? Math.round(v / total * 100) : 0; };
    const sinAlertas = total - enSeguimiento;
    document.getElementById("progressEnSeguimientoVal").textContent = enSeguimiento;
    document.getElementById("progressSinAlertasVal").textContent = sinAlertas;
    document.getElementById("progressPendientesVal").textContent = conPendientes;
    document.getElementById("progressEnSeguimientoBar").style.width = pct(enSeguimiento) + "%";
    document.getElementById("progressSinAlertasBar").style.width = pct(sinAlertas) + "%";
    document.getElementById("progressPendientesBar").style.width = pct(conPendientes) + "%";

    // ----- Gráfico por mes (2026) -----
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const conteo = new Array(12).fill(0);
    incidencias.forEach(function (x) {
        const partes = String(x.fecha || "").split("-"); // "AAAA-MM-DD"
        if (partes[0] === "2026") conteo[parseInt(partes[1], 10) - 1]++;
    });
    const maximo = Math.max.apply(null, conteo.concat(1));
    const chart = document.getElementById("monthlyChart");
    chart.replaceChildren();
    conteo.forEach(function (valor, i) {
        const columna = document.createElement("div");
        columna.className = "chart-column";

        const etiqueta = document.createElement("span");
        etiqueta.className = "chart-value";
        etiqueta.textContent = valor;

        const barra = document.createElement("div");
        barra.className = "chart-bar";
        barra.style.height = (valor / maximo * 78) + "%";
        barra.title = valor + " incidencias";

        const mes = document.createElement("span");
        mes.className = "chart-month";
        mes.textContent = meses[i];

        columna.append(etiqueta, barra, mes);
        chart.appendChild(columna);
    });

    // ----- Top 5 consultores críticos -----
    const tbody = document.getElementById("topConsultoresTable");
    tbody.replaceChildren();
    const top = nombres
        .map(function (n) {
            const items = porConsultor[n];
            return {
                nombre: n,
                total: items.length,
                pendientes: items.filter(function (x) { return x.estado === "Pendiente"; }).length,
                correccion: items.filter(function (x) { return x.estado === "En corrección"; }).length
            };
        })
        .filter(function (c) { return c.total > 0; })
        .sort(function (a, b) { return b.total - a.total || a.nombre.localeCompare(b.nombre); })
        .slice(0, 5);

    if (top.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 3;
        td.style.textAlign = "center";
        td.className = "muted";
        td.textContent = "No hay registros aún";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    top.forEach(function (c) {
        const tr = document.createElement("tr");
        const tdN = document.createElement("td"); tdN.textContent = c.nombre;
        const tdI = document.createElement("td"); tdI.textContent = c.total;
        const tdE = document.createElement("td");
        const badge = document.createElement("span");
        if (c.pendientes > 0) {
            badge.className = "status status-danger"; badge.textContent = "Crítico";
        } else if (c.correccion > 0) {
            badge.className = "status status-warning"; badge.textContent = "En seguimiento";
        } else {
            badge.className = "status status-info"; badge.textContent = "Al día";
        }
        tdE.appendChild(badge);
        tr.append(tdN, tdI, tdE);
        tbody.appendChild(tr);
    });
}