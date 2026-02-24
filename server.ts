import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("sports_management.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS athletes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento TEXT,
    sexo TEXT,
    whatsapp TEXT,
    peso REAL,
    altura REAL,
    tam_kimono TEXT,
    num_calcado TEXT,
    foto_url TEXT,
    lado_dominante TEXT,
    graduacao_faixa TEXT,
    numero_nis TEXT,
    
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    
    escola TEXT,
    serie_ano TEXT,
    turno_estudo TEXT,
    
    restricao_medica TEXT,
    possui_alergias TEXT,
    tipo_sanguineo TEXT,
    contato_emergencia_nome TEXT,
    contato_emergencia_tel TEXT,
    
    responsavel_legal TEXT,
    responsavel_cpf TEXT,
    termo_aceite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/register", (req, res) => {
    try {
      const data = req.body;
      const stmt = db.prepare(`
        INSERT INTO athletes (
          nome_completo, cpf, data_nascimento, sexo, whatsapp, peso, altura, tam_kimono, num_calcado, foto_url,
          lado_dominante, graduacao_faixa, numero_nis,
          logradouro, numero, bairro, cidade, uf,
          escola, serie_ano, turno_estudo,
          restricao_medica, possui_alergias, tipo_sanguineo, contato_emergencia_nome, contato_emergencia_tel,
          responsavel_legal, responsavel_cpf, termo_aceite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.nome_completo, data.cpf, data.data_nascimento, data.sexo, data.whatsapp, data.peso, data.altura, data.tam_kimono, data.num_calcado, data.foto_url,
        data.lado_dominante, data.graduacao_faixa, data.numero_nis,
        data.logradouro, data.numero, data.bairro, data.cidade, data.uf,
        data.escola, data.serie_ano, data.turno_estudo,
        data.restricao_medica, data.possui_alergias, data.tipo_sanguineo, data.contato_emergencia_nome, data.contato_emergencia_tel,
        data.responsavel_legal, data.responsavel_cpf, data.termo_aceite ? 1 : 0
      );

      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/athletes", (req, res) => {
    try {
      const athletes = db.prepare("SELECT * FROM athletes ORDER BY created_at DESC").all();
      res.json(athletes);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete("/api/athletes/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM athletes WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
