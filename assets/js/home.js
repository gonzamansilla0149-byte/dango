const featuredContainer = document.getElementById("featured-products");
const herramientasContainer = document.getElementById("home-herramientas");

if (featuredContainer) {
  const featuredProducts = products.filter(p => p.featured);

  featuredProducts.forEach(product => {
    featuredContainer.innerHTML += createProductCard(product);
  });
}

if (herramientasContainer) {
  const herramientas = products.filter(p => p.category === "herramientas");

  herramientas.forEach(product => {
    herramientasContainer.innerHTML += createProductCard(product);
  });
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-image" 
           style="background-image:url('${product.images[0]}');
                  background-size:cover;
                  background-position:center;">
      </div>
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toLocaleString()}</p>
      <a href="producto.html?id=${product.id}">Ver producto</a>
    </article>
  `;
}

