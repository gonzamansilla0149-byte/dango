document.addEventListener("DOMContentLoaded", () => {

  if (typeof products === "undefined") {
    document.querySelector(".product-container").innerHTML =
      "<h2>Error: products.js no está cargado</h2>";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  if (!id || isNaN(id)) {
    document.querySelector(".product-container").innerHTML =
      "<h2>ID inválido o no especificado</h2>";
    return;
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    document.querySelector(".product-container").innerHTML =
      "<h2>Producto no encontrado</h2>";
    return;
  }

  // ELEMENTOS
  const title = document.querySelector(".product-title");
  const brand = document.querySelector(".product-brand");
  const price = document.querySelector(".product-price");
  const description = document.querySelector(".product-description");
  const mainImage = document.querySelector(".main-image");
  const breadcrumb = document.querySelector(".breadcrumb-product");

  // RENDER
  title.textContent = product.name;
  brand.textContent = product.brand;
  price.textContent = `$${product.price.toLocaleString()}`;
  description.textContent = product.description;
  breadcrumb.textContent = product.name;

  // IMAGEN
  if (product.images && product.images.length > 0) {
    mainImage.style.backgroundImage = `url(${product.images[0]})`;
    mainImage.style.backgroundSize = "cover";
    mainImage.style.backgroundPosition = "center";
  }

});
