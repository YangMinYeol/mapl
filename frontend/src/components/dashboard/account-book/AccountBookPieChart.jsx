import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ACCOUNT_TYPE } from "../../../util/accountBookUtil";

export function AccountBookPieChart({ dashboardDatas }) {
  const [type, setType] = useState(ACCOUNT_TYPE.INCOME);
  const title = type === ACCOUNT_TYPE.INCOME ? "수입" : "지출";
  const data = groupByCategory(dashboardDatas.filter((item) => item.type === type));
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      <div className="ledger-chart-toolbar">
        <p className="ledger-chart-scope">선택한 기간 전체 기준</p>
        <div className="ledger-filters" role="group" aria-label="차트 거래 유형">
          <button type="button" aria-pressed={type === ACCOUNT_TYPE.INCOME} onClick={() => setType(ACCOUNT_TYPE.INCOME)}>수입</button>
          <button type="button" aria-pressed={type === ACCOUNT_TYPE.EXPENSE} onClick={() => setType(ACCOUNT_TYPE.EXPENSE)}>지출</button>
        </div>
      </div>
      <div className="ledger-charts">
        <PieChartSection title={title} data={data} totalValue={totalValue} />
        <div key={type} className="ledger-chart-slot ledger-chart-categories" role="region" aria-label={`${title} 카테고리별 금액과 비중`} tabIndex={0}>
          {data.length === 0 ? <p className="ledger-chart-empty">표시할 카테고리가 없어요.</p> : (
            <ul>
              {data.map(({ id, name, value, colorHex }) => (
                <li key={id}>
                  <span><i style={{ backgroundColor: colorHex }} aria-hidden="true" />{name}</span>
                  <span>{value.toLocaleString("ko-KR")}원 · {formatShare(value, totalValue)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function PieChartSection({ title, data, totalValue }) {
  if (totalValue === 0) {
    return <p className="ledger-chart-slot ledger-chart-empty">{data.length === 0 ? `${title} 내역이 없어요.` : "집계 금액이 없어요."}</p>;
  }
  return (
    <div className="ledger-chart-slot relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="92%"
            innerRadius="46%"
            stroke="#ffffff"
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((item) => (
              <Cell key={item.id} fill={item.colorHex} />
            ))}
          </Pie>
          <Tooltip isAnimationActive={false} content={(props) => (
            <PieTooltip {...props} totalValue={totalValue} />
          )} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieTooltip({ active, payload, totalValue }) {
  if (!active || !payload?.length) return null;
  const { name, value, colorHex } = payload[0].payload;
  return (
    <div className="planner-tooltip">
      <strong><i style={{ backgroundColor: colorHex }} />{name}</strong>
      <div>금액 · {value.toLocaleString()}원</div>
      <div>비중 · {formatShare(value, totalValue)}%</div>
    </div>
  );
}

function formatShare(value, total) {
  return total ? (value / total * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "0";
}

// 카테고리 그룹화
function groupByCategory(items) {
  const map = new Map();

  for (const { categoryId, categoryName, amount, colorHex } of items) {
    if (!map.has(categoryId)) {
      map.set(categoryId, { id: categoryId, name: categoryName, value: amount, colorHex });
    } else {
      map.get(categoryId).value += amount;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}
