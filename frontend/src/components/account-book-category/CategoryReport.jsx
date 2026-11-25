import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ACCOUNT_TYPE } from "../../util/accountBookUtil";
import { CategoryOrderRow } from "./AccountBookCategoryItem";

const won = new Intl.NumberFormat("ko-KR");
export default function CategoryReport({ categories, totals, type, onEdit, monthlyError, onRetry }) {
  const [ring, setRing] = useState(null);
  const label = type === ACCOUNT_TYPE.EXPENSE ? "지출" : "수입";
  const items = categories.map(category => ({
    category,
    amount: totals?.get(category.id) ?? 0,
    color: category.colorHex || "#517363",
  }));
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const segments = items
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.category.id - b.category.id)
    .map(item => ({ ...item, name: item.category.name }));

  return (
    <div className="report-panels">
      <div className="report-list">
        {items.length === 0 ? <p>카테고리가 없어요.</p> : (
          <ul className="report-ranking" tabIndex={0} aria-label={`${label} 카테고리 순서와 비중`}>
            {items.map(({ category, amount, color }) => (
              <CategoryOrderRow
                key={category.id}
                category={category}
                color={color}
                amount={totals ? amount : null}
                share={total ? amount / total * 100 : 0}
                onEdit={() => onEdit(category)}
              />
            ))}
          </ul>
        )}
      </div>
      <section className="report-summary" aria-label={`이번 달 ${label} 비중`}>
        <div className="report-caption">
          <h2>{label} 비중</h2>
          <small>{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}</small>
        </div>
        {!monthlyError && <div className="report-total"><small>총{label}</small><strong>{totals ? `${won.format(total)}원` : "—"}</strong></div>}
        {monthlyError ? <div className="report-chart-error" role="status">
          <p>이번 달 거래를 불러오지 못했어요.</p>
          <button className="category-button" type="button" onClick={onRetry}>다시 시도</button>
        </div> : <div className="report-ring" ref={setRing}>
          {segments.length > 0 && <ResponsiveContainer>
            <PieChart>
              <Pie data={segments} dataKey="amount" nameKey="name" innerRadius="72%" outerRadius="100%" stroke="none" isAnimationActive={false}>
                {segments.map(({ category, color }) => <Cell key={category.id} fill={color} />)}
              </Pie>
              <Tooltip portal={ring} isAnimationActive={false} content={({ active, payload }) => active && payload?.length ? (
                <div className="planner-tooltip"><strong>{payload[0].name}</strong><span>{won.format(payload[0].value)}원</span></div>
              ) : null} />
            </PieChart>
          </ResponsiveContainer>}
        </div>}
        {totals && total === 0 && <p>이번 달 {label} 내역이 없어요.</p>}
      </section>
    </div>
  );
}
