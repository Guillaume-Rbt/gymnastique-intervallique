import { defineConfig, presetWind4, toEscapedSelector as e } from "unocss";



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
        breakpoint: {
            xs: "0px",
            sm: "576px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
            xxl: "1400px"
        },
        colors: {
            buttonResponse: {
                1: "#4c40f0",
                2: "#f04c4c",
                3: "#4cf04c",
                4: "#f0f04c",
                5: "#4cfff0",
                6: "#f04cf0",
                7: "#f0f04c",
                8: "#4c4cf0",
                9: "#f04c4c",
                10: "#4cf04c",
                11: "#f0f04c",
                12: "#4cfff0",
                13: "#f04cf0",
                14: "#f0f04c",
            }

        }
    },

    safelist: [...Array.from({ length: 14 }, (_, i) => `btn-response-${i + 1}`)],

    rules: [
        ["buttons-response", {}],
        ["w-max-content", { "width": "max-content" }],
        [/^grid-col-(\d+)-(\w+)$/, function ([, d, bp], { theme }) {
            return `
            @media screen and (min-width: ${theme.breakpoint![bp]}) {
            .grid-col-${d}-${bp}
            {
            grid-template-columns: repeat(${d}, minmax(0, 1fr));
        } }`

        }],
        [/^btn-response-(\d+)$/, function ([, d], { theme, rawSelector }) {

            const selector = e(rawSelector);

            return `
            ${selector} {
                background-color: ${theme.colors!.buttonResponse[d]};
                width: 100%;
                transition: background-color 0.2s ease-in-out;
            }

            @media (pointer: fine) and (hover: hover) {
            ${selector}:hover {
                background-color: color-mix(in srgb, ${theme.colors!.buttonResponse[d]} 80%, white);
            }
        }`
        }]

    ],

    shortcuts: {
        "btn": 'cursor-pointer w-max-content',
        'btn-response': 'flex py-2 px-6 rounded-lg',
    }
})