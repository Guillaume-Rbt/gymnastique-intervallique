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

    theme: {
        colors: {
            buttonResponse: {
                1: "#4c40f0"
            }

        }
    },

    rules: [
        [/^btn-response-(\d+)$/, ([, d], { theme }) => ({ "background-color": theme.colors!.buttonResponse[d] })],

    ],

    shortcuts: {
        'btn-response': 'flex py-2 px-6 rounded-lg',
    }
})