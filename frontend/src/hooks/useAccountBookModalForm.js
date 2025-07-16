import { useEffect, useState } from "react";
import useCategoryStore from "../stores/useCategoryStore";
import { ACCOUNTBOOK_MODAL_MODE, ACCOUNT_TYPE } from "../util/accountBookUtil";
import { extractDateAndTime } from "../util/dateUtil";

export function useAccountBookModalForm({ mode, selectedDate, isOpen, item }) {
  const [type, setType] = useState(ACCOUNT_TYPE.EXPENSE);
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState("12:00");
  const [category, setCategory] = useState();
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState(0);
  const [isAmountError, setIsAmountError] = useState(false);

  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { incomeCategories, expenseCategories } = useCategoryStore();

  const categories =
    type === ACCOUNT_TYPE.INCOME ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (mode === ACCOUNTBOOK_MODAL_MODE.ADD) {
      setType(ACCOUNT_TYPE.EXPENSE);
      setDate(selectedDate);
      setTime("12:00");
      setCategory(categories[0]);
      setContent("");
      setAmount(0);
      setIsAmountError(false);
    } else if (mode === ACCOUNTBOOK_MODAL_MODE.EDIT && item) {
      const { date: itemDate, time: itemTime } = extractDateAndTime(
        item.occurredAt
      );
      const itemCategory = categories.find((c) => c.id === item.categoryId);
      setDate(itemDate);
      setTime(itemTime);
      setType(item.type);
      setCategory(itemCategory);
      setContent(item.content);
      setAmount(item.amount);
      setIsAmountError(false);
    }
  }, [mode, isOpen]);

  return {
    type,
    setType,
    date,
    setDate,
    time,
    setTime,
    category,
    setCategory,
    content,
    setContent,
    amount,
    setAmount,
    isAmountError,
    setIsAmountError,
    showDateSelect,
    setShowDateSelect,
    showTimeSelect,
    setShowTimeSelect,
    categories,
    isLoading,
    setIsLoading,
  };
}
