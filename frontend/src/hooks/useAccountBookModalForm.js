import { useEffect, useState } from "react";
import useCategoryStore from "../stores/useCategoryStore";
import { ACCOUNTBOOK_MODAL_MODE, ACCOUNT_TYPE } from "../util/accountBookUtil";
import { extractDateAndTime } from "../util/dateUtil";
import { getDefaultTransactionTime } from "../util/timeUtil";

export function useAccountBookModalForm({ mode, selectedDate, isOpen, item }) {
  const [type, setType] = useState(ACCOUNT_TYPE.EXPENSE);
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState("12:00");
  const [hasTime, setHasTime] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState(0);
  const [isAmountError, setIsAmountError] = useState(false);

  const [showDateSelect, setShowDateSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { incomeCategories, expenseCategories } = useCategoryStore();

  const categories =
    type === ACCOUNT_TYPE.INCOME ? incomeCategories : expenseCategories;

  const category = categories.find((entry) => entry.id === categoryId) ?? categories[0];

  useEffect(() => {
    setShowDateSelect(false);
    if (!isOpen) return;
    if (mode === ACCOUNTBOOK_MODAL_MODE.ADD) {
      setType(ACCOUNT_TYPE.EXPENSE);
      setDate(selectedDate);
      setTime(getDefaultTransactionTime());
      setHasTime(true);
      setCategoryId(null);
      setContent("");
      setAmount(0);
      setIsAmountError(false);
    } else if (mode === ACCOUNTBOOK_MODAL_MODE.EDIT && item) {
      const { date: itemDate, time: itemTime } = extractDateAndTime(
        item.occurredAt
      );
      setDate(item.occurredDate ?? itemDate);
      setHasTime(item.hasTime !== false);
      setTime(item.hasTime === false ? getDefaultTransactionTime() : itemTime);
      setType(item.type);
      setCategoryId(item.categoryId);
      setContent(item.content);
      setAmount(item.amount);
      setIsAmountError(false);
    }
  }, [mode, isOpen, selectedDate, item]);

  return {
    type,
    setType,
    date,
    setDate,
    time,
    setTime,
    hasTime,
    setHasTime,
    category,
    setCategoryId,
    content,
    setContent,
    amount,
    setAmount,
    isAmountError,
    setIsAmountError,
    showDateSelect,
    setShowDateSelect,
    categories,
    isLoading,
    setIsLoading,
  };
}
