// 벤치: Neon DB 스키마 + 데이터 자체 덤프 (pg_dump/psql 미설치 환경 대체)
// - information_schema/pg_catalog로 DDL 재구성 → schema.sql
// - 테이블별 SELECT * → data/<table>.csv
// - row count, DB 총 용량, 인덱스 목록 → db-info.md
// 실행: node baseline/scripts/db-dump.js
const path = require("path");
const fs = require("fs");

const backendModules = (m) => require(path.join(__dirname, "..", "..", "backend", "node_modules", m));
backendModules("dotenv").config({ path: path.join(__dirname, "..", "..", "backend", ".env") });
const { Client } = backendModules("pg");

const OUT_DIR = path.join(__dirname, "..", "db-dump");
const DATA_DIR = path.join(OUT_DIR, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  let s;
  if (value instanceof Date) s = value.toISOString();
  else if (typeof value === "object") s = JSON.stringify(value);
  else s = String(value);
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const { rows: tables } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  let schemaSql = `-- Mapl v1 baseline 스키마 덤프 (information_schema 기반 재구성, pg_dump 미사용)\n-- 생성: ${new Date().toISOString()}\n\n`;
  const dbInfoLines = [`# DB 정보 (baseline)\n`, `측정: ${new Date().toISOString()} / 도구: Node 자체 스크립트(information_schema, pg_catalog)\n`];

  // DB 총 용량
  const { rows: sizeRows } = await client.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS size`);
  dbInfoLines.push(`\n## DB 총 용량\n\n- ${sizeRows[0].size} [②관측확인]\n`);

  dbInfoLines.push(`\n## 테이블별 row 수\n\n| 테이블 | row 수 |\n| --- | --- |\n`);

  for (const { table_name } of tables) {
    // 컬럼 정의
    const { rows: cols } = await client.query(
      `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name=$1
       ORDER BY ordinal_position`,
      [table_name]
    );

    // 기본키
    const { rows: pk } = await client.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='PRIMARY KEY'
       ORDER BY kcu.ordinal_position`,
      [table_name]
    );

    // 외래키
    const { rows: fk } = await client.query(
      `SELECT
         kcu.column_name,
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
       WHERE tc.table_schema='public' AND tc.table_name=$1 AND tc.constraint_type='FOREIGN KEY'`,
      [table_name]
    );

    const colLines = cols.map((c) => {
      let type = c.data_type;
      if (c.character_maximum_length) type += `(${c.character_maximum_length})`;
      const nullable = c.is_nullable === "NO" ? "NOT NULL" : "";
      const def = c.column_default ? `DEFAULT ${c.column_default}` : "";
      return `  ${c.column_name} ${type} ${nullable} ${def}`.replace(/\s+/g, " ").trim();
    });
    if (pk.length) colLines.push(`  PRIMARY KEY (${pk.map((r) => r.column_name).join(", ")})`);
    for (const f of fk) {
      colLines.push(`  FOREIGN KEY (${f.column_name}) REFERENCES ${f.foreign_table_name}(${f.foreign_column_name})`);
    }
    schemaSql += `CREATE TABLE ${table_name} (\n${colLines.join(",\n")}\n);\n\n`;

    // 데이터 export
    const { rows: data } = await client.query(`SELECT * FROM "${table_name}"`);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvLines = [headers.join(",")];
      for (const row of data) {
        csvLines.push(headers.map((h) => csvEscape(row[h])).join(","));
      }
      fs.writeFileSync(path.join(DATA_DIR, `${table_name}.csv`), csvLines.join("\n") + "\n", "utf8");
    } else {
      fs.writeFileSync(path.join(DATA_DIR, `${table_name}.csv`), "", "utf8");
    }
    dbInfoLines.push(`| ${table_name} | ${data.length} |\n`);
    console.log(`${table_name}: ${cols.length}개 컬럼, ${data.length}행 export 완료`);
  }

  // 인덱스 목록
  const { rows: indexes } = await client.query(
    `SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname`
  );
  dbInfoLines.push(`\n## 인덱스 목록\n\n| 테이블 | 인덱스명 | 정의 |\n| --- | --- | --- |\n`);
  for (const idx of indexes) {
    dbInfoLines.push(`| ${idx.tablename} | ${idx.indexname} | \`${idx.indexdef}\` |\n`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "schema.sql"), schemaSql, "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "db-info.md"), dbInfoLines.join(""), "utf8");

  await client.end();
  console.log(`\n완료: ${tables.length}개 테이블 → baseline/db-dump/`);
}

main().catch((e) => {
  console.error("db-dump 실패:", e.message);
  process.exit(1);
});
