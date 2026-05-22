---
"@amfernandesinc/ui": patch
---

Release 0.2.1 — Toggle, Sidebar rewrite, DataTable upgrades, form polish.

Highlights since 0.2.0 (84 commits):

- **Sidebar**: full rewrite with collapsible rail, contextual mode, brand
  click-back, profile menu, badges, and a `React.memo`'d item tree for
  consumers with many items.
- **DataTable**: searchable, sortable, paginated, downloadable, row-level
  click + custom row className, row-count footer with custom labels.
- **Toggle**: scaling interaction states aligned with Button.
- **Combobox**: `showBadges` + `selectedCountLabel` for compact multi mode.
- **DateInput / DateRangePicker / Calendar / TimePicker**: holiday-aware
  disabled-day calculation, range data-attributes, time-picker keyboard
  shortcuts, disabledDays forwarding, "Confirmar" action on range picker.
- **Dialog**: stays open when click originates inside a nested popper.
- **Input**: improved icon alignment, password leading/trailing icon fixes.
- **Switch / Checkbox**: alignment tweaks when description is present.
- **Label**: demoted to internal (was effectively redundant with FieldShell);
  not a publicly imported component anymore.
- **formatCount**: default cap raised 999 → 9999.

Pre-1.0 reminder: API additions are landing as patches in 0.2.x; the next
breaking change will move the package to 0.3.x.
