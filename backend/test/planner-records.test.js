const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

// UTC 서버에서 서울 기준 거래 날짜를 조회하는 환경을 재현한다.
process.env.TZ = "UTC";
const pg = new PGlite();
async function query(sql, params) {
  const result = await pg.query(sql, params);
  return { rows: result.rows, rowCount: result.affectedRows || result.rows.length };
}
// 모델을 불러오기 전에 실제 DB 연결 모듈을 테스트용 메모리 DB로 대체한다.
const dbPath = require.resolve("../db");
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true,
  exports: { query, connect: async () => ({ query, release() {} }) },
};
const memos = require("../model/memoModel");
const ledger = require("../model/accountBookModel");
const day = "2026-11-19";

before(async () => {
  // 마이그레이션 전 스키마를 재현하는 데 필요한 테이블과 샘플 데이터만 준비한다.
  await pg.exec(`
    CREATE TABLE color(id int PRIMARY KEY, hex text);
    INSERT INTO color VALUES (5, '#b7ddc9');
    CREATE TABLE memo(id serial PRIMARY KEY, user_id int, content text NOT NULL,
      start_date date, end_date date, start_time time, end_time time, allday boolean,
      period_id int, color_id int REFERENCES color, is_linked boolean, link int, completed boolean DEFAULT false);
    CREATE TABLE asset(id int PRIMARY KEY, user_id int, balance int, updated_at timestamp);
    INSERT INTO asset VALUES (1,1,100000,now()), (2,2,20000,now());
    CREATE TABLE account_book_category(id int PRIMARY KEY, user_id int, type text, name text, color_id int);
    INSERT INTO account_book_category VALUES (1,1,'expense','식비',5), (2,2,'income','급여',5);
    CREATE TABLE account_book(id serial PRIMARY KEY, user_id int, type text, occurred_at timestamp,
      category_id int, asset_id int, content text, amount numeric, created_at timestamp DEFAULT now());
    INSERT INTO account_book(user_id,type,occurred_at,category_id,asset_id,content,amount)
      VALUES (1,'expense','2026-11-18 15:00',1,1,'기존 자정 거래',200);
  `);
  // 실제 마이그레이션을 두 번 적용해 재실행해도 오류가 없는지 확인한다.
  const migration = fs.readFileSync(path.join(__dirname, "../migrations/001_account_book_has_time.sql"), "utf8");
  await pg.exec(migration);
  await pg.exec(migration);
});
after(() => pg.close());

test("여러 메모 중 한 건이 실패하면 앞선 메모도 롤백한다", async () => {
  const memo = { content: "일정", startDate: day, endDate: day, periodId: 1, isLinked: false };
  // 두 번째 메모에 존재하지 않는 색상 ID를 넣어 저장을 실패시킨다.
  await assert.rejects(memos.addMemo([memo, { ...memo, colorId: -1 }], 1));
  assert.deepEqual(await memos.getMemos(1, day), []);
});

test("연결 메모의 수정과 완료 상태를 같은 그룹에 반영한다", async () => {
  const memo = { content: "일정", startDate: day, endDate: day, periodId: 1, isLinked: false };
  const [parent] = await memos.addMemo([memo], 1);
  await memos.addMemo([{ ...memo, link: parent.id, isLinked: true }], 1);
  await memos.updateMemo({ ...memo, id: parent.id, content: "수정", allDay: true, colorId: 5 }, 1);
  await memos.toggleLinkedMemosCompletion(parent.id, 1);
  const group = await memos.getMemos(1, day);
  assert.equal(group.length, 2);
  assert.ok(group.every((item) => item.content === "수정" && item.completed));
  const child = group.find((item) => item.id !== parent.id);
  await memos.unlinkMemo(child.id, parent.id, 1);
  const separated = await memos.getMemos(1, day);
  assert.ok(separated.every((item) => !item.isLinked && item.link === item.id));
  await memos.deleteLinkedMemos(parent.id, 1);
  assert.deepEqual((await memos.getMemos(1, day)).map((item) => item.id), [child.id]);
});

test("기존 자정 거래와 시간 미지정 거래를 서울의 같은 날짜에서 구분한다", async () => {
  await ledger.addAccountBookItem(1, 1, "expense", day, 1, "날짜만", 1000, false);
  const list = await ledger.getDashboardAccountBooks(1, day, day, "Asia/Seoul");
  assert.equal(list.length, 2);
  const timed = list.find((item) => item.hasTime);
  assert.equal(timed.occurredAt.toISOString(), "2026-11-18T15:00:00.000Z");
  assert.equal(timed.occurredDate, null);
  const untimed = list.find((item) => !item.hasTime);
  assert.equal(untimed.occurredDate, day);
  const utc = await ledger.getDashboardAccountBooks(1, day, day, "UTC");
  assert.deepEqual(utc.map((item) => item.id), [untimed.id]);
  assert.deepEqual(await ledger.getCalendarAccountBooks(2, day, "Asia/Seoul"), []);

  const balance = async () => (await query("SELECT balance FROM asset WHERE id = 1")).rows[0].balance;
  await ledger.updateAccountBookItem(untimed.id, "expense", day, 1, "수정", 2100, false, 1);
  assert.equal(await balance(), 97900);
  await ledger.deleteAccountBookItem(untimed.id, 1);
  assert.equal(await balance(), 100000);
});
