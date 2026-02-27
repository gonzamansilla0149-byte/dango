// ===============================
// CATEGORY.JS
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

const container = document.getElementById("category-products");
const paginationContainer = document.getElementById("pagination");

if (!container) return;


// ===============================
// GENERAR LISTA DE CATEGORÍAS
// ===============================
// ===============================
// GENERAR LISTA DE CATEGORÍAS (DINÁMICO)
// ===============================

const categoryContainer = document.getElementById("category-filter");

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/\s+/g, "-");
}

if (categoryContainer) {

  const res = await fetch("/api/categories");
  const categories = await res.json();

  categoryContainer.innerHTML = "";

  categories.forEach(cat => {

    const slug = slugify(cat.name);
    const isActive = slug === category ? "active" : "";

    categoryContainer.innerHTML += `
      <button class="filter-item ${isActive}"
              data-category="${slug}">
        ${cat.name}
      </button>
    `;
  });

  categoryContainer.addEventListener("click", (e) => {
    if (!e.target.dataset.category) return;
    window.location.href = `categoria.html?cat=${e.target.dataset.category}`;
  });
}

// ⚠️ RECIÉN ACÁ validamos category
if (!category) {
  container.innerHTML = "<p>Selecciona una categoría.</p>";
  return;
}
// ===============================
// TÍTULO Y BREADCRUMB (DINÁMICO)
// ===============================

const resCategories = await fetch("/api/categories");
const allCategories = await resCategories.json();

const currentCategoryObj = allCategories.find(
  c => slugify(c.name) === category
);

const categoryName = currentCategoryObj
  ? currentCategoryObj.name
  : "Categoría";

const titleElement = document.getElementById("category-title");
const breadcrumbElement = document.getElementById("breadcrumb");

if (titleElement) titleElement.textContent = categoryName;
if (breadcrumbElement)
  breadcrumbElement.textContent = `Inicio / Categoría / ${categoryName}`;

document.title = `Dango | ${categoryName}`;

  // ===============================
// TRACKING DE CATEGORÍA
// ===============================

function trackView(type, value) {
  if (!value) return;

  const history = JSON.parse(localStorage.getItem("userHistory")) || [];

  history.push({
    type,
    value,
    timestamp: Date.now()
  });

  // Mantener historial liviano
  const trimmed = history.slice(-100);

  localStorage.setItem("userHistory", JSON.stringify(trimmed));
}

