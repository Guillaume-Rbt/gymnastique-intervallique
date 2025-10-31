import { defineConfig, presetWind4, toEscapedSelector as e } from "unocss";

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
            "theme-accent": "#ff375f",
            "theme-accent-hover": "#db1f45",
            "theme-blue": "rgba(26, 43, 78, 1)",
            "theme-correct": "#00c951",
            "theme-wrong": "#fb2c36",
        },
    },
    rules: [
        [
            "scrollbar-hover",
            {
                overflow: "auto",
                "scrollbar-width": "none" /* Firefox — cachée par défaut */,
                "scrollbar-color": "rgba(0,0,0,0.4) transparent",
            },
            { layer: "components" },
        ],
        [
            /^gap-(\d+(?:\.\d+)?)$/,
            ([, gap]) => {
                return {
                    gap: `${Number(gap) * 0.25}rem`,
                    "--gap": `${Number(gap) * 0.25}rem`,
                };
            },
        ],
        [
            /^col-(\d+)$/,
            ([, d]) => {
                const n = Number(d);
                const nbSpacing = n - 1;
                return {
                    width: `calc((100% / ${n}) - ((${nbSpacing} * var(--gap)) / ${n}))`,
                };
            },
        ],
        [
            /margin-(x|y)-(?:(start|end)-)?auto/,
            ([, a, s], { rawSelector }) => {
                const selector = e(rawSelector);

                const axis = a === "x" ? "inline" : "block";
                const side = s === "start" ? "-start" : s === "end" ? "-end" : "";

                return `${selector} 
                {
                    margin-${axis}${side}: auto;
                }`;
            },
        ],
        [
            /container-margin-(y|x)-auto/,
            ([_, a], { rawSelector }) => {
                const selector = e(rawSelector);
                const axis = a === "x" ? "inline" : "block";

                return `${selector} > :first-child
                {
                    margin-${axis}-start: auto;
                }

                ${selector} > :last-child
                    {
                        margin-${axis}-end: auto;
                    }`;
            },
        ],
    ],
    shortcuts: {
        btn: "transition-background-color duration-200",
        "btn-primary": "bg-theme-accent hover:bg-theme-accent-hover color-slate-100 px-6 py-2.5 rounded-10 font-bold",
    },
});
