/* @ds-bundle: {"format":3,"namespace":"TidharAppDesignSystem_84bc9d","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"CardHeader","sourcePath":"components/display/Card.jsx"},{"name":"ListRow","sourcePath":"components/display/ListRow.jsx"},{"name":"SectionHeader","sourcePath":"components/display/SectionHeader.jsx"},{"name":"Divider","sourcePath":"components/display/SectionHeader.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"Timeline","sourcePath":"components/feedback/Timeline.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"e41e77302a31","components/actions/IconButton.jsx":"473bf8fa235f","components/display/Avatar.jsx":"079ff048c234","components/display/Card.jsx":"8a8c7a40b797","components/display/ListRow.jsx":"503f1a1e2b97","components/display/SectionHeader.jsx":"45f5ede5215c","components/display/Tag.jsx":"a3824da1eac8","components/feedback/ProgressBar.jsx":"d434cd6a332d","components/feedback/Timeline.jsx":"03cb995edbde","components/forms/Checkbox.jsx":"807522666f4e","components/forms/Chip.jsx":"8badf8360caf","components/forms/Radio.jsx":"0d350d977fe8","components/forms/Switch.jsx":"b50edfe46cb0","components/forms/TextField.jsx":"48daabe5800d","components/navigation/NavBar.jsx":"ca903a6ec113","components/navigation/Tabs.jsx":"df9fd9e38899","components/navigation/TopBar.jsx":"d759d0ee9ef0","ui_kits/tidhar-app/icons.jsx":"c319818e3361","ui_kits/tidhar-app/screens.jsx":"23a8655bda5c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TidharAppDesignSystem_84bc9d = window.TidharAppDesignSystem_84bc9d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tidhar primary button. Fully-rounded pill, deep-green fill for primary
 * actions, teal/white outline for secondary. Sizes and paddings transcribed
 * from the Figma button set.
 */
function Button({
  children,
  variant = "primary",
  // "primary" | "secondary" | "tertiary"
  size = "md",
  // "sm" | "md" | "lg"
  color = "green",
  // "green" (default) | "teal"
  block = false,
  disabled = false,
  raised = false,
  iconStart = null,
  iconEnd = null,
  style = {},
  ...rest
}) {
  const brand = color === "teal" ? "var(--tid-teal-700)" : "var(--tid-green-900)";
  const sizes = {
    sm: {
      height: 33,
      padding: "8px 16px",
      font: "var(--fs-label)",
      gap: 4
    },
    md: {
      height: 40,
      padding: "8px 16px",
      font: "var(--fs-title)",
      gap: 8
    },
    lg: {
      height: 48,
      padding: "12px 24px",
      font: "var(--fs-h3)",
      gap: 8
    }
  };
  const s = sizes[size] || sizes.md;
  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "fit-content",
    height: s.height,
    gap: s.gap,
    padding: s.padding,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-pill)",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-bold)",
    fontSize: s.font,
    lineHeight: 1,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    transition: "background-color .15s ease, box-shadow .15s ease, opacity .15s ease, transform .05s ease",
    ...style
  };
  const variants = {
    primary: {
      backgroundColor: disabled ? "var(--tid-grey-200)" : brand,
      color: disabled ? "var(--tid-grey-400)" : "var(--text-on-brand)",
      boxShadow: raised && !disabled ? "var(--shadow-raised)" : "none"
    },
    secondary: {
      backgroundColor: "var(--tid-white)",
      color: disabled ? "var(--tid-grey-400)" : brand,
      boxShadow: `inset 0 0 0 2px ${disabled ? "var(--tid-grey-200)" : brand}`
    },
    tertiary: {
      backgroundColor: "transparent",
      color: disabled ? "var(--tid-grey-400)" : brand,
      textDecoration: "underline",
      textUnderlineOffset: 3,
      height: "auto",
      padding: "4px 8px"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: {
      ...base,
      ...variants[variant]
    }
  }, rest), iconStart, children, iconEnd);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Circular icon-only button used for back/close/chevron controls and FABs.
 * Sizes and treatments mirror the app's round nav controls.
 */
