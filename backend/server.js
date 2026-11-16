const path = require("path");
const fs = require("fs");

// Cargar variables de entorno desde backend/.env o desde la raíz si existe
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS amplia para permitir peticiones locales y desde producción
app.use(cors({
  origin: true,
  credentials: true
}));

// Configuración de conexión a PostgreSQL
// En Render.com se provee automáticamente DATABASE_URL (con SSL requerido).
// En local se toman las variables de .env individuales.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_DATABASE || "personajes",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// Función para inicializar tablas y datos iniciales en PostgreSQL si no existen
async function inicializarBaseDatos() {
  try {
    const rutaSql = path.join(__dirname, "..", "crear_base_datos_personajes.sql");
    if (fs.existsSync(rutaSql)) {
      const check = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'personajes'
        ) as existe;
      `);

      if (!check.rows[0].existe) {
        const sql = fs.readFileSync(rutaSql, "utf-8");
        await pool.query(sql);
        console.log("🐘 Base de datos inicializada desde cero con éxito.");
      } else {
        const countRes = await pool.query("SELECT COUNT(*) FROM personajes;");
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          const sql = fs.readFileSync(rutaSql, "utf-8");
          await pool.query(sql);
          console.log("🐘 Tablas creadas y personajes insertados con éxito.");
        } else {
          console.log(`🐘 Base de datos lista (${countRes.rows[0].count} personajes existentes).`);
        }
      }
    }
  } catch (error) {
    console.warn("Aviso al inicializar base de datos:", error.message);
  }
}

// Servir archivos estáticos del frontend (HTML, CSS, JS, imágenes, etc.)
const rutaFrontend = path.join(__dirname, "..");
app.use(express.static(rutaFrontend));

// Endpoint de estado de la API
app.get("/api", (req, res) => {
  res.json({
    estado: "ok",
    mensaje: "Backend de consulta funcionando.",
    entorno: process.env.DATABASE_URL ? "Producción (Render / Cloud)" : "Desarrollo Local"
  });
});

// Endpoint para forzar la inicialización/revisión de la BD
app.get("/api/init-db", async (req, res) => {
  try {
    await inicializarBaseDatos();
    res.json({ mensaje: "Base de datos inicializada correctamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Consulta de personajes desde PostgreSQL mediante INNER JOIN con especies
app.get("/api/personajes", async (req, res) => {
  try {
    const consulta = `
      SELECT
          p.personaje_id AS id,
          p.nombre,
          p.ocupacion,
          p.descripcion,
          p.imagen AS image,
          e.nombre AS especie
      FROM personajes AS p
      INNER JOIN especies AS e
          ON p.especie_id = e.especie_id
      ORDER BY p.personaje_id;
    `;
    const resultado = await pool.query(consulta);
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar personajes:", error.message);
    res.status(500).json({ mensaje: "Error al consultar la base de datos PostgreSQL.", detalle: error.message });
  }
});

// Consulta dos tablas relacionadas mediante INNER JOIN (demo productos)
app.get("/api/productos", async (req, res) => {
  try {
    const consulta = `
      SELECT
          p.producto_id,
          p.nombre,
          p.descripcion,
          p.precio,
          c.nombre AS categoria
      FROM demo_productos AS p
      INNER JOIN demo_categorias AS c
          ON p.categoria_id = c.categoria_id
      ORDER BY p.nombre;
    `;
    const resultado = await pool.query(consulta);
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al consultar productos:", error.message);
    res.status(500).json({ mensaje: "Error al consultar la base de datos." });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Planet Express escuchando en el puerto ${PORT}`);
  await inicializarBaseDatos();
});
