/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [

    // tailwind 적용 경로
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,tsx,tsx,mdx}",
    "./components.**.*.{js,ts,tsx,tsx,mdx}",

    // src 사용하여 추가
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

