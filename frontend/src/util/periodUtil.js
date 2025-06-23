const displayNameMap = {
  memo: {
    Other: "Bucket List",
    Day: "Day",
    Week: "Week",
    Month: "Month",
    Year: "Year",
  },
  accountBook: {
    Other: "Total",
    Day: "Day",
    Week: "Week",
    Month: "Month",
    Year: "Year",
  },
};

export function getPeriodDisplayName(periodName, domain) {
  return displayNameMap[domain]?.[periodName] || periodName;
}
