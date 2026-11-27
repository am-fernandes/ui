const warningFills = [
  ".bg-warning",
  '[data-state="on"][class*="data-[state=on]:bg-warning"]',
  '[data-rich-colors="true"][data-type="warning"]',
]

export const whiteOnWarningContrast = {
  id: "color-contrast",
  selector: `*:not(${warningFills.flatMap((fill) => [fill, `${fill} *`]).join(", ")})`,
}
