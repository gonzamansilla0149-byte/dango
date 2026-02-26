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

  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
const createMediaInput = document.getElementById("create-media-input");
const createPreviewContainer = document.getElementById("create-media-preview");

let createSelectedFiles = [];

// ============================
// PREVIEW CREAR PRODUCTO
// ============================

if (createMediaInput) {

  createMediaInput.addEventListener("change", (e) => {

    const files = Array.from(e.target.files);

    createSelectedFiles = [...createSelectedFiles, ...files];

    if (createSelectedFiles.length > 5) {
      alert("Máximo 5 archivos permitidos");
      createSelectedFiles = createSelectedFiles.slice(0, 5);
    }

    renderCreatePreview();
    syncCreateInputFiles();
  });

}

function renderCreatePreview() {

  if (!createPreviewContainer) return;

  createPreviewContainer.innerHTML = "";

  createSelectedFiles.forEach((file, index) => {

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");

    createPreviewContainer.innerHTML += `
      <div class="create-media-item">
        ${
          isVideo
            ? `<video src="${url}" width="100"></video>`
            : `<img src="${url}" width="100">`
        }
        <button type="button" onclick="removeCreateFile(${index})">✖</button>
      </div>
    `;
  });
}

function removeCreateFile(index) {
  createSelectedFiles.splice(index, 1);
  renderCreatePreview();
  syncCreateInputFiles();
}

function syncCreateInputFiles() {
  const dataTransfer = new DataTransfer();
  createSelectedFiles.forEach(file => dataTransfer.items.add(file));
  createMediaInput.files = dataTransfer.files;
}
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
      window.history.pushState({}, "", `?view=${view}`);

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

function fillAdminCategorySelect(selectedId = null) {
  const select = document.getElementById("admin-edit-category");
  if (!select) return;

  select.innerHTML = `<option value="">Seleccionar categoría</option>`;

  categories.forEach(c => {
    select.innerHTML += `
      <option value="${c.id}">${c.name}</option>
    `;
  });

  if (selectedId) {
    select.value = selectedId;
  }
}

async function fillAdminSubcategorySelect(categoryId, selectedId = null) {
  const select = document.getElementById("admin-edit-subcategory");
  if (!select) return;

  const res = await authFetch(`${API_URL}/api/categories/${categoryId}/subcategories`);
  const subs = await res.json();

  select.innerHTML = `<option value="">Seleccionar subcategoría</option>`;

  subs.forEach(s => {
    select.innerHTML += `
      <option value="${s.id}">${s.name}</option>
    `;
  });

  if (selectedId) {
    select.value = selectedId;
  }
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

    const formData = new FormData();

// Agregamos todos los campos manualmente
formData.append("name", form.querySelector('[name="name"]').value);
formData.append("price", form.querySelector('[name="price"]').value);
formData.append("description", form.querySelector('[name="description"]').value);
formData.append("stock", form.querySelector('[name="stock"]').value);
formData.append("brand_id", form.querySelector('[name="brand_id"]').value);
formData.append("category_id", form.querySelector('[name="category_id"]').value);
formData.append("subcategory_id", form.querySelector('[name="subcategory_id"]').value);

// Agregamos archivos desde createSelectedFiles
createSelectedFiles.forEach(file => {
  formData.append("media[]", file);
});

if (createSelectedFiles.length === 0) {
  alert("Debes subir al menos una imagen");
  return;
}

let videoCount = 0;

for (let file of createSelectedFiles) {

  if (file.type.startsWith("video/")) {
    videoCount++;
  }

  if (file.size > 30 * 1024 * 1024) {
    alert("Un archivo supera los 30MB");
    return;
  }
}

if (videoCount > 1) {
  alert("Solo se permite 1 video por producto");
  return;
}

    try {

      const res = await authFetch(`${API_URL}/api/products`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Error: " + error);
        return;
      }

      form.reset();
      createSelectedFiles = [];
      if (createPreviewContainer) createPreviewContainer.innerHTML = "";
      formContainer.classList.add("hidden");
      loadProducts();

      alert("Producto creado correctamente");

    } catch (error) {
      console.error("Error creando producto:", error);
      alert("Error creando producto");
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
async function openProductAdmin(id, push = true) {

  if (push) {
    window.history.pushState({}, "", `?product=${id}`);
  }

  sections.forEach(sec => sec.classList.add("hidden"));
  document.getElementById("product-admin-view").classList.remove("hidden");



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

// ============================
// CARGAR CATEGORÍA EN EDICIÓN
// ============================

if (categories.length === 0) {
  await loadCategories();
}

fillAdminCategorySelect(product.category_id);

// Cuando cambia categoría → actualizar subcategorías
const adminCategorySelect = document.getElementById("admin-edit-category");

if (adminCategorySelect) {
  adminCategorySelect.onchange = async (e) => {
    const newCategoryId = e.target.value;
    await fillAdminSubcategorySelect(newCategoryId);
  };
}

// Cargar subcategorías actuales del producto
if (product.category_id) {
  await fillAdminSubcategorySelect(
    product.category_id,
    product.subcategory_id
  );
}
    
document.querySelector(".price").innerText =
  "$" + Number(product.price || 0).toLocaleString();
document.querySelector(".product-description").innerText =
  product.description || "";
document.getElementById("admin-edit-stock").value = product.stock || 0;

const mainImage = document.getElementById("admin-main-image");
const gallery = document.getElementById("admin-media-gallery");

mainImage.innerHTML = "";
if (gallery) gallery.innerHTML = "";

if (product.media && product.media.length > 0) {

  product.media.forEach((url, index) => {

    const isVideo = url.endsWith(".mp4");

    if (index === 0) {
      mainImage.innerHTML = isVideo
        ? `<video controls width="100%"><source src="${url}" type="video/mp4"></video>`
        : `<img src="${url}" style="width:100%;object-fit:cover;">`;
    }

    if (gallery) {
      gallery.innerHTML += `
        <div class="admin-media-item" data-url="${url}">
          ${
            isVideo
              ? `<video src="${url}" width="120"></video>`
              : `<img src="${url}" width="120">`
          }
          <button onclick="removeMedia(this)">Eliminar</button>
        </div>
      `;
    }

  });
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

    const formData = new FormData();

    const totalFinal = document.querySelectorAll(".admin-media-item").length;

    if (totalFinal > 5) {
    alert("Máximo 5 archivos permitidos");
    return;
    }

    // Datos básicos
    formData.append("name", document.querySelector(".product-title").innerText);
    formData.append("brand_id", document.getElementById("admin-edit-brand").value);
    formData.append("category_id", document.getElementById("admin-edit-category").value);
    formData.append("subcategory_id", document.getElementById("admin-edit-subcategory").value);
    formData.append(
      "price",
      document.querySelector(".price").innerText.replace(/[^0-9]/g, "")
    );
    formData.append("description", document.querySelector(".product-description").innerText);
    formData.append("stock", document.getElementById("admin-edit-stock").value);

    // 🔥 Media existentes (los que no fueron eliminados)
    const existingItems = document.querySelectorAll(".admin-media-item");

    existingItems.forEach(item => {
      formData.append("existing_media[]", item.dataset.url);
    });

    // 🔥 Nuevos archivos
    const newFilesInput = document.getElementById("admin-new-media");

    if (newFilesInput && newFilesInput.files.length > 0) {

      let videoCount = 0;

      for (let file of newFilesInput.files) {

        if (file.type.startsWith("video/")) {
          videoCount++;
        }

        if (file.size > 30 * 1024 * 1024) {
          alert("Un archivo supera 30MB");
          return;
        }

        formData.append("media[]", file);
      }

      if (videoCount > 1) {
        alert("Solo se permite 1 video");
        return;
      }
    }

    try {

      const res = await authFetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        body: formData
      });

      if (!res.ok) {
        const error = await res.text();
        alert("Error: " + error);
        return;
      }

      alert("Producto actualizado correctamente");

      loadProducts();

window.history.pushState({}, "", "admin.html");
handleRouting();

    } catch (error) {
      console.error("Error actualizando producto:", error);
      alert("Error actualizando producto");
    }

  });
}
if (adminBackBtn) {

adminBackBtn.addEventListener("click", () => {

  window.history.pushState({}, "", "admin.html");

  document.getElementById("product-admin-view").classList.add("hidden");
  document.getElementById("productos-view").classList.remove("hidden");

});
}

