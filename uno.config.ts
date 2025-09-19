import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
    presets: [presetWind4()],
    content: {
        pipeline: {
            include: ["src/**/*.tsx"],
        },
    },

    theme: {
        breakpoint: {
            xs: "480px",
            sm: "576px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
            xxl: "1400px",
        },
        colors: {
            "accent": "#ff375f",
            "accent-hover": "#db1f45",
            "dark": "#485966",
            "dark-hover": "#5f6f7c",
            "dark-2": "#202020cc"
        },
    },
})