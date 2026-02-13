let products = JSON.parse(localStorage.getItem("admin_products")) || [];

const tableContainer = document.getElementById("products-table");
const form = document.getElementById("product-form");

// ============================
// CAMBIO DE VISTA
// ============================

document.querySelectorAll(".sidebar button").forEach(btn => {
  btn.addEventListener("click", () => {

    document.querySelectorAll(".sidebar button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const view = btn.dataset.view;

    document.getElementById("products-view")
      .classList.toggle("hidden", view !== "products");

    document.getElementById("create-view")
      .classList.toggle("hidden", view !== "create");

  });
});

// ============================
// RENDER TABLA
// ============================

function renderProducts() {

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

  alert("Producto creado");

  renderProducts();
});

// ============================
// ELIMINAR
// ============================

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("admin_products", JSON.stringify(products));
  renderProducts();
}

renderProducts();