function IconButton({
  children,
  variant = "ghost",
  // "ghost" | "filled" | "outline"
  size = 40,
  disabled = false,
  ariaLabel,
  style = {},
  ...rest
}) {
  const variants = {
    ghost: {
      backgroundColor: "var(--tid-grey-75)",
      color: "var(--tid-ink)",
      boxShadow: "none"
    },
    filled: {
      backgroundColor: "var(--tid-green-900)",
      color: "var(--tid-white)",
      boxShadow: "none"
    },
    outline: {
      backgroundColor: "var(--tid-white)",
      color: "var(--tid-green-900)",
      boxShadow: "inset 0 0 0 1.5px var(--tid-green-900)"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    style: {
      width: size,
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "background-color .15s ease, opacity .15s ease",
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PALETTE = ["#255454", "#4A9462", "#F4B85D", "#E53E51", "#96B7E5", "#004434"];

/** Avatar — image or initials on a brand-tinted circle. */
function Avatar({
  src,
  name = "",
  size = 40,
  style = {},
  ...rest
}) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const bg = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: size,
      height: size,
      borderRadius: "var(--radius-full)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: src ? "transparent" : bg,
      color: "#fff",
      font: `var(--fw-bold) ${Math.round(size * 0.4)}px var(--font-sans)`,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * White surface card — the core container of the app. Generous 16px radius,
 * soft shadow, RTL padding. Use for every grouped block on the home feed.
 */
function Card({
  children,
  padding = 20,
  radius = "var(--radius-lg)",
  elevated = true,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      borderRadius: radius,
      padding,
      boxShadow: elevated ? "var(--shadow-card)" : "none",
      boxSizing: "border-box",
      ...style
    }
  }, rest), children);
}

/** Card title row: bold heading, optional chevron / action on the leading edge. */
function CardHeader({
  title,
  action = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-3)",
      marginBottom: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--text-h2)",
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), action);
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/ListRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * List row — leading icon/element, title (+optional subtitle), trailing
 * element (download icon, chevron, value). Used for document lists, menu
 * items and settings rows. Hairline divider optional.
 */
function ListRow({
  leading = null,
  title,
  subtitle,
  trailing = null,
  divider = false,
  onClick,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "12px 0",
      cursor: onClick ? "pointer" : "default",
      borderBottom: divider ? "1px solid var(--border-subtle)" : "none",
      boxSizing: "border-box",
      ...style
    }
  }, rest), leading && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexShrink: 0,
      color: "var(--tid-grey-700)"
    }
  }, leading), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-bold) var(--fs-body)/1.3 var(--font-sans)",
      color: "var(--text-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--fs-label)/1.3 var(--font-sans)",
      color: "var(--text-tertiary)"
    }
  }, subtitle)), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexShrink: 0,
      color: "var(--tid-grey-500)"
    }
  }, trailing));
}
Object.assign(__ds_scope, { ListRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ListRow.jsx", error: String((e && e.message) || e) }); }

// components/display/SectionHeader.jsx
try { (() => {
/** Section header — bold RTL title with optional trailing "see all" link. */
function SectionHeader({
  title,
  action = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-3)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--text-h2)",
      color: "var(--text-primary)",
      margin: 0
    }
  }, title), action);
}

/** Full-bleed hairline divider. */
function Divider({
  style = {}
}) {
  return /*#__PURE__*/React.createElement("hr", {
    style: {
      border: "none",
      height: 1,
      background: "var(--border-subtle)",
      margin: 0,
      ...style
    }
  });
}
Object.assign(__ds_scope, { SectionHeader, Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Status tag / pill. Soft-tint background with saturated text, fully rounded.
 * Tones and exact colors transcribed from the Figma Tag set (red / yellow /
 * blue / green). Optionally carries a leading icon (e.g. clock, check).
 */
const TONES = {
  danger: {
    bg: "var(--tid-danger-bg)",
    fg: "var(--tid-danger)"
  },
  warning: {
    bg: "var(--tid-warning-bg)",
    fg: "var(--tid-warning)"
  },
  info: {
    bg: "var(--tid-info-bg)",
    fg: "var(--tid-info)"
  },
  success: {
    bg: "var(--tid-success-bg)",
    fg: "var(--tid-success)"
  },
  neutral: {
    bg: "var(--tid-grey-75)",
    fg: "var(--tid-grey-700)"
  }
};
function Tag({
  children,
  tone = "neutral",
  icon = null,
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-1)",
      padding: "4px 8px",
      borderRadius: "var(--radius-pill)",
      backgroundColor: t.bg,
      color: t.fg,
      font: "var(--fw-medium) var(--fs-label)/1 var(--font-sans)",
      whiteSpace: "nowrap",
      width: "fit-content",
      boxSizing: "border-box",
      ...style
    }
  }, rest), children, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      width: 16,
      height: 16
    }
  }, icon));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
