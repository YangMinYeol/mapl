import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ACCOUNT_TYPE } from "../../../util/accountBookUtil";

export function AccountBookPieChart({ dashboardDatas }) {
  const { incomeItems, expenseItems } = splitByType(dashboardDatas);
  const expenseChartData = groupByCategory(expenseItems);
  const incomeChartData = groupByCategory(incomeItems);

  return (
    <div className="flex items-center justify-center">
      <div className="w-1/2 h-[220px]">
        <PieChartSection title={"수입"} data={incomeChartData} />
      </div>
      <div className="w-1/2 h-[220px]">
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
      <div className="flex items-center justify-center pt-2 font-semibold text-gray-700">
        {title}
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-[190px] text-gray-400">
          <div className="text-center">
            <div className="text-sm">{title} 데이터가 없습니다</div>
          </div>
        </div>
      ) : (
        <div className="relative group h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.colorHex} />
                ))}
                <Tooltip
                  content={(props) => (
                    <PieTooltip {...props} totalValue={totalValue} />
                  )}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function PieTooltip({ active, payload, totalValue }) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const percent = ((value / totalValue) * 100).toFixed(2);

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#333",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div>
          <strong>{name}</strong>
        </div>
        <div>{`금액: ${value.toLocaleString()}원`}</div>
        <div>{`퍼센트: ${percent}%`}</div>
      </div>
    );
  }
  return null;
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
