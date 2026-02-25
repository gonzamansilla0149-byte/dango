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

const categoryContainer = document.getElementById("category-filter");

const categoriesList = [
  { key: "ofertas", name: "Ofertas" },
  { key: "celulares", name: "Celulares" },
  { key: "computacion", name: "Computación" },
  { key: "herramientas", name: "Herramientas" },
  { key: "accesorios", name: "Accesorios" }
];

if (categoryContainer) {

  categoryContainer.innerHTML = "";

  categoriesList.forEach(cat => {

    const isActive = category === cat.key ? "active" : "";

    categoryContainer.innerHTML += `
      <button class="filter-item ${isActive}" 
              data-category="${cat.key}">
        ${cat.name}
      </button>
    `;
  });

  categoryContainer.addEventListener("click", (e) => {
    if (!e.target.dataset.category) return;

    const selectedCat = e.target.dataset.category;
    window.location.href = `categoria.html?cat=${selectedCat}`;
  });
}


// ⚠️ RECIÉN ACÁ validamos category
if (!category) {
  container.innerHTML = "<p>Selecciona una categoría.</p>";
  return;
}

  // ===============================
  // TÍTULO Y BREADCRUMB
  // ===============================

  const categoryNames = {
    celulares: "Celulares",
    computacion: "Computación",
    herramientas: "Herramientas",
    accesorios: "Accesorios",
    ofertas: "Ofertas"
  };

  const categoryName = categoryNames[category] || "Categoría";

  const titleElement = document.getElementById("category-title");
  const breadcrumbElement = document.getElementById("breadcrumb");

  if (titleElement) titleElement.textContent = categoryName;
  if (breadcrumbElement)
    breadcrumbElement.textContent = `Inicio / Categoría / ${categoryName}`;

  document.title = `Dango | ${categoryName}`;

  try {

    const response = await fetch("https://dango.gonzamansilla0149.workers.dev/api/products");
    const allProducts = await response.json();

const filteredProducts = allProducts.filter(p =>
  (p.category_name || "").toLowerCase() === category.toLowerCase()
);
    
    if (filteredProducts.length === 0) {
      container.innerHTML = "<p>No hay productos en esta categoría.</p>";
      return;
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

    const subcategories = [...new Set(filteredProducts.map(p => p.subcategory).filter(Boolean))];
    const brands = [...new Set(filteredProducts.map(p => p.brand).filter(Boolean))];

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
          match = match && p.subcategory === selectedSubcategory;
        }

        if (selectedBrand) {
          match = match && p.brand === selectedBrand;
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

      productsToShow.forEach(product => {
        container.innerHTML += createProductCard(product);
      });
    }

    function renderPagination() {

      if (!paginationContainer) return;

      paginationContainer.innerHTML = "";

      const totalPages = Math.ceil(activeProducts.length / PRODUCTS_PER_PAGE);
      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        paginationContainer.innerHTML += `
          <button data-page="${i}" 
                  class="${i === currentPage ? "active" : ""}">
            ${i}
          </button>
        `;
      }
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


// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

  const image = product.image_url || "";

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
        <p class="brand">${product.brand}</p>
        <p class="price">$${Number(product.price).toLocaleString()}</p>
      </a>
      <button>Agregar al carrito</button>
    </article>
  `;
}
