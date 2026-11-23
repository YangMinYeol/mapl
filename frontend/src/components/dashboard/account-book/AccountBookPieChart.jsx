import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ACCOUNT_TYPE } from "../../../util/accountBookUtil";

export function AccountBookPieChart({ dashboardDatas }) {
  const { incomeItems, expenseItems } = splitByType(dashboardDatas);
  const expenseChartData = groupByCategory(expenseItems);
  const incomeChartData = groupByCategory(incomeItems);

  return (
    <div className="ledger-charts">
      <div>
        <PieChartSection title={"수입"} data={incomeChartData} />
      </div>
      <div>
        <PieChartSection title={"지출"} data={expenseChartData} />
      </div>
    </div>
  );
}

function PieChartSection({ title, data }) {
  const isEmpty = data.length === 0;
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <>
      <div className="ledger-chart-label">
        {title}
      </div>

      {isEmpty ? (
        <div className="ledger-chart-slot grid place-items-center text-gray-500">
          <div className="text-center">
            <div className="text-sm">{title} 데이터가 없습니다</div>
          </div>
        </div>
      ) : (
        <div className="ledger-chart-slot relative group">
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
                  <Cell key={item.name} fill={item.colorHex} />
                ))}
              </Pie>
              <Tooltip isAnimationActive={false} content={(props) => (
                <PieTooltip {...props} totalValue={totalValue} />
              )} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function PieTooltip({ active, payload, totalValue }) {
  if (!active || !payload?.length) return null;
  const { name, value, colorHex } = payload[0].payload;
  const percent = totalValue ? (value / totalValue * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : 0;
  return (
    <div className="planner-tooltip">
      <strong><i style={{ backgroundColor: colorHex }} />{name}</strong>
      <div>금액 · {value.toLocaleString()}원</div>
      <div>비중 · {percent}%</div>
    </div>
  );
}

// 타입에 따른 데이터 분리
function splitByType(items) {
  return items.reduce(
    (acc, item) => {
      if (item.type === ACCOUNT_TYPE.INCOME) acc.incomeItems.push(item);
      else if (item.type === ACCOUNT_TYPE.EXPENSE) acc.expenseItems.push(item);
      return acc;
    },
    { incomeItems: [], expenseItems: [] }
  );
}

// 카테고리 그룹화
function groupByCategory(items) {
  const map = new Map();

  for (const { categoryName, amount, colorHex } of items) {
    if (!map.has(categoryName)) {
      map.set(categoryName, { name: categoryName, value: amount, colorHex });
    } else {
      map.get(categoryName).value += amount;
    }
  }

  return Array.from(map.values());
}
