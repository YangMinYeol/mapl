import Memo from "./Memo";
import TodoList from "./TodoList";
import PeriodSelector from "./PeriodSelector";
import TypeSelector from "./TypeSelector";

export default function MemoAndTodoList() {
  return (
    <div className="w-full h-full">
      <PeriodSelector />
      <TypeSelector />
      <Memo />
      <TodoList />
    </div>
  );
}
