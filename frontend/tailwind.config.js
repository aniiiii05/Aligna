/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Cormorant Garamond', 'serif'],
                body: ['Outfit', 'sans-serif'],
            },
            colors: {
                aligna: {
                    bg: '#FDFBF7',
                    surface: '#FFFFFF',
                    'surface-secondary': '#F3F0EA',
                    primary: '#879C93',
                    'primary-hover': '#748880',
                    accent: '#D4A373',
                    text: '#2C3531',
                    'text-secondary': '#6E7A75',
                    border: '#E6E2D8',
                    success: '#8D9B89',
                    error: '#C67D6F',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 4px)',
                sm: 'calc(var(--radius) - 8px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'soft-pulse': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                'float-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'glow-success': {
                    '0%': { boxShadow: '0 0 0 0 rgba(135, 156, 147, 0.4)' },
                    '50%': { boxShadow: '0 0 20px 10px rgba(135, 156, 147, 0.2)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(135, 156, 147, 0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'soft-pulse': 'soft-pulse 3s ease-in-out infinite',
                'float-up': 'float-up 0.5s ease-out forwards',
                'glow': 'glow-success 1.5s ease-in-out infinite',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
