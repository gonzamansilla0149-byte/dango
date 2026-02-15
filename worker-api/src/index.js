export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // GET PRODUCTOS
    // =========================
    if (request.method === "GET" && url.pathname === "/api/products") {

      const { results } = await env.DB
        .prepare("SELECT * FROM products WHERE active = 1 ORDER BY id DESC")
        .all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // =========================
    // CREAR PRODUCTO
    // =========================
    if (request.method === "POST" && url.pathname === "/api/products") {

      const data = await request.json();

      await env.DB.prepare(`
        INSERT INTO products
        (name, price, description, category, brand, model, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        data.name,
        data.price,
        data.description,
        data.category,
        data.brand,
        data.model || "",
        data.stock,
        data.image_url
      )
      .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // =========================
    // ELIMINAR PRODUCTO
    // =========================
    if (request.method === "DELETE" && url.pathname.startsWith("/api/products/")) {

      const id = url.pathname.split("/").pop();

      await env.DB.prepare(`
        UPDATE products
        SET active = 0
        WHERE id = ?
      `)
      .bind(id)
      .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