function handleRouting() {

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("product");
  const view = params.get("view");

  // Ocultar todas las secciones
  sections.forEach(sec => sec.classList.add("hidden"));

  // Limpiar botones activos
  buttons.forEach(b => b.classList.remove("active"));

  // ===== PRODUCTO =====
  if (productId) {

    const productosBtn = document.querySelector('.sidebar button[data-view="productos"]');
    if (productosBtn) productosBtn.classList.add("active");

    openProductAdmin(Number(productId), false);
    return;
  }

  // ===== VISTA NORMAL =====
  if (view) {

    const target = document.getElementById(view + "-view");
    if (target) target.classList.remove("hidden");

    const btn = document.querySelector(`.sidebar button[data-view="${view}"]`);
    if (btn) btn.classList.add("active");

    return;
  }

  // ===== DEFAULT =====
  document.getElementById("productos-view").classList.remove("hidden");

  const productosBtn = document.querySelector('.sidebar button[data-view="productos"]');
  if (productosBtn) productosBtn.classList.add("active");
}
// ============================
// INIT
// ============================
loadCategories();
loadBrands();
loadProducts();
renderOrders();
handleRouting();

window.addEventListener("popstate", handleRouting);
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

function removeMedia(btn) {
  const item = btn.closest(".admin-media-item");
  if (item) item.remove();
}

// ============================
// PREVIEW NUEVOS ARCHIVOS EN EDICIÓN
// ============================

const adminNewMediaInput = document.getElementById("admin-new-media");

if (adminNewMediaInput) {

  adminNewMediaInput.addEventListener("change", () => {

    const gallery = document.getElementById("admin-media-gallery");

    const existingCount = document.querySelectorAll(".admin-media-item").length;
    const newFiles = Array.from(adminNewMediaInput.files);

    if (existingCount + newFiles.length > 5) {
      alert("Máximo 5 archivos en total");
      adminNewMediaInput.value = "";
      return;
    }

    newFiles.forEach(file => {

      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");

      gallery.innerHTML += `
        <div class="admin-media-item new-file">
          ${
            isVideo
              ? `<video src="${url}" width="120"></video>`
              : `<img src="${url}" width="120">`
          }
          <button type="button" onclick="removeMedia(this)">Eliminar</button>
        </div>
      `;
    });

  });

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

  }

});
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

