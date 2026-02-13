// ============================
// STORAGE PRODUCTOS
// ============================

let products = JSON.parse(localStorage.getItem("admin_products")) || [];
let orders = JSON.parse(localStorage.getItem("admin_orders")) || [];

const tableContainer = document.getElementById("products-table");
const form = document.getElementById("product-form");
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

  products.forEach((p, index) => {
    html += `
      <tr>
        <td>${p.name}</td>
        <td>$${p.price}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick="deleteProduct(${index})">
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
// CREAR PRODUCTO
// ============================

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);

    const product = {
      id: Date.now(),
      name: data.get("name"),
      brand: data.get("brand"),
      category: data.get("category"),
      price: Number(data.get("price")),
      stock: Number(data.get("stock")),
      description: data.get("description"),
      images: [data.get("image")]
    };

    products.push(product);
    localStorage.setItem("admin_products", JSON.stringify(products));

    form.reset();
    formContainer.classList.add("hidden");

    renderProducts();
  });
}


// ============================
// ELIMINAR PRODUCTO
// ============================

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("admin_products", JSON.stringify(products));
  renderProducts();
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

    // DESKTOP
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

    // MOBILE
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

    // TOTALES
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


// ============================
// INIT
// ============================

renderProducts();
renderOrders();