// Registrar categoría visitada
trackView("category", categoryName);

  try {

    const response = await fetch("/api/products");
    const allProducts = await response.json();
    
const filteredProducts = allProducts.filter(p =>
  slugify(p.category_name || "") === category
);
   if (filteredProducts.length === 0) {
  container.innerHTML = "<p>No hay productos en esta categoría.</p>";
}

    // ===============================
    // ESTADO DE FILTROS
    // ===============================

    let selectedSubcategory = null;
    let selectedBrand = null;
    let selectedPriceRange = null;
    let activeProducts = [...filteredProducts];

    // ===============================
    // GENERAR SUBCATEGORÍAS Y MARCAS
    // ===============================

    const subcategoryContainer = document.getElementById("subcategory-filter");
    const brandContainer = document.getElementById("brand-filter");

    const subcategories = [...new Set(filteredProducts.map(p => p.subcategory_name).filter(Boolean))];
    const brands = [...new Set(filteredProducts.map(p => p.brand_name).filter(Boolean))];

    if (subcategoryContainer) {
      subcategoryContainer.innerHTML = "";
      subcategories.forEach(sub => {
        subcategoryContainer.innerHTML += `
          <button class="filter-item" data-sub="${sub}">
            ${sub}
          </button>
        `;
      });
    }

    if (brandContainer) {
      brandContainer.innerHTML = "";
      brands.forEach(brand => {
        brandContainer.innerHTML += `
          <button class="filter-item" data-brand="${brand}">
            ${brand}
          </button>
        `;
      });
    }

    // ===============================
    // FILTRADO CENTRAL
    // ===============================

    function applyFilters() {

      activeProducts = filteredProducts.filter(p => {

        let match = true;

if (selectedSubcategory) {
  match = match &&
    (p.subcategory_name || "").toLowerCase() ===
    selectedSubcategory.toLowerCase();
}


if (selectedBrand) {
  match = match &&
    (p.brand_name || "").toLowerCase() ===
    selectedBrand.toLowerCase();
}
        if (selectedPriceRange) {
          const [min, max] = selectedPriceRange;
          match = match && p.price >= min && p.price <= max;
        }

        return match;
      });

      currentPage = 1;
      renderProducts(currentPage);
      renderPagination();

      const resultsCount = document.getElementById("results-count");
      if (resultsCount) {
        resultsCount.textContent = `${activeProducts.length} productos`;
      }
    }

    // ===============================
    // EVENTOS DE FILTROS
    // ===============================

    if (subcategoryContainer) {
      subcategoryContainer.addEventListener("click", e => {
        if (!e.target.dataset.sub) return;

        selectedSubcategory =
          selectedSubcategory === e.target.dataset.sub
            ? null
            : e.target.dataset.sub;

        if (selectedSubcategory) {
  trackView("subcategory", selectedSubcategory);
}

        applyFilters();
      });
    }

    if (brandContainer) {
      brandContainer.addEventListener("click", e => {
        if (!e.target.dataset.brand) return;

        selectedBrand =
          selectedBrand === e.target.dataset.brand
            ? null
            : e.target.dataset.brand;

        applyFilters();
      });
    }

    const priceContainer = document.getElementById("price-filter");

    if (priceContainer) {
      priceContainer.addEventListener("click", e => {
        if (!e.target.dataset.price) return;

        const range = e.target.dataset.price.split("-");
        selectedPriceRange = [Number(range[0]), Number(range[1])];

        applyFilters();
      });
    }

    // ===============================
    // PAGINACIÓN
    // ===============================

    const PRODUCTS_PER_PAGE = 30;
    let currentPage = 1;

function renderProducts(page) {

  container.innerHTML = "";

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;

  const productsToShow = activeProducts.slice(start, end);

  const fragment = document.createDocumentFragment();

  productsToShow.forEach(product => {

    const wrapper = document.createElement("div");
    wrapper.innerHTML = createProductCard(product);

    fragment.appendChild(wrapper.firstElementChild);
  });

  container.appendChild(fragment);
}

function renderPagination() {

  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(activeProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= totalPages; i++) {

    const btn = document.createElement("button");
    btn.dataset.page = i;
    btn.textContent = i;

    if (i === currentPage) {
      btn.classList.add("active");
    }

    fragment.appendChild(btn);
  }

  paginationContainer.appendChild(fragment);
}

    if (paginationContainer) {
      paginationContainer.addEventListener("click", (e) => {

        if (!e.target.dataset.page) return;

        currentPage = parseInt(e.target.dataset.page);

        renderProducts(currentPage);
        renderPagination();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      });
    }

    // Inicializar
    applyFilters();

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error cargando productos.</p>";
  }

  // Toggle visual de filtros
  document.querySelectorAll(".filter-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("active");
    });
  });

});

function optimizeImage(url) {
  if (!url) return "/assets/img/no-image.png";
  return url;
}

// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

let image = "/assets/img/no-image.png";

const firstMedia = product.media?.find(m => m.url);
if (firstMedia) {
  image = optimizeImage(firstMedia.url);
}

  return `
    <article class="product-card">
      <a href="producto.html?id=${product.id}" class="product-link">
        <div class="product-image"
             style="
               background-image:url('${image}');
               background-size:cover;
               background-position:center;
               background-repeat:no-repeat;
             ">
        </div>
        <h3>${product.name}</h3>
        <p class="brand">${product.brand_name || ""}</p>
        <p class="price">$${Number(product.price).toLocaleString()}</p>
      </a>
      <button>Agregar al carrito</button>
    </article>
  `;
}
