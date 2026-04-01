/**
 * @description 主题配置 - 使用纯 CSS 变量方案（替代原 @pureadmin/theme 的 SCSS scope 方案）
 */

/** 预设主题色 */
const themeColors = {
  default: {
    subMenuActiveText: "#fff",
    menuBg: "#001529",
    menuHover: "#4091f7",
    subMenuBg: "#0f0303",
    subMenuActiveBg: "#4091f7",
    menuText: "rgb(254 254 254 / 65%)",
    sidebarLogo: "#002140",
    menuTitleHover: "#fff",
    menuActiveBefore: "#4091f7"
  },
  light: {
    subMenuActiveText: "#409eff",
    menuBg: "#fff",
    menuHover: "#e0ebf6",
    subMenuBg: "#fff",
    subMenuActiveBg: "#e0ebf6",
    menuText: "#7a80b4",
    sidebarLogo: "#fff",
    menuTitleHover: "#000",
    menuActiveBefore: "#4091f7"
  },
  dusk: {
    subMenuActiveText: "#fff",
    menuBg: "#2a0608",
    menuHover: "#e13c39",
    subMenuBg: "#000",
    subMenuActiveBg: "#e13c39",
    menuText: "rgb(254 254 254 / 65.1%)",
    sidebarLogo: "#42090c",
    menuTitleHover: "#fff",
    menuActiveBefore: "#e13c39"
  },
  volcano: {
    subMenuActiveText: "#fff",
    menuBg: "#2b0e05",
    menuHover: "#e85f33",
    subMenuBg: "#0f0603",
    subMenuActiveBg: "#e85f33",
    menuText: "rgb(254 254 254 / 65%)",
    sidebarLogo: "#441708",
    menuTitleHover: "#fff",
    menuActiveBefore: "#e85f33"
  },
  yellow: {
    subMenuActiveText: "#d25f00",
    menuBg: "#2b2503",
    menuHover: "#f6da4d",
    subMenuBg: "#0f0603",
    subMenuActiveBg: "#f6da4d",
    menuText: "rgb(254 254 254 / 65%)",
    sidebarLogo: "#443b05",
    menuTitleHover: "#fff",
    menuActiveBefore: "#f6da4d"
  },
  mingQing: {
    subMenuActiveText: "#fff",
    menuBg: "#032121",
    menuHover: "#59bfc1",
    subMenuBg: "#000",
    subMenuActiveBg: "#59bfc1",
    menuText: "#7a80b4",
    sidebarLogo: "#053434",
    menuTitleHover: "#fff",
    menuActiveBefore: "#59bfc1"
  },
  auroraGreen: {
    subMenuActiveText: "#fff",
    menuBg: "#0b1e15",
    menuHover: "#60ac80",
    subMenuBg: "#000",
    subMenuActiveBg: "#60ac80",
    menuText: "#7a80b4",
    sidebarLogo: "#112f21",
    menuTitleHover: "#fff",
    menuActiveBefore: "#60ac80"
  },
  pink: {
    subMenuActiveText: "#fff",
    menuBg: "#28081a",
    menuHover: "#d84493",
    subMenuBg: "#000",
    subMenuActiveBg: "#d84493",
    menuText: "#7a80b4",
    sidebarLogo: "#3f0d29",
    menuTitleHover: "#fff",
    menuActiveBefore: "#d84493"
  },
  saucePurple: {
    subMenuActiveText: "#fff",
    menuBg: "#130824",
    menuHover: "#693ac9",
    subMenuBg: "#000",
    subMenuActiveBg: "#693ac9",
    menuText: "#7a80b4",
    sidebarLogo: "#1f0c38",
    menuTitleHover: "#fff",
    menuActiveBefore: "#693ac9"
  }
};

/** CSS 变量名映射 */
const cssVarMap: Record<string, string> = {
  subMenuActiveText: "--sub-menu-active-text",
  menuBg: "--menu-bg",
  menuHover: "--menu-hover",
  subMenuBg: "--sub-menu-bg",
  subMenuActiveBg: "--sub-menu-active-bg",
  menuText: "--menu-text",
  sidebarLogo: "--sidebar-logo",
  menuTitleHover: "--menu-title-hover",
  menuActiveBefore: "--menu-active-before"
};

/**
 * @description 切换导航主题 - 通过设置 CSS 变量实现
 */
export function toggleTheme(options: { scopeName: string }) {
  const { scopeName } = options;
  const themeName = scopeName.replace("layout-theme-", "");
  const colors = themeColors[themeName];
  if (!colors) return;

  const root = document.documentElement;
  Object.keys(colors).forEach(key => {
    const cssVar = cssVarMap[key];
    if (cssVar) {
      root.style.setProperty(cssVar, colors[key]);
    }
  });

  // 设置当前激活的主题 scope class
  Object.keys(themeColors).forEach(key => {
    root.classList.remove(`layout-theme-${key}`);
  });
  root.classList.add(scopeName);
}

/**
 * @description 颜色加深
 */
export function darken(color: string, amount: number): string {
  return adjustColor(color, -amount);
}

/**
 * @description 颜色减淡
 */
export function lighten(color: string, amount: number): string {
  return adjustColor(color, amount);
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(255 * amount);
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * amount);
  let b = (num & 0x0000ff) + Math.round(255 * amount);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export { themeColors };
