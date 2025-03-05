/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "Noto Sans KR",
          "Malgun Gothic",
          "AppleGothic",
          "Dotum",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
