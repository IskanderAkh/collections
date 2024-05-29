import daisyui from "daisyui";
import daisyUIThemes from "daisyui/src/theming/themes";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      {
        light: {
          ...daisyUIThemes["light"],
          // neutral: "rgb(200, 200, 200)",
          // active: "rgb(0,0,0)",
        }
      },
      {
        black: {
          ...daisyUIThemes["black"],
          primary: "rgb(29, 155, 240)",
          secondary: "rgb(24, 24, 24)",
        },
      },
    ],
    base: true, // Include base styles (optional)
    utils: true, // Include utility styles (optional)
    logs: true, // Show logs (optional)
    rtl: false, // Enable rtl (optional)
  },
};
