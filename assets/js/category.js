const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

const container = document.getElementById("category-products");

if (category && container) {

  const filteredProducts = products.filter(p => p.category === category);

  filteredProducts.forEach(product => {
    container.innerHTML += createProductCard(product);
  });

}

function createProductCard(product) {
  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image"
           style="background-image:url('${product.images[0]}');
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