/** Linear progress bar — rounded track, green fill. */
function ProgressBar({
  value = 0,
  max = 100,
  height = 8,
  style = {}
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height,
      borderRadius: "var(--radius-full)",
      background: "var(--tid-grey-200)",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      borderRadius: "var(--radius-full)",
      background: "var(--tid-green-600)",
      transition: "width .3s ease"
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Timeline.jsx
try { (() => {
/**
 * Vertical progress timeline (RTL) — used for the app's "סטטוס התקדמות".
 * Each step has a status: done (filled green), current (amber ring),
 * upcoming (hollow grey). A dashed connector runs between dots.
 */
const DOT = {
  done: {
    bg: "var(--tid-green-600)",
    ring: "var(--tid-green-600)"
  },
  current: {
    bg: "var(--tid-white)",
    ring: "var(--tid-gold)"
  },
  upcoming: {
    bg: "var(--tid-white)",
    ring: "var(--tid-grey-300)"
  }
};
function Timeline({
  items = [],
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, items.map((it, i) => {
    const d = DOT[it.status] || DOT.upcoming;
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 18
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16,
        height: 16,
        borderRadius: "var(--radius-full)",
        flexShrink: 0,
        backgroundColor: it.status === "current" ? d.ring : d.bg,
        boxShadow: it.status === "done" ? "none" : `inset 0 0 0 2px ${d.ring}`
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 0,
        borderInlineStart: "2px dashed var(--tid-grey-300)",
        minHeight: 24
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : "var(--space-5)",
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--fw-bold) var(--fs-body)/1.3 var(--font-sans)",
        color: "var(--text-primary)"
      }
    }, it.title), it.meta && /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--fw-regular) var(--fs-label)/1.3 var(--font-sans)",
        color: "var(--text-tertiary)",
        marginTop: 2
      }
    }, it.meta), it.children));
  }));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Checkbox — 24×24, 4.8px radius. Checked fills with the brand teal and shows
 * a white tick; unchecked is white with a 1.2px grey inset border. Values
 * transcribed from the Figma checkbox set (State × On/Off).
 */
function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  error = false,
  label,
  id,
  style = {},
  ...rest
}) {
  const box = {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: "var(--radius-xs)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color .15s ease, box-shadow .15s ease"
  };
  let skin;
  if (disabled) {
    skin = checked ? {
      backgroundColor: "var(--tid-grey-150)"
    } : {
      backgroundColor: "var(--tid-grey-150)"
    };
  } else if (checked) {
    skin = {
      backgroundColor: error ? "var(--tid-danger)" : "var(--tid-teal-700)"
    };
  } else {
    skin = {
      backgroundColor: "var(--tid-white)",
      boxShadow: `inset 0 0 0 1.2px ${error ? "var(--tid-danger)" : "var(--tid-grey-300)"}`
    };
  }
  const control = /*#__PURE__*/React.createElement("span", _extends({
    role: "checkbox",
    "aria-checked": checked,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(!checked),
    onKeyDown: e => {
      if (!disabled && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        onChange && onChange(!checked);
      }
    },
    style: {
      ...box,
      ...skin
    }
  }, rest), checked && /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: disabled ? "var(--tid-grey-500)" : "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5l4.5 4.5L19 7"
  })));
  if (!label) return control;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--fs-body)/1.4 var(--font-sans)",
      color: disabled ? "var(--tid-grey-400)" : "var(--text-primary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Filter chip. Selected chip is a solid deep-green pill (h30, 4/16 padding,
 * bold 16px) per the Figma chip; unselected is a light outlined pill.
 */
