import DashboardSubMemoItem from "./DashboardSubMemoItem";

const bucketQuotes = [
  {
    quote:
      "The biggest adventure you can take is to live the life of your dreams.",
    quoteKr:
      "당신이 할 수 있는 가장 큰 모험은 당신의 꿈을 사는 삶을 사는 것이다.",
    author: "Oprah Winfrey",
  },
  {
    quote: "Don’t wait. The time will never be just right.",
    quoteKr: "기다리지 마라. 시간이 완벽해지는 순간은 결코 오지 않는다.",
    author: "Napoleon Hill",
  },
  {
    quote: "Life is either a daring adventure or nothing at all.",
    quoteKr: "인생은 대담한 모험이거나, 아무것도 아니다.",
    author: "Helen Keller",
  },
  {
    quote: "A goal without a plan is just a wish.",
    quoteKr: "계획 없는 목표는 그저 바람일 뿐이다.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    quote: "You only live once, but if you do it right, once is enough.",
    quoteKr: "인생은 한 번뿐이지만, 제대로 산다면 그 한 번으로 충분하다.",
    author: "Mae West",
  },
  {
    quote:
      "Go confidently in the direction of your dreams. Live the life you have imagined.",
    quoteKr: "당신의 꿈을 향해 자신 있게 나아가라. 당신이 상상한 삶을 살아라.",
    author: "Henry David Thoreau",
  },
  {
    quote: "What is not started today is never finished tomorrow.",
    quoteKr: "오늘 시작하지 않으면 내일 끝낼 수 없다.",
    author: "Johann Wolfgang von Goethe",
  },
  {
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    quoteKr: "미래는 자신의 꿈의 아름다움을 믿는 사람들의 것이다.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "Dream big and dare to fail.",
    quoteKr: "크게 꿈꾸고 실패를 두려워하지 마라.",
    author: "Norman Vaughan",
  },
  {
    quote: "It always seems impossible until it’s done.",
    quoteKr: "그것이 끝날 때까지는 늘 불가능해 보인다.",
    author: "Nelson Mandela",
  },
  {
    quote: "In the middle of every difficulty lies opportunity.",
    quoteKr: "모든 어려움 속에는 기회가 있다.",
    author: "Albert Einstein",
  },
  {
    quote: "Believe you can and you're halfway there.",
    quoteKr: "당신이 할 수 있다고 믿는다면, 이미 반은 이룬 것이다.",
    author: "Theodore Roosevelt",
  },
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    quoteKr:
      "성공은 최종이 아니고, 실패는 치명적이지 않다. 중요한 것은 계속할 용기이다.",
    author: "Winston Churchill",
  },
  {
    quote: "If you can dream it, you can do it.",
    quoteKr: "당신이 그것을 꿈꿀 수 있다면, 이룰 수도 있다.",
    author: "Walt Disney",
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    quoteKr: "천리길도 한 걸음부터 시작된다.",
    author: "Lao Tzu",
  },
  {
    quote:
      "Happiness is not something ready made. It comes from your own actions.",
    quoteKr:
      "행복은 미리 만들어진 것이 아니다. 그것은 당신의 행동에서 비롯된다.",
    author: "Dalai Lama",
  },
  {
    quote: "You miss 100% of the shots you don’t take.",
    quoteKr: "시도하지 않은 슛은 100% 놓친 것이다.",
    author: "Wayne Gretzky",
  },
  {
    quote: "Act as if what you do makes a difference. It does.",
    quoteKr: "당신의 행동이 차이를 만든다고 생각하라. 실제로 그렇다.",
    author: "William James",
  },
  {
    quote: "You are never too old to set another goal or to dream a new dream.",
    quoteKr: "새로운 목표를 세우거나 꿈을 꾸기에 너무 늦은 나이는 없다.",
    author: "C.S. Lewis",
  },
  {
    quote: "Everything you’ve ever wanted is on the other side of fear.",
    quoteKr: "당신이 원했던 모든 것은 두려움 너머에 있다.",
    author: "George Addair",
  },
];

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * bucketQuotes.length);
  return bucketQuotes[randomIndex];
}

export default function DashboardSubContent({
  dashboardMemos,
  selectedValue,
  checkedIds,
  handleToggle,
  isBucketList,
}) {
  const randomQuote = getRandomQuote();
  return (
    <div className="h-[300px] overflow-auto dashboard-sub-content">
      {isBucketList ? (
        <div className="px-2 py-6 text-center">
          <p className="mb-2 text-xl font-semibold text-gray-700">
            “{randomQuote.quoteKr}”
          </p>
          <p className="text-sm text-gray-500">– {randomQuote.author}</p>
          <p className="mt-1 text-xs italic text-gray-400">
            {randomQuote.quote}
          </p>
        </div>
      ) : (
        <ul>
          {dashboardMemos
            .filter((memo) => memo.periodId == selectedValue && !memo.completed)
            .map((memo) => (
              <li key={memo.id}>
                <DashboardSubMemoItem
                  memo={memo}
                  checked={checkedIds.includes(memo.id)}
                  onToggle={() => handleToggle(memo.id)}
                />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
