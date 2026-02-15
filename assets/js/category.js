// ===============================
// CATEGORY.JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  const container = document.getElementById("category-products");
  const paginationContainer = document.getElementById("pagination");

  if (!container) {
    console.log("No existe el contenedor #category-products");
    return;
  }

  if (!category) {
    container.innerHTML = "<p>No se especificó categoría.</p>";
    return;
  }

  if (typeof products === "undefined") {
    container.innerHTML = "<p>Error: products.js no está cargado.</p>";
    return;
  }

  const filteredProducts = products.filter(p =>
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
    });

  }

  container.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const id = card.dataset.id;
  window.location.href = `producto.html?id=${id}`;
});


  function renderPagination() {

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    // Prev
    if (currentPage > 1) {
      paginationContainer.innerHTML += `
        <button data-page="${currentPage - 1}">‹</button>
      `;
    }

    for (let i = 1; i <= totalPages; i++) {
      paginationContainer.innerHTML += `
        <button data-page="${i}" 
                class="${i === currentPage ? "active" : ""}">
          ${i}
        </button>
      `;
    }

    // Next
    if (currentPage < totalPages) {
      paginationContainer.innerHTML += `
        <button data-page="${currentPage + 1}">›</button>
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

});


// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

  const image = product.images && product.images.length > 0
    ? product.images[0]
    : "https://picsum.photos/600/600";

  return `
    <article class="product-card">
      <a href="producto.html?id=${product.id}" class="product-link">
        <div class="product-image"
             style="background-image:url('${image}');
                    background-size:cover;
                    background-position:center;">
        </div>
        <h3>${product.name}</h3>
        <p class="brand">${product.brand}</p>
        <p class="price">$${product.price.toLocaleString()}</p>
      </a>
      <button>Agregar al carrito</button>
    </article>
  `;
}
