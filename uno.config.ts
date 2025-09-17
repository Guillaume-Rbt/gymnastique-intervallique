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
            interactable: "#fc9026",
        },
    },
})