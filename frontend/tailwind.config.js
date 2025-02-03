/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "deep-green": "#173836",
        "mapl-black": "#333",
        "mapl-slate": "#ddd",
      },
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
