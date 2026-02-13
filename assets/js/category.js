// ===============================
// CATEGORY.JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const category = params.get("cat");

  const container = document.getElementById("category-products");

  console.log("URL:", window.location.href);
  console.log("Categoría detectada:", category);
  console.log("Productos disponibles:", typeof products !== "undefined" ? products.length : "products NO definido");

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


  console.log("Productos filtrados:", filteredProducts.length);

  if (filteredProducts.length === 0) {
    container.innerHTML = "<p>No hay productos en esta categoría.</p>";
    return;
  }

  container.innerHTML = "";

  filteredProducts.forEach(product => {
    container.innerHTML += createProductCard(product);
  });

});


// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

  const image = product.images && product.images.length > 0
    ? product.images[0]
    : "https://picsum.photos/600/600";

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image"
           style="background-image:url('${image}');
                  background-size:cover;
                  background-position:center;">
      </div>
      <h3>${product.name}</h3>
      <p class="brand">${product.brand}</p>
      <p class="price">$${product.price.toLocaleString()}</p>
      <button>Agregar al carrito</button>
    </article>
  `;
}
