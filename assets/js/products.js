const products = [];

const categories = ["herramientas", "celulares", "computacion", "accesorios"];

const brands = {
  herramientas: ["Bosch", "Makita", "DeWalt", "Black & Decker"],
  celulares: ["Samsung", "Xiaomi", "Motorola", "Apple"],
  computacion: ["HP", "Lenovo", "Dell", "Asus"],
  accesorios: ["Sony", "Logitech", "JBL", "Kingston"]
};

for (let i = 1; i <= 1000; i++) {

  const category = categories[i % categories.length];
  const brand = brands[category][i % brands[category].length];

  products.push({
    id: i,
    name: `${brand} ${category} Modelo ${i}`,
    price: 20000 + (i * 123),
    brand: brand,
    category: category,
    featured: i % 17 === 0,
    stock: 10 + (i % 50),
    description: `Producto ${i} de la categoría ${category}. Marca ${brand}. Ideal para uso profesional y doméstico.`,

    // Imagen placeholder profesional
    images: [
      `https://picsum.photos/seed/${i}/600/600`
    ]
  });

}
