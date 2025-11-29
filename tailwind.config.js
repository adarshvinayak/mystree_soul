/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00897B', // Teal
                secondary: '#FF8A80', // Soft Coral
                background: '#F8FAFC', // Off-White
                surface: '#FFFFFF', // Pure White
                status: {
                    red: '#EF4444',
                    yellow: '#F59E0B',
                    green: '#10B981',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