function Chip({
  children,
  selected = false,
  onClick,
  disabled = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    style: {
      height: 30,
      borderRadius: "var(--radius-pill)",
      padding: "4px 16px",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      font: "var(--fw-bold) var(--fs-body)/1 var(--font-sans)",
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      backgroundColor: selected ? "var(--tid-green-900)" : "var(--tid-white)",
      color: selected ? "var(--tid-white)" : "var(--text-primary)",
      boxShadow: selected ? "none" : "inset 0 0 0 1px var(--tid-grey-300)",
      opacity: disabled ? 0.5 : 1,
      transition: "background-color .15s ease, color .15s ease",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Radio control matching the checkbox proportions — 24px, teal selected dot. */
function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  name,
  value,
  style = {},
  ...rest
}) {
  const control = /*#__PURE__*/React.createElement("span", _extends({
    role: "radio",
    "aria-checked": checked,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(value ?? true),
    onKeyDown: e => {
      if (!disabled && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        onChange && onChange(value ?? true);
      }
    },
    style: {
      width: 24,
      height: 24,
      flexShrink: 0,
      borderRadius: "var(--radius-full)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: "var(--tid-white)",
      boxShadow: `inset 0 0 0 ${checked ? 1.5 : 1.2}px ${disabled ? "var(--tid-grey-300)" : checked ? "var(--tid-teal-700)" : "var(--tid-grey-300)"}`,
      transition: "box-shadow .15s ease",
      ...style
    }
  }, rest), checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "var(--radius-full)",
      backgroundColor: disabled ? "var(--tid-grey-400)" : "var(--tid-teal-700)"
    }
  }));
  if (!label) return control;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, control, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--fs-body)/1.4 var(--font-sans)",
      color: disabled ? "var(--tid-grey-400)" : "var(--text-primary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** iOS-style toggle switch. Green track when on, matching the app's settings. */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 51,
      height: 31,
      flexShrink: 0,
      borderRadius: "var(--radius-full)",
      border: "none",
      padding: 2,
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: checked ? "var(--tid-green-900)" : "var(--tid-grey-300)",
      opacity: disabled ? 0.5 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: checked ? "flex-start" : "flex-end",
      transition: "background-color .2s ease",
      boxSizing: "border-box",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 27,
      height: 27,
      borderRadius: "var(--radius-full)",
      backgroundColor: "var(--tid-white)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.25)"
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Text field — label above, rounded input, teal focus ring, optional leading
 * icon and helper / error text. RTL-first (Hebrew). Supports single or
 * multiline. Styling follows the app's form fields.
 */
function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error = false,
  disabled = false,
  multiline = false,
  rows = 3,
  iconStart = null,
  id,
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? "var(--tid-danger)" : focused ? "var(--tid-teal-700)" : "var(--tid-grey-300)";
  const fieldStyle = {
    display: "flex",
    alignItems: multiline ? "flex-start" : "center",
    gap: "var(--space-2)",
    width: "100%",
    boxSizing: "border-box",
    padding: multiline ? "12px 14px" : "0 14px",
    height: multiline ? "auto" : 48,
    background: disabled ? "var(--tid-grey-75)" : "var(--tid-white)",
    borderRadius: "var(--radius-sm)",
    boxShadow: `inset 0 0 0 ${focused && !error ? 1.5 : 1}px ${borderColor}`,
    transition: "box-shadow .15s ease"
  };
  const inputStyle = {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    font: "var(--fw-regular) var(--fs-body)/1.4 var(--font-sans)",
    color: "var(--text-primary)",
    padding: multiline ? 0 : "13px 0",
    resize: multiline ? "vertical" : "none",
    width: "100%"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)",
      width: "100%",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      font: "var(--fw-bold) var(--fs-label)/1.4 var(--font-sans)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: fieldStyle
  }, iconStart && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--tid-grey-500)",
      flexShrink: 0
    }
  }, iconStart), multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: id,
    rows: rows,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: e => onChange && onChange(e.target.value),
    style: inputStyle
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: e => onChange && onChange(e.target.value),
    style: inputStyle
  }, rest))), helper && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-regular) var(--fs-caption)/1.4 var(--font-sans)",
      color: error ? "var(--tid-danger)" : "var(--text-tertiary)"
    }
  }, helper));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
/**
 * Bottom navigation bar (mobile). White surface, top hairline, icon + label
 * tabs; the active tab is deep-green. Meant to sit fixed at the bottom of the
 * 360px app frame.
 */
