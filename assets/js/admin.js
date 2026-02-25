// ============================
// CONFIG API
// ============================

const API_URL = "https://dango.gonzamansilla0149.workers.dev";
// ============================
// PROTECCIÓN ADMIN
// ============================

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token || role !== "admin") {
  window.location.href = "admin-login.html";
}

// ============================
// FETCH AUTENTICADO
// ============================
async function authFetch(url, options = {}) {

  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "admin-login.html";
  }

  return response;
}
// ============================
// DATA
// ============================

let products = [];
let categories = [];
let subcategories = [];
let brands = [];
let orders = JSON.parse(localStorage.getItem("admin_orders")) || [];

const tableContainer = document.getElementById("products-table");
const form = document.getElementById("product-form");
const categorySelect = document.getElementById("product-category");

if (categorySelect) {
  categorySelect.addEventListener("change", (e) => {
    const categoryId = e.target.value;

    if (categoryId) {
      loadSubcategories(categoryId);
    } else {
      const subSelect = document.getElementById("product-subcategory");
      if (subSelect) {
        subSelect.innerHTML = `<option value="">Seleccionar subcategoría</option>`;
      }
    }
  });
}
const searchInput = document.getElementById("product-search");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebar-overlay");
const menuToggle = document.getElementById("menu-toggle");
const toggleBtn = document.getElementById("toggle-form");
const formContainer = document.getElementById("product-form-container");

// PEDIDOS
const ordersBody = document.getElementById("orders-body");
const btnLoadReport = document.getElementById("btnLoadReport");

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "admin-login.html";
  });
}

// ============================
// CAMBIO DE VISTA (SIDEBAR)
// ============================

const buttons = document.querySelectorAll(".sidebar button");
const sections = document.querySelectorAll(".content section");

