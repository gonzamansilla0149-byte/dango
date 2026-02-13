const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

if (!id) {
  console.log("No hay ID en la URL");
}

const product = products.find(p => p.id === id);

if (!product) {
  console.log("Producto no encontrado");
}

if (product) {

  // ELEMENTOS
  const title = document.querySelector(".product-title");
  const brand = document.querySelector(".product-brand");
  const price = document.querySelector(".product-price");
  const description = document.querySelector(".product-description");
  const mainImage = document.querySelector(".main-image");
  const breadcrumb = document.querySelector(".breadcrumb-product");
  const addBtn = document.querySelector(".add-to-cart-btn");
  const quantityInput = document.querySelector(".quantity-selector input");

  // RENDER DATOS
  if (title) title.textContent = product.name;
  if (brand) brand.textContent = product.brand;
  if (price) price.textContent = `$${product.price.toLocaleString()}`;
  if (description) description.textContent = product.description;
  if (breadcrumb) breadcrumb.textContent = product.name;

  // IMAGEN
  if (mainImage && product.images.length > 0) {
    mainImage.style.backgroundImage = `url(${product.images[0]})`;
    mainImage.style.backgroundSize = "cover";
    mainImage.style.backgroundPosition = "center";
  }

  // AGREGAR AL CARRITO
  if (addBtn) {
    addBtn.addEventListener("click", () => {

      const quantity = parseInt(quantityInput?.value) || 1;

      const item = {
        id: product.id,
        name: product.name,
        price: `$${product.price.toLocaleString()}`,
        quantity: quantity
      };

      cart.push(item);
      updateCartCount();

      alert("Producto agregado al carrito");
    });
  }

}
