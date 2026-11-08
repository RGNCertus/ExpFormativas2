import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    hd: "certus.edu.pe"
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
                    sessionStorage.setItem("nombreCertus", usuario.displayName);

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

            if (
                !correo.toLowerCase().endsWith("@certus.edu.pe") ||
                !usuario.emailVerified
            ) {
                signOut(auth).then(function () {
                    window.location.href = "index.html";
                });
                return;
            }

            document.getElementById("userEmail").textContent = correo;

            document.getElementById("userName").textContent =
                usuario.displayName || correo.split("@")[0];

            const fecha = new Date();

            document.getElementById("currentDate").textContent =
                fecha.toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });

        });

        const datos = [
            { mes: "Ene", valor: 21 },
            { mes: "Feb", valor: 18 },
            { mes: "Mar", valor: 30 },
            { mes: "Abr", valor: 25 },
            { mes: "May", valor: 20 },
            { mes: "Jun", valor: 19 },
            { mes: "Jul", valor: 22 },
            { mes: "Ago", valor: 16 },
            { mes: "Sep", valor: 16 },
            { mes: "Oct", valor: 17 }
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