buttons.forEach(btn => {
  btn.addEventListener("click", async () => {

    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach(sec => sec.classList.add("hidden"));

    const view = btn.dataset.view;
    const target = document.getElementById(view + "-view");

    if (target) {
      target.classList.remove("hidden");
      localStorage.setItem("admin_view", view);

      // 🔥 SI ES CATEGORÍAS → INICIALIZAMOS TODO
      if (view === "categorias") {
        await initCategoryView();
      }

      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
      }
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


if (menuToggle && sidebar) {

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    if (overlay) overlay.classList.toggle("active");
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  }

}
async function loadProducts(search = "") {
  try {
    const res = await authFetch(`${API_URL}/api/products?search=${encodeURIComponent(search)}`);
    products = await res.json();
    renderProducts();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ============================
// LOAD CATEGORIES / BRANDS
// ============================

async function loadCategories() {
  try {
    const res = await authFetch(`${API_URL}/api/categories`);
    categories = await res.json();
    fillCategorySelect();
    renderCategoriesList();   // 🔥 AGREGAR ESTA LÍNEA
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

async function loadBrands() {
  try {
    const res = await authFetch(`${API_URL}/api/brands`);
    brands = await res.json();
    fillBrandSelect();
    renderBrandsList();   // 🔥 AGREGAR ESTA LÍNEA
  } catch (error) {
    console.error("Error cargando marcas:", error);
  }
}

async function loadSubcategories(categoryId) {
  try {
    const res = await authFetch(`${API_URL}/api/categories/${categoryId}/subcategories`);
    subcategories = await res.json();
    fillSubcategorySelect();
  } catch (error) {
    console.error("Error cargando subcategorías:", error);
  }
}

function fillSubcategorySelect() {
  const select = document.getElementById("product-subcategory");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar subcategoría</option>`;

  subcategories.forEach(s => {
    select.innerHTML += `
      <option value="${s.id}">${s.name}</option>
    `;
  });
}
// ============================
// RENDER PRODUCTOS
// ============================
function fillCategorySelect() {
  const select = document.getElementById("product-category");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar categoría</option>`;

  categories.forEach(c => {
    select.innerHTML += `
      <option value="${c.id}">${c.name}</option>
    `;
  });
}

function fillBrandSelect() {
  const select = document.getElementById("product-brand");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar marca</option>`;

  brands.forEach(b => {
    select.innerHTML += `
      <option value="${b.id}">${b.name}</option>
    `;
  });
}
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
        <td>
<a href="#" onclick="openProductAdmin(${p.id})">
    ${p.name}
  </a>
</td>
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
  brand_id: Number(data.get("brand_id")),
  category_id: Number(data.get("category_id")),
  subcategory_id: Number(data.get("subcategory_id")),
  price: Number(data.get("price")),
  stock: Number(data.get("stock")),
  description: data.get("description"),
  image_url: data.get("image")
};

    try {
      await authFetch(`${API_URL}/api/products`, {
        method: "POST",
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
    await authFetch(`${API_URL}/api/products/${id}`, {
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
async function openProductAdmin(id) {

  
  sections.forEach(sec => sec.classList.add("hidden"));
  document.getElementById("product-admin-view").classList.remove("hidden");

    // 🔥 Guardamos estado actual
  localStorage.setItem("admin_view", "product-admin");
  localStorage.setItem("admin_product_id", id);

  try {

    const res = await authFetch(`${API_URL}/api/products/${id}`);
    const product = await res.json();

    document.querySelector(".product-title").innerText = product.name || "";
    // Cargar marcas en select edición
const brandSelect = document.getElementById("admin-edit-brand");

if (brands.length === 0) {
  await loadBrands();
}

if (brandSelect) {
  brandSelect.innerHTML = "";

  brands.forEach(b => {
    brandSelect.innerHTML += `
      <option value="${b.id}">${b.name}</option>
    `;
  });

brandSelect.value = product.brand_id || "";
}
document.querySelector(".price").innerText =
  "$" + Number(product.price || 0).toLocaleString();
document.querySelector(".product-description").innerText =
  product.description || "";
    document.getElementById("admin-edit-image").value = product.image_url || "";
    document.getElementById("admin-edit-stock").value = product.stock || 0;

    if (product.image_url) {
      const mainImage = document.getElementById("admin-main-image");
      mainImage.style.backgroundImage = `url(${product.image_url})`;
      mainImage.style.backgroundSize = "cover";
      mainImage.style.backgroundPosition = "center";
    }

    document.getElementById("admin-save-product").dataset.id = id;

  } catch (error) {
    console.error("Error cargando producto:", error);
  }
}
const adminSaveBtn = document.getElementById("admin-save-product");
const adminBackBtn = document.getElementById("admin-back-products");

if (adminSaveBtn) {

  adminSaveBtn.addEventListener("click", async () => {

    const id = adminSaveBtn.dataset.id;

const updated = {
  name: document.querySelector(".product-title").innerText,
  brand_id: Number(document.getElementById("admin-edit-brand").value),
  price: Number(
    document.querySelector(".price").innerText.replace(/[^0-9]/g, "")
  ),
  description: document.querySelector(".product-description").innerText,
      image_url: document.getElementById("admin-edit-image").value,
      stock: Number(document.getElementById("admin-edit-stock").value)
    };

    try {

await authFetch(`${API_URL}/api/products/${id}`, {
  method: "PUT",
  body: JSON.stringify(updated)
});

      alert("Producto actualizado");

      loadProducts();

      document.getElementById("product-admin-view").classList.add("hidden");
      document.getElementById("productos-view").classList.remove("hidden");

    } catch (error) {
      console.error("Error actualizando producto:", error);
    }

  });
}

if (adminBackBtn) {

  adminBackBtn.addEventListener("click", () => {

    document.getElementById("product-admin-view").classList.add("hidden");
    document.getElementById("productos-view").classList.remove("hidden");

  });
}

const savedView = localStorage.getItem("admin_view");

if (savedView) {

  sections.forEach(sec => sec.classList.add("hidden"));

  // 🔥 Si estábamos editando un producto
  if (savedView === "product-admin") {

    const savedProductId = localStorage.getItem("admin_product_id");

    if (savedProductId) {
      openProductAdmin(savedProductId);
    }

  } else {

    const target = document.getElementById(savedView + "-view");
    const btn = document.querySelector(`.sidebar button[data-view="${savedView}"]`);

    if (target) target.classList.remove("hidden");

    if (btn) {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }

  }
}

// ============================
// INIT
// ============================
loadCategories();
loadBrands();
loadProducts();
renderOrders();

// ============================
// GESTIÓN DE CATEGORÍAS
// ============================

const createCategoryBtn = document.getElementById("create-category-btn");
const createSubcategoryBtn = document.getElementById("create-subcategory-btn");
const createBrandBtn = document.getElementById("create-brand-btn");

const categoriesList = document.getElementById("categories-list");
const brandsList = document.getElementById("brands-list");
const subcategoryCategorySelect = document.getElementById("subcategory-category-select");

// Cargar categorías en select de subcategoría
async function loadCategoriesForSubcategory() {
  if (!subcategoryCategorySelect) return;

  subcategoryCategorySelect.innerHTML =
    `<option value="">Seleccionar categoría</option>`;

  categories.forEach(c => {
    subcategoryCategorySelect.innerHTML +=
      `<option value="${c.id}">${c.name}</option>`;
  });
}

// Render listado categorías
function renderCategoriesList() {
  if (!categoriesList) return;

  if (categories.length === 0) {
    categoriesList.innerHTML = "<p>No hay categorías</p>";
    return;
  }

  let html = "<ul>";

  categories.forEach(c => {
    html += `
      <li>
        ${c.name}
        <button onclick="deleteCategory(${c.id})">Eliminar</button>
      </li>
    `;
  });

  html += "</ul>";

  categoriesList.innerHTML = html;
}

// Render listado marcas
function renderBrandsList() {
  if (!brandsList) return;

  if (brands.length === 0) {
    brandsList.innerHTML = "<p>No hay marcas</p>";
    return;
  }

  let html = "<ul>";

  brands.forEach(b => {
    html += `
      <li>
        ${b.name}
        <button onclick="deleteBrand(${b.id})">Eliminar</button>
      </li>
    `;
  });

  html += "</ul>";

  brandsList.innerHTML = html;
}

// Crear categoría
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "create-category-btn") {
    const name = document.getElementById("new-category-name").value.trim();
    if (!name) return alert("Ingresá un nombre");

    try {

      const res = await authFetch(`${API_URL}/api/categories`, {
        method: "POST",
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Error: " + error);
        return;
      }

      document.getElementById("new-category-name").value = "";

      await loadCategories();
      loadCategoriesForSubcategory();
      renderCategoriesList();

      alert("Categoría creada correctamente");

    } catch (err) {
      alert("Error creando categoría");
      console.error(err);
    }
  });
}
// Crear subcategoría
if (createSubcategoryBtn) {
  createSubcategoryBtn.addEventListener("click", async () => {

    const name = document.getElementById("new-subcategory-name").value.trim();
    const category_id = subcategoryCategorySelect.value;

    if (!name || !category_id) return alert("Completá los campos");

    await authFetch(`${API_URL}/api/subcategories`, {
      method: "POST",
      body: JSON.stringify({ name, category_id })
    });

    document.getElementById("new-subcategory-name").value = "";
    alert("Subcategoría creada");
  });
}

// Crear marca
if (createBrandBtn) {
  createBrandBtn.addEventListener("click", async () => {
    const name = document.getElementById("new-brand-name").value.trim();
    if (!name) return alert("Ingresá un nombre");

    await authFetch(`${API_URL}/api/brands`, {
      method: "POST",
      body: JSON.stringify({ name })
    });

    document.getElementById("new-brand-name").value = "";
    await loadBrands();
    renderBrandsList();
  });
}

// Eliminar categoría
async function deleteCategory(id) {
  if (!confirm("¿Eliminar categoría?")) return;

  await authFetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE"
  });

  await loadCategories();
  renderCategoriesList();
}

// Eliminar marca
async function deleteBrand(id) {
  if (!confirm("¿Eliminar marca?")) return;

  await authFetch(`${API_URL}/api/brands/${id}`, {
    method: "DELETE"
  });

  await loadBrands();
  renderBrandsList();
}

// Actualizar listados cuando se carga la vista
async function initCategoryView() {
  await loadCategories();
  await loadBrands();
  loadCategoriesForSubcategory();
  renderCategoriesList();
  renderBrandsList();
}

