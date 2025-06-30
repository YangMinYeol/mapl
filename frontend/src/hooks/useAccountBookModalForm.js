import { useEffect, useState } from "react";
import useCategoryStore from "../stores/useCategoryStore";
import {
  ACCOUNTBOOK_MODAL_MODE,
  FILTER_TYPE_VALUE,
} from "../util/accountBookUtil";

export function useAccountBookModalForm({
  mode,
  selectedDate,
  isOpen,
  accountBook,
}) {
  const [type, setType] = useState(FILTER_TYPE_VALUE.INCOME);
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
    type === FILTER_TYPE_VALUE.INCOME ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (mode === ACCOUNTBOOK_MODAL_MODE.CREATE) {
      setType(FILTER_TYPE_VALUE.INCOME);
      setDate(selectedDate);
      setTime("12:00");
      setCategory(categories[0]);
      setContent("");
      setAmount(0);
      setIsAmountError(false);
    } else if (mode === ACCOUNTBOOK_MODAL_MODE.EDIT && accountBook) {
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