function NavBar({
  items = [],
  active,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      justifyContent: "space-around",
      alignItems: "stretch",
      background: "var(--surface-card)",
      borderTop: "1px solid var(--border-subtle)",
      padding: "8px 8px 20px",
      boxSizing: "border-box",
      ...style
    }
  }, items.map(it => {
    const on = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      onClick: () => onChange && onChange(it.key),
      style: {
        flex: 1,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "6px 0",
        color: on ? "var(--tid-green-900)" : "var(--tid-grey-500)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        width: 24,
        height: 24
      }
    }, it.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        font: `${on ? "var(--fw-bold)" : "var(--fw-regular)"} var(--fs-caption)/1 var(--font-sans)`
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Underline tabs (RTL). Active tab is deep-green with a green underline. */
function Tabs({
  items = [],
  active,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, items.map(it => {
    const on = it.key === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      onClick: () => onChange && onChange(it.key),
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "10px 0",
        font: `${on ? "var(--fw-bold)" : "var(--fw-regular)"} var(--fs-body)/1 var(--font-sans)`,
        color: on ? "var(--tid-green-900)" : "var(--text-tertiary)",
        borderBottom: `2px solid ${on ? "var(--tid-green-900)" : "transparent"}`,
        marginBottom: -1
      }
    }, it.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
/**
 * App top bar (RTL). Title on the leading (right) edge, a circular back /
 * chevron control, and an optional trailing action. Mirrors the app's screen
 * headers ("סטטוס התקלה" with a round chevron).
 */
function TopBar({
  title,
  onBack,
  back = true,
  trailing = null,
  style = {}
}) {
  const Chevron = /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  }));
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-3)",
      padding: "12px 16px",
      boxSizing: "border-box",
      background: "transparent",
      ...style
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--text-h2)",
      color: "var(--text-primary)",
      margin: 0,
      flex: 1
    }
  }, title), trailing, back && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    variant: "ghost",
    ariaLabel: "\u05D7\u05D6\u05E8\u05D4",
    onClick: onBack,
    size: 40
  }, Chevron));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tidhar-app/icons.jsx
try { (() => {
// Shared inline icons for the Tidhar app UI kit (Vuesax-style thin linear,
// substituted with hand-matched 24px strokes). Exposed on window.
const _ico = (paths, sw = 1.6) => (props = {}) => React.createElement("svg", {
  width: props.size || 24,
  height: props.size || 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: props.style
}, paths.map((d, i) => React.createElement("path", {
  key: i,
  d
})));
const TidIcons = {
  home: _ico(["M4 11l8-6 8 6", "M6 10v9h12v-9"]),
  tasks: _ico(["M4 6h16", "M4 12h16", "M4 18h10", "M18 17l1.5 1.5L22 15"]),
  docs: _ico(["M7 3h7l4 4v14H7z", "M14 3v4h4"]),
  user: _ico(["M12 12a4 4 0 100-8 4 4 0 000 8z", "M4 20c1.5-4 6-5 8-5s6.5 1 8 5"]),
  chevron: _ico(["M9 6l6 6-6 6"]),
  bell: _ico(["M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 01-3.4 0"]),
  download: _ico(["M12 4v11", "M8 11l4 4 4-4", "M5 20h14"]),
  image: _ico(["M4 5h16v14H4z", "M4 16l5-4 4 3 3-2 4 3"], 1.5),
  video: _ico(["M4 6h11v12H4z", "M15 10l5-3v10l-5-3"]),
  clock: _ico(["M12 21a9 9 0 100-18 9 9 0 000 18z", "M12 8v4l3 2"]),
  edit: _ico(["M14 4l6 6", "M4 20l1-4L16 5l3 3L8 19l-4 1z"]),
  wrench: _ico(["M15 6a4 4 0 01-5 5l-6 6 3 3 6-6a4 4 0 015-5l-2 2-2-2 1-3z"]),
  plus: _ico(["M12 5v14", "M5 12h14"]),
  phone: _ico(["M5 4h4l2 5-3 2a12 12 0 005 5l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"])
};
window.TidIcons = TidIcons;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tidhar-app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/tidhar-app/screens.jsx
try { (() => {
// Tidhar app UI-kit screens. Composes design-system primitives from the
// bundle (window.TidharAppDesignSystem_84bc9d) + shared TidIcons.
const DS = window.TidharAppDesignSystem_84bc9d;
const {
  Card,
  CardHeader,
  Button,
  Tag,
  Chip,
  Timeline,
  ListRow,
  Avatar,
  SectionHeader,
  Divider,
  TopBar,
  ProgressBar
} = DS;
const I = window.TidIcons;

/* iOS-style status bar */
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 22px 2px",
      font: "var(--fw-bold) 15px var(--font-ui)",
      color: "var(--tid-ink)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "12",
    viewBox: "0 0 18 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7",
    width: "3",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "4",
    width: "3",
    height: "8",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "10",
    y: "1.5",
    width: "3",
    height: "10.5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "0",
    width: "3",
    height: "12",
    rx: "1",
    opacity: "0.35"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 2.5C11 2.5 13.2 3.5 14.8 5.1l1.2-1.3C14 1.8 11.4.6 8.5.6S3 1.8 1 3.8l1.2 1.3C3.8 3.5 6 2.5 8.5 2.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6c1.3 0 2.5.5 3.4 1.4l1.2-1.3C11.9 4.9 10.3 4.2 8.5 4.2s-3.4.7-4.6 1.9l1.2 1.3C6 6.5 7.2 6 8.5 6z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "9.8",
    r: "1.7"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "26",
    height: "12",
    viewBox: "0 0 26 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "21",
    height: "11",
    rx: "3",
    stroke: "currentColor",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "17",
    height: "8",
    rx: "1.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "23",
    y: "4",
    width: "2",
    height: "4",
    rx: "1",
    fill: "currentColor",
    opacity: "0.4"
  }))));
}
window.StatusBar = StatusBar;

