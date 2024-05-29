// themeUtils.js
export const getStoredTheme = () => {
  return localStorage.getItem("theme") || "light";
};

export const setStoredTheme = (theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};
