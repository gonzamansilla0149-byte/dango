const ADMIN_USER = "dango4545";
const ADMIN_PASS = "4358dango2525";
const ADMIN_TOKEN = "DANGO_ADMIN_TOKEN_2025_SECURE";

export default {
  async fetch(request, env) {

const url = new URL(request.url);

// =========================
// ADMIN INDEX FIX
// =========================
if (request.method === "GET" && (url.pathname === "/admin" || url.pathname === "/admin/")) {
  url.pathname = "/admin/index.html";
  return fetch(url.toString(), request);
}

// =========================
// DEJAR PASAR TODO LO QUE NO SEA API
// =========================
if (
  request.method === "GET" &&
  !url.pathname.startsWith("/api/")
) {
  return fetch(request);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
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
// CUSTOMER REGISTER
// =========================
if (request.method === "POST" && url.pathname === "/api/register") {

  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return new Response(JSON.stringify({
      error: "Faltan campos"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  try {
    await env.DB.prepare(`
      INSERT INTO customers (name, email, password)
      VALUES (?, ?, ?)
    `)
    .bind(name, email, hashedPassword)
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "El email ya está registrado"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}


// =========================
// CUSTOMER LOGIN
// =========================
if (request.method === "POST" && url.pathname === "/api/login") {

  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({
      error: "Faltan campos"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  const user = await env.DB.prepare(`
    SELECT * FROM customers
    WHERE email = ? AND password = ?
  `)
  .bind(email, hashedPassword)
  .first();

  if (!user) {
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

  const token = crypto.randomUUID();

  return new Response(JSON.stringify({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }), {
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
// DELETE CATEGORY (ADMIN)
// =========================
if (
  request.method === "DELETE" &&
  url.pathname.startsWith("/api/categories/")
) {

  if (!verifyAdmin(request)) {
    return new Response("No autorizado", { status: 401, headers: corsHeaders });
  }

  const id = url.pathname.split("/").pop();

  await env.DB.prepare(`
    DELETE FROM categories
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
// DELETE BRAND (ADMIN)
// =========================
if (
  request.method === "DELETE" &&
  url.pathname.startsWith("/api/brands/")
) {

  if (!verifyAdmin(request)) {
    return new Response("No autorizado", { status: 401, headers: corsHeaders });
  }

  const id = url.pathname.split("/").pop();

  await env.DB.prepare(`
    DELETE FROM brands
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
        p.name LIKE ? OR
        b.name LIKE ? OR
        c.name LIKE ?
      )
    `;
}
  query += " ORDER BY p.id DESC";
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
SELECT 
  p.*,
  c.name as category_name,
  s.name as subcategory_name,
  b.name as brand_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories s ON p.subcategory_id = s.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.id = ? AND p.active = 1
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

  const formData = await request.formData();

  const name = formData.get("name");
  const price = formData.get("price");
  const description = formData.get("description");
  const category_id = formData.get("category_id");
  const subcategory_id = formData.get("subcategory_id");
  const brand_id = formData.get("brand_id");
  const stock = formData.get("stock");

  // 1️⃣ Crear producto primero
  const result = await env.DB.prepare(`
    INSERT INTO products
    (name, price, description, category_id, subcategory_id, brand_id, stock, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `)
  .bind(name, price, description, category_id, subcategory_id, brand_id, stock)
  .run();

  const productId = result.meta.last_row_id;

  // 2️⃣ Procesar archivos
  const files = formData.getAll("media[]");

  for (let i = 0; i < files.length; i++) {

    const file = files[i];
    const extension = file.name.split(".").pop();
    const key = `products/${productId}/${crypto.randomUUID()}.${extension}`;

    // Guardar en R2
    await env.PRODUCTS_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type
      }
    });

    const url = `https://YOUR_DOMAIN_R2_PUBLIC/${key}`;

    // Guardar en DB
    await env.DB.prepare(`
      INSERT INTO product_media (product_id, url, type, position)
      VALUES (?, ?, ?, ?)
    `)
    .bind(productId, url, file.type.startsWith("video/") ? "video" : "image", i)
    .run();
  }

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
        const formData = await request.formData();

const data = {
  name: formData.get("name"),
  brand_id: formData.get("brand_id"),
  price: formData.get("price"),
  description: formData.get("description"),
  image_url: formData.get("image_url"),
  stock: formData.get("stock")
};

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
