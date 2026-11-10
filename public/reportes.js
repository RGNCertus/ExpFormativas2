document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const individual = location.pathname.endsWith("reporte-consultor.html");

    const correo = sessionStorage.getItem("correoCertus") || "usuario@certus.edu.pe";
    const nombre = sessionStorage.getItem("nombreCertus") || correo.split("@")[0];

    $("userEmail").textContent = correo;
    $("userName").textContent = nombre;

    document.querySelector(".user-avatar").textContent =
        nombre.charAt(0).toUpperCase();

    $("currentDate").textContent = new Date().toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    $("userButton").addEventListener("click", () => {
        $("userMenu").classList.toggle("hidden");
    });

    $("logoutButton").addEventListener("click", () => {
        sessionStorage.removeItem("correoCertus");
        location.href = "index.html";
    });

    $("menuToggle").addEventListener("click", () => {
        $("mainNav").classList.toggle("open");
    });

    const obtener = () => {
        try {
            const a = JSON.parse(localStorage.getItem("incidencias") || "[]");
            return Array.isArray(a) ? a : [];
        } catch {
            return [];
        }
    };

    let datos = obtener();

    const CLAVE_CONSULTORES = "consultores";
    const CONSULTORES_BASE = [
        "Consultor 01", "Consultor 02", "Consultor 03",
        "Consultor 04", "Consultor 05"
    ];

    function obtenerConsultores() {
        let guardados = [];
        try {
            const valor = JSON.parse(localStorage.getItem(CLAVE_CONSULTORES) || "[]");
            if (Array.isArray(valor)) guardados = valor;
        } catch (_) {}

        const mapa = new Map();
        [...CONSULTORES_BASE, ...guardados.map(c => c.nombre), ...datos.map(x => x.consultor)]
            .filter(Boolean)
            .forEach(nombre => {
                const previo = guardados.find(c => c.nombre === nombre);
                mapa.set(nombre, {
                    nombre,
                    estado: previo && ["Activo", "Inactivo", "Ocupado"].includes(previo.estado)
                        ? previo.estado : "Activo"
                });
            });
        return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }

    let consultores = obtenerConsultores();

    function guardarConsultores() {
        localStorage.setItem(CLAVE_CONSULTORES, JSON.stringify(consultores));
    }

    function pintarConsultores() {
        const body = $("tablaConsultores");
        if (!body) return;
        const busqueda = texto($("buscarConsultor")?.value).trim().toLocaleLowerCase();
        const lista = consultores.filter(c => c.nombre.toLocaleLowerCase().includes(busqueda));
        body.replaceChildren();

        lista.forEach(c => {
            const incidenciasConsultor = datos.filter(x => x.consultor === c.nombre);
            const pendientesConsultor = incidenciasConsultor.filter(x => x.estado === "Pendiente").length;
            const ultima = incidenciasConsultor
                .map(x => x.fecha)
                .filter(Boolean)
                .sort()
                .pop();

            const tr = document.createElement("tr");
            const nombreTd = celda(tr, c.nombre);
            nombreTd.classList.add("consultant-name");
            celda(tr, c.estado);
            const estadoTd = tr.children[1];
            const badge = document.createElement("span");
            badge.className = "status " + (
                c.estado === "Activo" ? "status-info" :
                c.estado === "Ocupado" ? "status-warning" : "status-danger"
            );
            badge.textContent = c.estado;
            estadoTd.replaceChildren(badge);

            celda(tr, incidenciasConsultor.length);
            celda(tr, pendientesConsultor);
            celda(tr, ultima ? fecha(ultima) : "—");

            const acciones = document.createElement("td");
            const select = document.createElement("select");
            select.className = "consultant-status-select";
            select.setAttribute("aria-label", "Cambiar estado de " + c.nombre);
            ["Activo", "Inactivo", "Ocupado"].forEach(estado => {
                const option = document.createElement("option");
                option.value = estado;
                option.textContent = estado;
                option.selected = estado === c.estado;
                select.append(option);
            });
            select.addEventListener("change", () => {
                c.estado = select.value;
                guardarConsultores();
                pintarConsultores();
                mostrarAviso("Estado de " + c.nombre + " actualizado.");
            });
            acciones.append(select);
            tr.append(acciones);
            body.append(tr);
        });

        $("sinConsultores").hidden = lista.length > 0;
        $("sinConsultores").textContent = busqueda
            ? "No se encontraron consultores con ese nombre."
            : "No hay consultores registrados.";
    }

    function mostrarAviso(mensaje) {
        const toast = $("toast");
        if (!toast) return;
        toast.textContent = mensaje;
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 2500);
    }

    $("buscarConsultor")?.addEventListener("input", pintarConsultores);
    $("agregarConsultor")?.addEventListener("click", () => {
        const campo = $("nuevoConsultor");
        const nombreNuevo = campo.value.trim().replace(/\\s+/g, " ");
        if (!nombreNuevo) {
            mostrarAviso("Escribe el nombre del consultor.");
            campo.focus();
            return;
        }
        if (consultores.some(c => c.nombre.toLocaleLowerCase() === nombreNuevo.toLocaleLowerCase())) {
            mostrarAviso("Ese consultor ya está registrado.");
            campo.focus();
            return;
        }
        consultores.push({ nombre: nombreNuevo, estado: "Activo" });
        consultores.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        guardarConsultores();
        const filtro = $("consultorFiltro");
        if (filtro && ![...filtro.options].some(o => o.value === nombreNuevo)) {
            const opcion = document.createElement("option");
            opcion.value = nombreNuevo;
            opcion.textContent = nombreNuevo;
            filtro.append(opcion);
        }
        campo.value = "";
        pintarConsultores();
        mostrarAviso("Consultor agregado correctamente.");
    });
    $("nuevoConsultor")?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            $("agregarConsultor").click();
        }
    });
    function eliminar(ids, mensaje){
  if(!confirm(mensaje))return;
  const quitar=new Set(ids);
  datos=obtener().filter(x=>!quitar.has(x.id));
  localStorage.setItem("incidencias",JSON.stringify(datos));
  pintar();
}
function botonEliminar(ids,mensaje){
  const td=document.createElement("td");
  const b=document.createElement("button");
  b.type="button";b.className="btn-eliminar";b.textContent="🗑️";
  b.title="Eliminar";b.setAttribute("aria-label","Eliminar");
  b.addEventListener("click",()=>eliminar(ids,mensaje));
  td.append(b);return td;
} 

    if (individual) {
        consultores.forEach(c => {
            const o = document.createElement("option");
            o.value = c.nombre;
            o.textContent = c.nombre;
            $("consultorFiltro").append(o);
        });
    }

    const filtros = individual
        ? ["consultorFiltro", "estadoFiltro", "desde", "hasta"]
        : ["buscar", "desde", "hasta"];

    const texto = x => String(x ?? "");

    const fecha = x => {
        if (!x) return "—";

        const [y, m, d] = x.split("-");

        return y && m && d
            ? `${d}/${m}/${y}`
            : x;
    };

    const csvCell = v => '"' + texto(v).replace(/"/g, '""') + '"';

    let exportRows = [];

    function filtrar() {
        return datos.filter(x => {
            if (individual && $("consultorFiltro").value && x.consultor !== $("consultorFiltro").value) {
                return false;
            }

            if (individual && $("estadoFiltro").value && x.estado !== $("estadoFiltro").value) {
                return false;
            }

            if (!individual && $("buscar").value && !texto(x.consultor).toLocaleLowerCase().includes($("buscar").value.trim().toLocaleLowerCase())) {
                return false;
            }

            if ($("desde").value && x.fecha < $("desde").value) {
                return false;
            }

            if ($("hasta").value && x.fecha > $("hasta").value) {
                return false;
            }

            return true;
        });
    }

    function celda(tr, value) {
        const td = document.createElement("td");
        td.textContent = texto(value);
        tr.append(td);

        return td;
    }

    function pintar() {
        const filas = filtrar();
        const body = $("tablaReporte");

        body.replaceChildren();

        $("total").textContent = filas.length;

        $("pendientes").textContent = filas.filter(x => x.estado === "Pendiente").length;

        $("correccion").textContent = filas.filter(x => x.estado === "En corrección").length;

        $("resueltas").textContent = filas.filter(x => x.estado === "Resuelto").length;

        if (individual) {
            exportRows = [
                ["Fecha", "Consultor", "Entregable", "Tipo", "Descripción", "Estado"]
            ];

            [...filas]
                .sort((a, b) => texto(b.fecha).localeCompare(texto(a.fecha)))
                .forEach(x => {
                    const tr = document.createElement("tr");

                    [
                        fecha(x.fecha),
                        x.consultor,
                        x.entregable,
                        x.tipo,
                        x.descripcion
                    ].forEach(v => celda(tr, v));

                    const td = celda(tr, x.estado);
                    const badge = document.createElement("span");

                    badge.className = "status " + (
                        x.estado === "Resuelto"
                            ? "status-info"
                            : x.estado === "Pendiente"
                                ? "status-danger"
                                : "status-warning"
                    );

                    badge.textContent = texto(x.estado);

                    td.replaceChildren(badge);
                    tr.append(botonEliminar([x.id],"¿Eliminar esta incidencia?"));  
                    body.append(tr);

                    exportRows.push([
                        fecha(x.fecha),
                        x.consultor,
                        x.entregable,
                        x.tipo,
                        x.descripcion,
                        x.estado
                    ]);
                });
        } else {
            const grupos = new Map();

            filas.forEach(x => {
                const n = x.consultor || "Sin consultor";

                if (!grupos.has(n)) {
                    grupos.set(n, []);
                }

                grupos.get(n).push(x);
            });

            exportRows = [
                ["Consultor", "Total", "Pendientes", "En corrección", "Resueltas", "Porcentaje de resolución"]
            ];

            [...grupos]
                .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
                .forEach(([n, items]) => {
                    const p = items.filter(x => x.estado === "Pendiente").length;
                    const c = items.filter(x => x.estado === "En corrección").length;
                    const r = items.filter(x => x.estado === "Resuelto").length;

                    const row = [
                        n,
                        items.length,
                        p,
                        c,
                        r,
                        Math.round(r / items.length * 100) + "%"
                    ];

                    const tr=document.createElement("tr");row.forEach(v=>celda(tr,v));
                    tr.append(botonEliminar(items.map(x=>x.id),`¿Eliminar las ${items.length} incidencia(s) de ${n}?`));
                    body.append(tr);exportRows.push(row);
                });
        }

        $("sinDatos").hidden = filas.length > 0;

        $("resultadoInfo").textContent = individual
            ? `${filas.length} incidencia(s) encontrada(s)`
            : `${exportRows.length - 1} consultor(es) con incidencias · ${filas.length} registro(s)`;

        if (individual) pintarConsultores();
    }

    filtros.forEach(id => {
        $(id).addEventListener(id === "buscar" ? "input" : "change", pintar);
    });

    $("limpiarFiltros").addEventListener("click", () => {
        filtros.forEach(id => {
            $(id).value = "";
        });

        pintar();
    });

    $("exportar").addEventListener("click", () => {
        const csv = "\uFEFF" + exportRows
            .map(r => r.map(csvCell).join(";"))
            .join("\r\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = individual
            ? "reporte_por_consultor.csv"
            : "reporte_consolidado.csv";

        document.body.append(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    window.addEventListener("storage", event => {
        if (event.key === "incidencias" || event.key === CLAVE_CONSULTORES) {
            location.reload();
        }
    });

    pintar();
});