/* Fault-status detail screen — recreation of "סטטוס התקלה" */
function FaultScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--app-card-gap)",
      padding: "8px 16px 24px"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "\u05E1\u05D8\u05D8\u05D5\u05E1 \u05D4\u05EA\u05E7\u05DC\u05D4",
    onBack: () => {}
  }), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "\u05E4\u05E8\u05D8\u05D9 \u05D4\u05EA\u05E7\u05DC\u05D4"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--tid-ink)"
    }
  }, /*#__PURE__*/React.createElement(I.wrench, null)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-bold) var(--fs-title) var(--font-sans)"
    }
  }, "\u05DE\u05D8\u05D1\u05D7 \xB7 \u05DE\u05E2\u05E8\u05DB\u05EA \u05D7\u05E9\u05DE\u05DC")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--text-body)",
      color: "var(--text-secondary)",
      margin: "0 0 14px"
    }
  }, "\u05D1\u05D9\u05E6\u05D5\u05E2 \u05DC\u05D0 \u05E2\u05DC \u05E4\u05D9 \u05D4\u05EA\u05D5\u05DB\u05E0\u05D9\u05EA"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "info"
  }, "\u05E4\u05E0\u05D9\u05D9\u05D4 \u05E4\u05EA\u05D5\u05D7\u05D4"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-caption)",
      color: "var(--text-tertiary)"
    }
  }, "\u05E0\u05E4\u05EA\u05D7\u05D4 \u05D1\u05BE19.09.25"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "\u05E1\u05D8\u05D8\u05D5\u05E1 \u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA"
  }), /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "הפנייה נפתחה",
      meta: "19.09.25",
      status: "done"
    }, {
      title: "שובץ בעל מקצוע — ישראל ישראלי",
      meta: "25.09.25 · 16:00–12:00",
      status: "current",
      children: /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8
        }
      }, /*#__PURE__*/React.createElement(Tag, {
        tone: "info"
      }, "\u05E4\u05E0\u05D9\u05D9\u05D4 \u05E4\u05EA\u05D5\u05D7\u05D4"))
    }, {
      title: "ביקור צבעי — משה בן-דוד",
      meta: "30.09.25 · 16:00–12:00",
      status: "upcoming"
    }, {
      title: "ביקור אינסטלטור — דימיטרי וולץ׳",
      meta: "02.10.25 · 16:00–12:00",
      status: "upcoming"
    }]
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(CardHeader, {
    title: "\u05EA\u05D9\u05D0\u05D5\u05E8 \u05D4\u05EA\u05E7\u05DC\u05D4"
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement(I.image, null),
    title: "Image_01_01_26",
    trailing: /*#__PURE__*/React.createElement(I.download, null),
    divider: true
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement(I.image, null),
    title: "Image1_01_01_26",
    trailing: /*#__PURE__*/React.createElement(I.download, null),
    divider: true
  }), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement(I.video, null),
    title: "Video_01_01_26",
    trailing: /*#__PURE__*/React.createElement(I.download, null)
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true
  }, "\u05E2\u05D3\u05DB\u05D5\u05DF \u05E1\u05D8\u05D8\u05D5\u05E1 \u05E4\u05E0\u05D9\u05D9\u05D4"));
}
window.FaultScreen = FaultScreen;

