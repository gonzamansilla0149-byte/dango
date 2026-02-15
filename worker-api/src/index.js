export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://dangotools.com",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Manejo preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {

      // =========================
      // GET PRODUCTOS
      // =========================
      if (request.method === "GET" && url.pathname === "/api/products") {

        const { results } = await env.DB
          .prepare("SELECT * FROM products WHERE active = 1 ORDER BY id DESC")
          .all();

        return new Response(JSON.stringify(results), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
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
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
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
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response("Not found", { status: 404 });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};
