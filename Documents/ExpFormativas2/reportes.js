document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const individual = location.pathname.endsWith("reporte-consultor.html");
    const correo = sessionStorage.getItem("correoCertus") || "usuario@certus.edu.pe";

    $("userEmail").textContent = correo;
    $("userName").textContent = correo.split("@")[0];
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

    const datos = obtener();

    if (individual) {
        const nombres = [...new Set([
            "Consultor 01",
            "Consultor 02",
            "Consultor 03",
            "Consultor 04",
            "Consultor 05",
            ...datos.map(x => x.consultor)
        ].filter(Boolean))].sort();

        nombres.forEach(n => {
            const o = document.createElement("option");
            o.value = n;
            o.textContent = n;
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
        return y && m && d ? `${d}/${m}/${y}` : x;
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

                    const tr = document.createElement("tr");

                    row.forEach(v => celda(tr, v));
                    body.append(tr);
                    exportRows.push(row);
                });
        }

        $("sinDatos").hidden = filas.length > 0;

        $("resultadoInfo").textContent = individual
            ? `${filas.length} incidencia(s) encontrada(s)`
            : `${exportRows.length - 1} consultor(es) con incidencias · ${filas.length} registro(s)`;
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
        if (event.key === "incidencias") {
            location.reload();
        }
    });

    pintar();
});