/* Home feed screen */
function HomeScreen() {
  const [filter, setFilter] = React.useState("all");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--app-card-gap)",
      padding: "8px 16px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "4px 2px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-caption)",
      color: "var(--text-tertiary)"
    }
  }, "\u05E9\u05DC\u05D5\u05DD, \u05D3\u05E0\u05D4"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-bold) var(--fs-h2) var(--font-sans)",
      color: "var(--text-primary)"
    }
  }, "\u05D4\u05D3\u05D9\u05E8\u05D4 \u05E9\u05DC\u05D9")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--tid-ink)"
    }
  }, /*#__PURE__*/React.createElement(I.bell, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--tid-teal-700)",
      color: "#fff",
      borderRadius: "var(--radius-xl)",
      padding: 22,
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-regular) var(--fs-label) var(--font-sans)",
      opacity: 0.85,
      marginBottom: 6
    }
  }, "\u05DC\u05E8\u05D0\u05E9\u05D5\u05E0\u05D4 \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-bold) 28px/1.15 var(--font-sans)",
      marginBottom: 12
    }
  }, "10 \u05E9\u05E0\u05D5\u05EA \u05D0\u05D7\u05E8\u05D9\u05D5\u05EA", /*#__PURE__*/React.createElement("br", null), "\u05E2\u05DC \u05D4\u05D3\u05D9\u05E8\u05D4 \u05E9\u05DC\u05DB\u05DD"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    color: "teal",
    size: "sm",
    style: {
      background: "#fff"
    }
  }, "\u05DC\u05EA\u05E7\u05E0\u05D5\u05DF \u05D4\u05DE\u05DC\u05D0")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto"
    }
  }, [["all", "הכל"], ["open", "פתוחות"], ["done", "בוצעו"], ["docs", "מסמכים"]].map(([k, t]) => /*#__PURE__*/React.createElement(Chip, {
    key: k,
    selected: filter === k,
    onClick: () => setFilter(k)
  }, t))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-bold) var(--fs-title) var(--font-sans)"
    }
  }, "\u05DE\u05D8\u05D1\u05D7 \xB7 \u05DE\u05E2\u05E8\u05DB\u05EA \u05D7\u05E9\u05DE\u05DC"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-label)",
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "\u05E4\u05E0\u05D9\u05D9\u05D4 #1042")), /*#__PURE__*/React.createElement(Tag, {
    tone: "danger"
  }, "\u05D3\u05D7\u05D5\u05E3")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: 45
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    tone: "warning",
    icon: /*#__PURE__*/React.createElement(I.clock, {
      size: 14
    })
  }, "\u05DC\u05D1\u05D9\u05E6\u05D5\u05E2 \u05E2\u05D3 15/03"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: "var(--fw-bold) var(--fs-label) var(--font-sans)"
    }
  }, "\u05DC\u05E4\u05E8\u05D8\u05D9\u05DD"))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--fw-bold) var(--fs-title) var(--font-sans)"
    }
  }, "\u05E1\u05DC\u05D5\u05DF \xB7 \u05E6\u05D1\u05D9\u05E2\u05D4"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-label)",
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "\u05E4\u05E0\u05D9\u05D9\u05D4 #1039")), /*#__PURE__*/React.createElement(Tag, {
    tone: "success",
    icon: /*#__PURE__*/React.createElement(I.clock, {
      size: 14
    })
  }, "\u05D1\u05D5\u05E6\u05E2")), /*#__PURE__*/React.createElement(ListRow, {
    leading: /*#__PURE__*/React.createElement(Avatar, {
      name: "Moshe Ben David",
      size: 36
    }),
    title: "\u05DE\u05E9\u05D4 \u05D1\u05DF-\u05D3\u05D5\u05D3",
    subtitle: "\u05E6\u05D1\u05E2\u05D9 \xB7 \u05D4\u05D5\u05E9\u05DC\u05DD 30.09",
    trailing: /*#__PURE__*/React.createElement(I.phone, {
      size: 20
    })
  })));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/tidhar-app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.ListRow = __ds_scope.ListRow;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
