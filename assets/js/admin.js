// ============================
// STORAGE
// ============================

let products = JSON.parse(localStorage.getItem("admin_products")) || [];

const tableContainer = document.getElementById("products-table");
const form = document.getElementById("product-form");
const toggleBtn = document.getElementById("toggle-form");
const formContainer = document.getElementById("product-form-container");


// ============================
// CAMBIO DE VISTA (SIDEBAR)
// ============================

const buttons = document.querySelectorAll(".sidebar button");
const sections = document.querySelectorAll(".content section");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {

    // activar botón
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // ocultar todas las secciones
    sections.forEach(sec => sec.classList.add("hidden"));

    // mostrar la sección correcta
    const view = btn.dataset.view;
    const target = document.getElementById(view + "-view");

    if (target) {
      target.classList.remove("hidden");
    }
  });
});


// ============================
// MOSTRAR / OCULTAR FORM
// ============================

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    formContainer.classList.toggle("hidden");
  });
}


// ============================
// RENDER TABLA
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
// INIT
// ============================

renderProducts();
