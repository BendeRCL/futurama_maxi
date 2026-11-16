// En producción (Render) o servido desde Express usamos la ruta relativa "/api/personajes".
// Si se corre desde Live Server (puertos 5500-5502) se apunta a http://localhost:3000/api/personajes.
const URL_API_POSTGRES = (window.location.protocol === "http:" && ["5500", "5501", "5502"].includes(window.location.port))
    ? "http://localhost:3000/api/personajes"
    : "/api/personajes";
const LOCAL_JSON_BACKUP = "json/personajes.json";

// Elementos del DOM
const contenedorPersonajes = document.getElementById("contenedorPersonajes");
const charactersMessage = document.getElementById("charactersMessage");
const apiDot = document.getElementById("apiDot");
const apiStatusText = document.getElementById("apiStatusText");
const totalBadge = document.getElementById("totalBadge");

const filterName = document.getElementById("filterName");
const filterOccupation = document.getElementById("filterOccupation");
const filterSpecies = document.getElementById("filterSpecies");
const clearFiltersBtn = document.getElementById("clearFilters");
const reloadBtn = document.getElementById("btnReload");

let personajesBase = [];


function normalizarTexto(texto = "") {
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerValor(obj, keys) {
    for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
            return obj[key];
        }
    }
    return "";
}


function poblarFiltros(lista) {
    const ocupaciones = [
        ...new Set(
            lista
                .map((p) => obtenerValor(p, ["ocupacion", "Ocupacion"]))
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "es"));

    const especies = [
        ...new Set(
            lista
                .map((p) => obtenerValor(p, ["especie", "Especie"]))
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b, "es"));

    if (filterOccupation) {
        filterOccupation.innerHTML = '<option value="">Todas las ocupaciones</option>';
        ocupaciones.forEach((oc) => {
            const opt = document.createElement("option");
            opt.value = oc;
            opt.textContent = oc;
            filterOccupation.appendChild(opt);
        });
    }

    if (filterSpecies) {
        filterSpecies.innerHTML = '<option value="">Todas las especies</option>';
        especies.forEach((esp) => {
            const opt = document.createElement("option");
            opt.value = esp;
            opt.textContent = esp;
            filterSpecies.appendChild(opt);
        });
    }
}

function renderPersonajes(lista) {
    if (!contenedorPersonajes) return;

    contenedorPersonajes.replaceChildren();

    if (!lista || lista.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = `
            <h3>🚀 No se encontraron personajes</h3>
            <p>Intenta con otro nombre, especie u ocupación diferente.</p>
        `;
        contenedorPersonajes.appendChild(empty);
        return;
    }

    lista.forEach((p) => {
        const nombre = obtenerValor(p, ["nombre", "Nombre"]) || "Sin nombre";
        const especie = obtenerValor(p, ["especie", "Especie"]) || "Desconocida";
        const ocupacion = obtenerValor(p, ["ocupacion", "Ocupacion"]) || "Sin ocupación";
        const descripcion = obtenerValor(p, ["descripcion", "Descripcion"]) || "Miembro de la tripulación de Planet Express.";
        let imagen = obtenerValor(p, ["image", "imagen", "Image", "Imagen"]) || "img/futurama-logo.png";

        const card = document.createElement("article");
        card.className = "tarjeta-personaje-api";
        card.setAttribute("role", "listitem");

        card.innerHTML = `
            <figure class="imagen-personaje">
                <img src="${imagen}" alt="${nombre}" loading="lazy" onerror="this.onerror=null;this.src='img/futurama-logo.png'">
            </figure>
            <h3>${nombre}</h3>
            <div class="tarjeta-badges">
                <span class="badge-especie">👽 ${especie}</span>
                <span class="badge-ocupacion">💼 ${ocupacion}</span>
            </div>
            <p class="descripcion-personaje">${descripcion}</p>
            <time datetime="3000">Año 3000 · PostgreSQL ID #${p.id || 'N/A'}</time>
        `;

        contenedorPersonajes.appendChild(card);
    });
}

