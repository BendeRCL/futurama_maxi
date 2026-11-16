// Configuración de la URL de la API local Express conectada a PostgreSQL
const URL_API = "http://localhost:3000/api/productos";

const tablaProductos = document.getElementById("tablaProductos");
const mensaje = document.getElementById("mensaje");
const buscarNombre = document.getElementById("buscarNombre");
const filtroCategoria = document.getElementById("filtroCategoria");
const limpiarFiltros = document.getElementById("limpiarFiltros");

let productos = [];

async function cargarProductos() {
  try {
    mensaje.textContent = "Cargando productos desde la base de datos PostgreSQL...";
    const respuesta = await fetch(URL_API);

    if (!respuesta.ok) {
      throw new Error("El servidor respondió con estado " + respuesta.status);
    }

    productos = await respuesta.json();
    cargarCategorias();
    mostrarProductos(productos);
    mensaje.textContent = "Se encontraron " + productos.length + " productos en la base de datos.";
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mensaje.textContent = "No fue posible cargar los datos. Revisa que el backend esté ejecutándose (npm run dev) en http://localhost:3000.";
  }
}

function cargarCategorias() {
  const categorias = [];

  for (const producto of productos) {
    if (!categorias.includes(producto.categoria)) {
      categorias.push(producto.categoria);
    }
  }

  categorias.sort();

  filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
  for (const categoria of categorias) {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    filtroCategoria.appendChild(opcion);
  }
}


function mostrarProductos(lista) {
  tablaProductos.innerHTML = "";

  if (lista.length === 0) {
    tablaProductos.innerHTML = '<tr><td colspan="4" class="sin-resultados">No se encontraron productos con los filtros seleccionados.</td></tr>';
    return;
  }

  for (const producto of lista) {
    const fila = document.createElement("tr");

   
    let catClass = "badge-default";
    const catLower = (producto.categoria || "").toLowerCase();
    if (catLower.includes("caf")) catClass = "badge-cafe";
    else if (catLower.includes("pastel")) catClass = "badge-pastel";
    else if (catLower.includes("beb")) catClass = "badge-bebida";

    fila.innerHTML = `
      <td class="td-nombre"><strong>${producto.nombre}</strong></td>
      <td class="td-descripcion">${producto.descripcion ?? ""}</td>
      <td><span class="categoria-badge ${catClass}">${producto.categoria}</span></td>
      <td class="td-precio">$${Number(producto.precio).toLocaleString("es-CL")}</td>
    `;
    tablaProductos.appendChild(fila);
  }
}


function filtrarProductos() {
  const texto = buscarNombre.value.toLowerCase().trim();
  const categoria = filtroCategoria.value;

  const resultado = productos.filter(producto => {
    const coincideNombre = (producto.nombre || "").toLowerCase().includes(texto);
    const coincideCategoria = categoria === "" || producto.categoria === categoria;
    return coincideNombre && coincideCategoria;
  });

  mostrarProductos(resultado);
  mensaje.textContent = "Resultados: " + resultado.length + " de " + productos.length + " productos.";
}


buscarNombre.addEventListener("input", filtrarProductos);
filtroCategoria.addEventListener("change", filtrarProductos);
limpiarFiltros.addEventListener("click", () => {
  buscarNombre.value = "";
  filtroCategoria.value = "";
  mostrarProductos(productos);
  mensaje.textContent = "Se muestran todos los " + productos.length + " productos.";
});


cargarProductos();

