// ===============================
// CATEGORY.JS
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  const container = document.getElementById("category-products");
  const paginationContainer = document.getElementById("pagination");

  if (!container) return;

  if (!category) {
    container.innerHTML = "<p>No se especificó categoría.</p>";
    return;
  }

  try {

    const response = await fetch("https://dango.gonzamansilla0149.workers.dev/api/products");
    const allProducts = await response.json();

    const filteredProducts = allProducts.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );

    if (filteredProducts.length === 0) {
      container.innerHTML = "<p>No hay productos en esta categoría.</p>";
      return;
    }

    const PRODUCTS_PER_PAGE = 30;
    let currentPage = 1;
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    function renderProducts(page) {

      container.innerHTML = "";

      const start = (page - 1) * PRODUCTS_PER_PAGE;
      const end = start + PRODUCTS_PER_PAGE;

      const productsToShow = filteredProducts.slice(start, end);

      productsToShow.forEach(product => {
      container.innerHTML += createProductCard(product);

      document.querySelectorAll(".filter-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("active");
        });
      });
    }

    function renderPagination() {

      if (!paginationContainer) return;

      paginationContainer.innerHTML = "";

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

    renderProducts(currentPage);
    renderPagination();

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error cargando productos.</p>";
  }

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
