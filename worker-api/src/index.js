const ADMIN_USER = "dango4545";
const ADMIN_PASS = "4358dango2525";
const ADMIN_TOKEN = "DANGO_ADMIN_TOKEN_2025_SECURE";

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://dangotools.com",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    // =========================
    // CORS PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // =========================
    // ADMIN LOGIN
    // =========================
    if (request.method === "POST" && url.pathname === "/api/admin-login") {

      const body = await request.json();

      if (
        body.username === ADMIN_USER &&
        body.password === ADMIN_PASS
      ) {
        return new Response(JSON.stringify({
          token: ADMIN_TOKEN,
          role: "admin"
        }), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      return new Response(JSON.stringify({
        error: "Credenciales incorrectas"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    // =========================
    // VERIFICAR TOKEN
    // =========================
    function verifyAdmin(request) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader) return false;

      const token = authHeader.replace("Bearer ", "");
      return token === ADMIN_TOKEN;
    }

    try {

// =========================
// GET CATEGORIES
// =========================
if (request.method === "GET" && url.pathname === "/api/categories") {

  const { results } = await env.DB.prepare(`
    SELECT * FROM categories ORDER BY name ASC
  `).all();

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// CREATE CATEGORY (ADMIN)
// =========================
if (request.method === "POST" && url.pathname === "/api/categories") {

  if (!verifyAdmin(request)) {
    return new Response("No autorizado", { status: 401, headers: corsHeaders });
  }

  const data = await request.json();

  await env.DB.prepare(`
    INSERT INTO categories (name)
    VALUES (?)
  `)
  .bind(data.name)
  .run();

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// GET SUBCATEGORIES
// =========================
if (
  request.method === "GET" &&
  url.pathname.startsWith("/api/categories/") &&
  url.pathname.endsWith("/subcategories")
) {

  const parts = url.pathname.split("/");
  const categoryId = parts[3];

  const { results } = await env.DB.prepare(`
    SELECT * FROM subcategories
    WHERE category_id = ?
    ORDER BY name ASC
  `)
  .bind(categoryId)
  .all();

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// CREATE SUBCATEGORY
// =========================
if (request.method === "POST" && url.pathname === "/api/subcategories") {

  if (!verifyAdmin(request)) {
    return new Response("No autorizado", { status: 401, headers: corsHeaders });
  }

  const data = await request.json();

  await env.DB.prepare(`
    INSERT INTO subcategories (name, category_id)
    VALUES (?, ?)
  `)
  .bind(data.name, data.category_id)
  .run();

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// GET BRANDS
// =========================
if (request.method === "GET" && url.pathname === "/api/brands") {

  const { results } = await env.DB.prepare(`
    SELECT * FROM brands ORDER BY name ASC
  `).all();

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// CREATE BRAND
// =========================
if (request.method === "POST" && url.pathname === "/api/brands") {

  if (!verifyAdmin(request)) {
    return new Response("No autorizado", { status: 401, headers: corsHeaders });
  }

  const data = await request.json();

  await env.DB.prepare(`
    INSERT INTO brands (name)
    VALUES (?)
  `)
  .bind(data.name)
  .run();

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
// =========================
// GET PRODUCTS (PÚBLICO)
// =========================
if (request.method === "GET" && url.pathname === "/api/products") {

  const search = url.searchParams.get("search");

let query = `
SELECT 
  p.*,
  c.name as category_name,
  s.name as subcategory_name,
  b.name as brand_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories s ON p.subcategory_id = s.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.active = 1
`;

  if (search) {
    query += `
      AND (
        name LIKE ? OR
        b.name LIKE ? OR
        c.name LIKE ?
      )
    `;
  }

  query += " ORDER BY id DESC";

  let stmt = env.DB.prepare(query);

  if (search) {
    const term = `%${search}%`;
    stmt = stmt.bind(term, term, term);
  }

  const { results } = await stmt.all();

  return new Response(JSON.stringify(results), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

// =========================
// GET PRODUCT BY ID (PÚBLICO)
// =========================
if (request.method === "GET" && url.pathname.startsWith("/api/products/")) {

  const id = url.pathname.split("/").pop();

  const product = await env.DB.prepare(`
    SELECT * FROM products
    WHERE id = ? AND active = 1
  `)
  .bind(id)
  .first();

  return new Response(JSON.stringify(product || {}), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

      // =========================
      // CREATE PRODUCT
      // =========================
      if (request.method === "POST" && url.pathname === "/api/products") {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

        const data = await request.json();

        await env.DB.prepare(`
INSERT INTO products
(name, price, description, category_id, subcategory_id, brand_id, stock, image_url, active)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `)
 .bind(
  data.name,
  data.price,
  data.description,
  data.category_id,
  data.subcategory_id,
  data.brand_id,
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
      // UPDATE PRODUCT
      // =========================
      if (request.method === "PUT" && url.pathname.startsWith("/api/products/")) {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

        const id = url.pathname.split("/").pop();
        const data = await request.json();

        await env.DB.prepare(`
UPDATE products
SET name = ?, brand_id = ?, price = ?, description = ?, image_url = ?, stock = ?
          WHERE id = ?
        `)
.bind(
  data.name,
  data.brand_id,
  data.price,
  data.description,
  data.image_url,
  data.stock,
  id
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
      // DELETE PRODUCT
      // =========================
      if (request.method === "DELETE" && url.pathname.startsWith("/api/products/")) {

        if (!verifyAdmin(request)) {
          return new Response("No autorizado", {
            status: 401,
            headers: corsHeaders
          });
        }

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
