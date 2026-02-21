document.addEventListener("DOMContentLoaded", async () => {

  const container = document.querySelector(".product-container");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = "<h2>ID inválido o no especificado</h2>";
    return;
  }

  try {

    const response = await fetch(
      `https://dango.gonzamansilla0149.workers.dev/api/products/${id}`
    );

    const product = await response.json();

    if (!product || !product.id) {
      container.innerHTML = "<h2>Producto no encontrado</h2>";
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
    price.textContent = `$${Number(product.price).toLocaleString()}`;
    description.textContent = product.description;
    breadcrumb.textContent = product.name;

    // IMAGEN
    if (product.image_url) {
      mainImage.style.backgroundImage = `url(${product.image_url})`;
      mainImage.style.backgroundSize = "cover";
      mainImage.style.backgroundPosition = "center";
      mainImage.style.backgroundRepeat = "no-repeat";
    }

  } catch (err) {
    console.error("Error cargando producto:", err);
    container.innerHTML = "<h2>Error cargando producto</h2>";
  }

});
