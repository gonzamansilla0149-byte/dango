// ============================
// CONFIG API
// ============================

const API_URL = "https://dango.gonzamansilla0149.workers.dev";

// ============================
// DATA
// ============================

let products = [];
let orders = JSON.parse(localStorage.getItem("admin_orders")) || [];

const tableContainer = document.getElementById("products-table");
const form = document.getElementById("product-form");
const searchInput = document.getElementById("product-search");
const toggleBtn = document.getElementById("toggle-form");
const formContainer = document.getElementById("product-form-container");

// PEDIDOS
const ordersBody = document.getElementById("orders-body");
const btnLoadReport = document.getElementById("btnLoadReport");


// ============================
// CAMBIO DE VISTA (SIDEBAR)
// ============================

const buttons = document.querySelectorAll(".sidebar button");
const sections = document.querySelectorAll(".content section");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {

    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(sec => sec.classList.add("hidden"));

    const view = btn.dataset.view;
    const target = document.getElementById(view + "-view");

    if (target) {
      target.classList.remove("hidden");
    }
  });
});


// ============================
// MOSTRAR / OCULTAR FORM PRODUCTO
// ============================

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    formContainer.classList.toggle("hidden");
  });
}


async function loadProducts(search = "") {
  try {
    const res = await fetch(`${API_URL}/api/products?search=${encodeURIComponent(search)}`);
    products = await res.json();
    renderProducts();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}



// ============================
// RENDER PRODUCTOS
// ============================

function renderProducts() {

  if (!tableContainer) return;

  if (products.length === 0) {
    tableContainer.innerHTML = "<p>No hay productos</p>";
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  products.forEach((p) => {
    html += `
      <tr>
        <td>${p.name}</td>
        <td>$${Number(p.price).toLocaleString()}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick="deleteProduct(${p.id})">
            Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  tableContainer.innerHTML = html;
}


// ============================
// CREAR PRODUCTO (POST)
// ============================

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const product = {
      name: data.get("name"),
      brand: data.get("brand"),
      category: data.get("category"),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
      description: data.get("description"),
      image_url: data.get("image")
    };

    try {
      await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });

      form.reset();
      formContainer.classList.add("hidden");

      loadProducts();

    } catch (error) {
      console.error("Error creando producto:", error);
    }
  });
}


// ============================
// ELIMINAR PRODUCTO (requiere endpoint DELETE)
// ============================

async function deleteProduct(id) {
  try {
    await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE"
    });

    loadProducts();

  } catch (error) {
    console.error("Error eliminando producto:", error);
  }
}


// ============================
// PEDIDOS - RENDER TABLA
// ============================

function renderOrders(filteredOrders = orders) {

  if (!ordersBody) return;

  if (filteredOrders.length === 0) {
    ordersBody.innerHTML = `
      <tr>
        <td colspan="8">No hay pedidos</td>
      </tr>
    `;
    return;
  }

  let html = "";

  filteredOrders.forEach(o => {

    html += `
      <tr class="desktop-only">
        <td>${formatDate(o.date)}</td>
        <td>${o.model}</td>
        <td>${o.size}</td>
        <td>$${o.amount.toLocaleString()}</td>
        <td>${o.name}</td>
        <td>${o.zone}</td>
        <td>${o.address}</td>
        <td>${o.whatsapp}</td>
      </tr>
    `;

    html += `
      <tr class="mobile-only">
        <td>${o.name}</td>
        <td>${formatDate(o.date)}</td>
        <td>${o.model}</td>
        <td>$${o.amount.toLocaleString()}</td>
      </tr>
    `;
  });

  ordersBody.innerHTML = html;
}


// ============================
// FILTRO + TOTALES
// ============================

if (btnLoadReport) {
  btnLoadReport.addEventListener("click", () => {

    const from = document.getElementById("reportFrom").value;
    const to = document.getElementById("reportTo").value;

    if (!from || !to) {
      alert("Seleccioná un rango de fechas");
      return;
    }

    const filtered = orders.filter(o => {
      const d = o.date;
      return d >= from && d <= to;
    });

    let total = 0;
    let totalEnvios = 0;
    let totalPicadas = 0;

    filtered.forEach(o => {
      total += o.amount;
      totalEnvios += o.envio || 0;
      totalPicadas += o.amount - (o.envio || 0);
    });

    document.getElementById("rTotal").innerText =
      "Total: $" + total.toLocaleString();

    document.getElementById("rPicadas").innerText =
      "Picadas: $" + totalPicadas.toLocaleString();

    document.getElementById("rEnvios").innerText =
      "Envíos: $" + totalEnvios.toLocaleString();

    renderOrders(filtered);
  });
}


// ============================
// HELPERS
// ============================

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("es-AR");
}

let searchTimeout;

if (searchInput) {

  // Predictivo con debounce
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    const value = e.target.value.trim();

    searchTimeout = setTimeout(() => {
      loadProducts(value);
    }, 300); // espera 300ms
  });

  // Enter ejecuta búsqueda inmediata
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(searchTimeout);
      loadProducts(searchInput.value.trim());
    }
  });
}

// ============================
// INIT
// ============================

loadProducts();
renderOrders();
