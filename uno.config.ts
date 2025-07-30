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
      xs: "0px",
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

  safelist: [...Array.from({ length: 14 }, (_, i) => `btn-response-${i + 1}`)],

  rules: [
    ["buttons-container", { display: "grid", "grid-template-columns": "repeat(auto-fill, minmax(160px, 320px))", width: "clamp(320px, 80%, 1000px)", "justify-content": "center" }],
    ["h-max-content", { height: "max-content" }],
    [
      /^grid-col-(\d+)-(\w+)$/,
      function ([, d, bp], { theme }) {
        return `
            @media screen and (min-width: ${theme.breakpoint![bp]}) {
            .grid-col-${d}-${bp}
            {
            grid-template-columns: repeat(${d}, minmax(0, 1fr));
        } }`;
      },
    ],
    [/inset-(\d)/, ([, d]) => {
      return {
        inset: `${parseInt(d)}px`,
      };
    }],

  ],

  shortcuts: {
    btn: "cursor-pointer rounded-lg flex flex-justify-center",
    "btn-interactable": " hover:bg-slate-100 hover:border-interactable hover:color-interactable bg-interactable color-slate-100 border-3 border-solid border-slate-100 transition-all duration-200",
    "btn-response": "py-3 px-4 hover:bg-slate-300 position-relative flex flex-justify-center font-bold rounded-lg color-dark-900 bg-slate-100 transition-background-color duration-200",
  },
});