function aplicarFiltros() {
    const texto = filterName ? normalizarTexto(filterName.value) : "";
    const ocupacion = filterOccupation ? normalizarTexto(filterOccupation.value) : "";
    const especie = filterSpecies ? normalizarTexto(filterSpecies.value) : "";

    const filtrados = personajesBase.filter((p) => {
        const nom = normalizarTexto(obtenerValor(p, ["nombre", "Nombre"]));
        const oc = normalizarTexto(obtenerValor(p, ["ocupacion", "Ocupacion"]));
        const esp = normalizarTexto(obtenerValor(p, ["especie", "Especie"]));

        const coincideNombre = !texto || nom.includes(texto);
        const coincideOcupacion = !ocupacion || oc === ocupacion;
        const coincideEspecie = !especie || esp === especie;

        return coincideNombre && coincideOcupacion && coincideEspecie;
    });

    renderPersonajes(filtrados);

    if (charactersMessage) {
        if (filtrados.length === personajesBase.length) {
            charactersMessage.textContent = `Mostrando los ${personajesBase.length} personajes cargados desde PostgreSQL.`;
        } else {
            charactersMessage.textContent = `Resultados: ${filtrados.length} de ${personajesBase.length} personajes.`;
        }
    }
}

async function cargarPersonajesPostgreSQL() {
    if (charactersMessage) charactersMessage.textContent = "Consultando base de datos PostgreSQL local (pgAdmin 4)...";
    if (apiDot) apiDot.className = "status-dot";
    if (apiStatusText) apiStatusText.textContent = "Conectando con PostgreSQL...";

    try {
        const res = await fetch(URL_API_POSTGRES);
        if (!res.ok) {
            throw new Error(`El servidor Express respondió con estado ${res.status}`);
        }

        const datos = await res.json();
        if (!Array.isArray(datos) || datos.length === 0) {
            throw new Error("PostgreSQL no devolvió filas.");
        }

        personajesBase = datos;

        if (apiDot) apiDot.className = "status-dot connected";
        if (apiStatusText) apiStatusText.textContent = "🐘 Conectado a PostgreSQL Local (pgAdmin 4 / Express)";
        if (totalBadge) totalBadge.textContent = `${personajesBase.length} personajes en PostgreSQL`;

        poblarFiltros(personajesBase);
        aplicarFiltros();
    } catch (err) {
        console.warn("No se pudo conectar a la API PostgreSQL, recurriendo a personajes.json de respaldo:", err);

        if (window.personajes && Array.isArray(window.personajes) && window.personajes.length > 0) {
            personajesBase = window.personajes;
            if (apiDot) apiDot.className = "status-dot error";
            if (apiStatusText) apiStatusText.textContent = "⚠️ Backend desconectado. Mostrando datos locales";
            if (totalBadge) totalBadge.textContent = `${personajesBase.length} personajes`;
            poblarFiltros(personajesBase);
            aplicarFiltros();
            return;
        }

        try {
            const fallbackRes = await fetch(LOCAL_JSON_BACKUP);
            personajesBase = await fallbackRes.json();

            if (apiDot) apiDot.className = "status-dot error";
            if (apiStatusText) apiStatusText.textContent = "⚠️ Servidor Express desconectado. Mostrando personajes.json de respaldo";
            if (totalBadge) totalBadge.textContent = `${personajesBase.length} personajes (Respaldo)`;

            poblarFiltros(personajesBase);
            aplicarFiltros();
        } catch (backupErr) {
            if (apiDot) apiDot.className = "status-dot error";
            if (apiStatusText) apiStatusText.textContent = "Error al conectar con PostgreSQL y JSON";
            if (charactersMessage) charactersMessage.textContent = "Error: Inicia el backend ejecutando 'node server.js' en la carpeta backend.";
        }
    }
}

if (filterName) filterName.addEventListener("input", aplicarFiltros);
if (filterOccupation) filterOccupation.addEventListener("change", aplicarFiltros);
if (filterSpecies) filterSpecies.addEventListener("change", aplicarFiltros);

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
        if (filterName) filterName.value = "";
        if (filterOccupation) filterOccupation.value = "";
        if (filterSpecies) filterSpecies.value = "";
        aplicarFiltros();
    });
}

if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
        cargarPersonajesPostgreSQL();
    });
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarPersonajesPostgreSQL);
} else {
    cargarPersonajesPostgreSQL();
}
