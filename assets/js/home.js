document.addEventListener("DOMContentLoaded", async () => {

  const featuredContainer = document.getElementById("featured-products");
  const heroSection = document.querySelector(".hero");

  try {

const response = await fetch("/api/products");

    const products = await response.json();

    if (!products || products.length === 0) return;

    // ===============================
    // UTILIDADES
    // ===============================

    function shuffle(array) {
      return [...array].sort(() => 0.5 - Math.random());
    }

    function getTopBySales(list, limit = 5) {

      const withSales = list.filter(p => p.sales && p.sales > 0);

      if (withSales.length === 0) {
        return shuffle(list).slice(0, limit);
      }

      return withSales
        .sort((a, b) => b.sales - a.sales)
        .slice(0, limit);
    }

    const normalize = str => (str || "").toLowerCase().trim();
    
function renderProducts(container, list) {

  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  list.forEach(product => {

    const wrapper = document.createElement("div");
    wrapper.innerHTML = createProductCard(product);

    fragment.appendChild(wrapper.firstElementChild);
  });

  container.appendChild(fragment);
}

    // ===============================
    // TOP GLOBAL (DESTACADOS)
    // ===============================

    if (featuredContainer) {
      const topGlobal = getTopBySales(products, 5);
      renderProducts(featuredContainer, topGlobal);
    }

    // ===============================
    // TOP POR CATEGORÍA (DINÁMICO)
    // ===============================

    const categories = [
      "herramientas",
      "celulares",
      "computacion",
      "accesorios"
    ];

    categories.forEach(category => {

      const container = document.getElementById(`home-${category}`);
      if (!container) return;

      const filtered = products.filter(
        p => normalize(p.category_name) === normalize(category)
      );

      const topByCategory = getTopBySales(filtered, 5);

      renderProducts(container, topByCategory);

    });

    // ===============================
    // HERO DINÁMICO
    // ===============================

    if (heroSection) {

      const herramientas = products.filter(
        p => normalize(p.category_name) === "herramientas"
      );

      // 🔥 Construir lista de imágenes del hero
const heroImages = herramientas
  .map(p => {
    if (p.media && p.media[0] && p.media[0].type === "image") {
      return optimizeImage(p.media[0].url, 1600);
    }
    return null;
  })
  .filter(Boolean);

// 🔥 Precargar imágenes
heroImages.forEach(src => {
  const img = new Image();
  img.src = src;
});



let currentHeroIndex = 0;

function changeHeroBackground() {

  if (heroImages.length === 0) return;

  const image = heroImages[currentHeroIndex];

  heroSection.style.backgroundImage = `
    linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
    url('${image}')
  `;

  currentHeroIndex =
    (currentHeroIndex + 1) % heroImages.length;
}
changeHeroBackground();
setInterval(changeHeroBackground, 5000);

} // 👈 ESTE CIERRA el if (heroSection)

// ===============================
// CREAR CARD
// ===============================

function createProductCard(product) {

let image = "";

if (product.media && product.media.length > 0) {
  const firstMedia = product.media[0];

if (firstMedia.url) {
  image = optimizeImage(firstMedia.url, 400);
}
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
        <p class="price">$${Number(product.price).toLocaleString()}</p>
      </a>
    </article>
  `;
}

function optimizeImage(url, width = 800) {

  if (!url) return "";

  if (url.startsWith("http")) {
    const parsed = new URL(url);
    url = parsed.pathname;
  }

  // Normalizar para evitar // o media duplicado
  url = url.replace(/^\/+/, "");

  if (!url.startsWith("media/")) {
    url = "media/" + url;
  }

  return `/cdn-cgi/image/format=auto,quality=85,width=${width}/${url}`;
}


  } catch (err) {
    console.error("Error cargando home:", err);
  }

});
