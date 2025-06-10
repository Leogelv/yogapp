/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./**/*.{html,js,jsx,ts,tsx,vue}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"IBM Plex Mono"', 'monospace'],
                rf: ['RF Dewi', 'sans-serif'],
            },
            letterSpacing: {
                tightest: '-0.07em', // кастомное значение
            },
        },
    },
    plugins: [],
}