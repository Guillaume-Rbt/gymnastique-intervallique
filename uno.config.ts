import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
    presets: [
        presetWind4()
    ],
    content: {
        pipeline: {
            include: ['src/**/*.tsx'],
        }
    },
    rules: [
        ['color-red', { "color": 'red' }],
    ]
})