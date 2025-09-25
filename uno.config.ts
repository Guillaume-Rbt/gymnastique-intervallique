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
            accent: "#ff375f",
            "accent-hover": "#db1f45",
            "theme-dark": "#485966",
            "theme-dark-hover": "#5f6f7c",
            "theme-dark-2": "#202020ff",
            "theme-blue": "rgba(26, 43, 78, 1)",
        },
    },
    rules: [
        [
            /margin-(x|y)-(?:(start|end)-)?auto/g,
            ([, xy, se], { rawSelector }) => {
                const selector = e(rawSelector);

                getSide(se);
                {
                }

                const dir = xy === "x" ? "left right" : "top bottom";
                return `${selector} 
                {

                }`;
            },
        ],
    ],
    shortcuts: {
        btn: "transition-background-color duration-200",
        "btn-shadow":
            "shadow-[0px_0px_0px_0.93px_#0000000d,0px_0.93px_4.66px_0px_#0000004d,0px_0.5px_0.5px_0px_#ffffff40_inset]",
        "btn-primary": "bg-accent hover:bg-accent-hover color-slate-100 px-6 py-2.5 rounded-10 font-bold",
    },
});
