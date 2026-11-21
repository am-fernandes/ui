import { act, render, renderHook, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FileText, LayoutDashboard, Users } from "lucide-react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  AppShell,
  type AppShellItem,
  type AppShellProps,
  type SidebarItem,
  defaultAppShellLabels,
  useAppShell,
} from "./app-shell"

const STORAGE_KEY = "amf-ui:sidebar:collapsed"

const items: AppShellItem[] = [
  { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "#dash" },
  { id: "users", label: "Usuários", icon: Users, href: "#users" },
]

// --- matchMedia stub (desktop by default, flips to mobile on demand) -------

type Listener = (event: MediaQueryListEvent) => void

function installMatchMedia(initialMobile: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: initialMobile,
    media: "(max-width: 767px)",
    onchange: null,
    addListener: (l: Listener) => listeners.add(l),
    removeListener: (l: Listener) => listeners.delete(l),
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
    dispatchEvent: () => false,
  }
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => mql as unknown as MediaQueryList,
  })
  return {
    setMobile(matches: boolean) {
      mql.matches = matches
      act(() => {
        for (const l of listeners) l({ matches } as MediaQueryListEvent)
      })
    },
  }
}

const originalMatchMedia = window.matchMedia

// --- helpers ---------------------------------------------------------------

function renderShell(props: Partial<AppShellProps> = {}) {
  const utils = render(
    <AppShell items={items} {...props}>
      {props.children ?? <p>Conteúdo da página</p>}
    </AppShell>,
  )
  const root = utils.container.querySelector('[data-slot="app-shell"]') as HTMLElement
  const aside = utils.container.querySelector('[data-slot="app-shell-sidebar"]') as HTMLElement
  const topBar = utils.container.querySelector('[data-slot="app-shell-navbar"]') as HTMLElement
  const mobileBar = utils.container.querySelector(
    '[data-slot="app-shell-mobile-bar"]',
  ) as HTMLElement
  const main = utils.container.querySelector("main") as HTMLElement
  return { ...utils, root, aside, topBar, mobileBar, main }
}

async function openMobileMenu() {
  await userEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
  return screen.getByRole("dialog", { name: "Menu" })
}

function FooterProbe() {
  const { collapsed, isMobile, closeMenu } = useAppShell()
  return (
    <div
      data-testid="footer-probe"
      data-collapsed={String(collapsed)}
      data-mobile={String(isMobile)}
    >
      <button type="button" onClick={closeMenu}>
        Fechar pelo footer
      </button>
    </div>
  )
}

describe("AppShell", () => {
  beforeEach(() => {
    window.localStorage.clear()
    installMatchMedia(false)
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    })
  })

  describe("layout", () => {
    it("renders the page inside <main id='conteudo'>", () => {
      const { main } = renderShell()
      expect(main).toHaveAttribute("id", "conteudo")
      expect(main).toHaveAttribute("data-slot", "app-shell-main")
      expect(within(main).getByText("Conteúdo da página")).toBeInTheDocument()
    })

    it("fills the viewport and only lets <main> scroll", () => {
      const { root, main } = renderShell()
      expect(root).toHaveClass("h-dvh", "overflow-hidden")
      expect(main).toHaveClass("min-h-0", "flex-1", "overflow-y-auto")
    })

    it("lets className replace the viewport height (e.g. under an Electron title bar)", () => {
      const { root } = renderShell({ className: "h-full" })
      expect(root).toHaveClass("h-full")
      expect(root).not.toHaveClass("h-dvh")
    })

    it("renders a skip link that targets the main content", () => {
      const { main } = renderShell()
      const skip = screen.getByRole("link", { name: "Pular para o conteúdo" })
      expect(skip).toHaveAttribute("href", "#conteudo")
      expect(skip).toHaveClass("sr-only", "focus:not-sr-only")
      // Programmatically focusable so the skip link actually moves focus.
      expect(main).toHaveAttribute("tabindex", "-1")
    })

    it("applies the standard content padding by default", () => {
      const { main } = renderShell()
      expect(main).toHaveClass("p-4", "md:p-6")
    })

    it("drops the content padding with contentPadding={false}", () => {
      const { main } = renderShell({ contentPadding: false })
      expect(main).not.toHaveClass("p-4")
      expect(main).not.toHaveClass("md:p-6")
    })

    it("shows the desktop menu from 768px and the mobile bar below it", () => {
      const { aside, mobileBar } = renderShell()
      expect(aside).toHaveClass("hidden", "md:flex")
      expect(mobileBar).toHaveClass("md:hidden")
    })

    it("uses the sidebar tokens for the menu surface", () => {
      const { aside } = renderShell()
      expect(aside).toHaveClass("bg-sidebar", "text-sidebar-foreground", "border-r")
    })
  })

  describe("menu header", () => {
    it("renders brand and brandText in the expanded menu", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        brand: <span data-testid="brand">D</span>,
        brandText: "Dash",
      })
      const header = aside.querySelector('[data-slot="app-shell-brand"]') as HTMLElement
      expect(within(header).getByTestId("brand")).toBeInTheDocument()
      expect(within(header).getByText("Dash")).toBeInTheDocument()
    })

    it("keeps only the brand mark in the collapsed rail", () => {
      const { aside } = renderShell({
        defaultCollapsed: true,
        brand: <span data-testid="brand">D</span>,
        brandText: "Dash",
      })
      const header = aside.querySelector('[data-slot="app-shell-brand"]') as HTMLElement
      expect(within(header).getByTestId("brand")).toBeInTheDocument()
      expect(within(header).queryByText("Dash")).not.toBeInTheDocument()
    })

    it("omits the header row when there is neither brand nor brandText", () => {
      const { aside, mobileBar } = renderShell({ defaultCollapsed: false })
      expect(aside.querySelector('[data-slot="app-shell-brand"]')).toBeNull()
      expect(mobileBar.querySelector('[data-slot="app-shell-brand-mark"]')).toBeNull()
      // The menu starts straight at the items.
      expect(aside.firstElementChild?.tagName).toBe("NAV")
    })

    it("renders the header row with brandText alone", () => {
      const { aside } = renderShell({ defaultCollapsed: false, brandText: "Dash" })
      const header = aside.querySelector('[data-slot="app-shell-brand"]') as HTMLElement
      expect(within(header).getByText("Dash")).toBeInTheDocument()
      expect(header.querySelector('[data-slot="app-shell-brand-mark"]')).toBeNull()
    })

    it("keeps the brand non-interactive without onBrandClick", () => {
      const { aside } = renderShell({ defaultCollapsed: false, brand: <span>D</span> })
      const mark = aside.querySelector('[data-slot="app-shell-brand-mark"]') as HTMLElement
      expect(mark.tagName).toBe("SPAN")
      expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument()
    })

    it("turns the brand into a 'Voltar' button with onBrandClick", async () => {
      const onBrandClick = vi.fn()
      const { aside } = renderShell({
        defaultCollapsed: false,
        brand: <span>D</span>,
        onBrandClick,
      })
      await userEvent.click(within(aside).getByRole("button", { name: "Voltar" }))
      expect(onBrandClick).toHaveBeenCalledTimes(1)
    })

    it("does not toggle the menu when the brand is clicked", async () => {
      const { root, aside } = renderShell({
        defaultCollapsed: false,
        brand: <span>D</span>,
        onBrandClick: () => {},
      })
      await userEvent.click(within(aside).getByRole("button", { name: "Voltar" }))
      expect(root).toHaveAttribute("data-state", "expanded")
    })

    it("gives the menu header and the navbar the same 64px height and bottom border", () => {
      const { aside, topBar } = renderShell({
        brand: <span>D</span>,
        navbar: <span>Busca</span>,
      })
      const header = aside.querySelector('[data-slot="app-shell-brand"]') as HTMLElement
      for (const bar of [header, topBar]) {
        expect(bar).toHaveClass("h-16", "shrink-0", "border-b")
      }
    })
  })

  describe("navbar", () => {
    it("hides the top bar on desktop when there is no navbar", () => {
      const { topBar } = renderShell()
      expect(topBar).toHaveClass("md:hidden")
      expect(topBar.querySelector('[data-slot="app-shell-navbar-content"]')).toBeNull()
    })

    it("renders the navbar once, in the top bar above the content", () => {
      const { topBar } = renderShell({ navbar: <span>Notificações</span> })
      expect(topBar).not.toHaveClass("md:hidden")
      expect(screen.getAllByText("Notificações")).toHaveLength(1)
      const content = topBar.querySelector('[data-slot="app-shell-navbar-content"]') as HTMLElement
      expect(within(content).getByText("Notificações")).toBeInTheDocument()
    })

    it("pads the navbar like the content so both line up", () => {
      const { topBar } = renderShell({ navbar: <span>Busca</span> })
      expect(topBar).toHaveClass("md:px-6")
    })

    it("places the navbar after the mobile menu button and brand", () => {
      const { topBar, mobileBar } = renderShell({
        brandText: "Dash",
        navbar: <span>Busca</span>,
      })
      const content = topBar.querySelector('[data-slot="app-shell-navbar-content"]') as HTMLElement
      expect(mobileBar.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
      expect(content).toHaveClass("justify-end", "md:justify-start")
    })
  })

  describe("footer", () => {
    it("renders nothing at the bottom of the menu without footer", () => {
      const { container } = renderShell({ defaultCollapsed: false })
      expect(container.querySelector('[data-slot="app-shell-footer"]')).toBeNull()
      // The lib no longer ships an account row or a sign-out button.
      expect(screen.queryByRole("button", { name: /sair/i })).not.toBeInTheDocument()
    })

    it("renders the footer below the collapse control", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        footer: <span>Conta</span>,
      })
      const footer = aside.querySelector('[data-slot="app-shell-footer"]') as HTMLElement
      expect(within(footer).getByText("Conta")).toBeInTheDocument()
      const collapse = aside.querySelector('[data-slot="app-shell-collapse"]') as HTMLElement
      expect(collapse.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
      expect(aside.lastElementChild).toBe(footer)
    })
  })

  describe("collapse", () => {
    it("starts collapsed by default", () => {
      const { root, aside } = renderShell()
      expect(root).toHaveAttribute("data-state", "collapsed")
      expect(aside).toHaveAttribute("data-state", "collapsed")
      expect(aside).toHaveClass("w-16")
      expect(within(aside).getByRole("button", { name: "Expandir menu" })).toBeInTheDocument()
    })

    it("starts expanded with defaultCollapsed={false}", () => {
      const { aside } = renderShell({ defaultCollapsed: false })
      expect(aside).toHaveAttribute("data-state", "expanded")
      expect(aside).toHaveClass("w-64")
      expect(within(aside).getByRole("button", { name: "Recolher menu" })).toBeInTheDocument()
      expect(within(aside).getByText("Recolher menu")).toBeInTheDocument()
    })

    it("toggles from the button at the bottom and persists the choice", async () => {
      const { aside } = renderShell()
      await userEvent.click(within(aside).getByRole("button", { name: "Expandir menu" }))
      expect(aside).toHaveAttribute("data-state", "expanded")
      expect(within(aside).getByText("Dashboard")).toBeInTheDocument()
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("false")

      await userEvent.click(within(aside).getByRole("button", { name: "Recolher menu" }))
      expect(aside).toHaveAttribute("data-state", "collapsed")
      expect(window.localStorage.getItem(STORAGE_KEY)).toBe("true")
    })

    it("points the collapse button at the menu it controls", () => {
      const { aside } = renderShell()
      const button = within(aside).getByRole("button", { name: "Expandir menu" })
      expect(aside.id).not.toBe("")
      expect(button).toHaveAttribute("aria-controls", aside.id)
    })

    it("reads the stored choice over defaultCollapsed", () => {
      window.localStorage.setItem(STORAGE_KEY, "false")
      const { aside } = renderShell({ defaultCollapsed: true })
      expect(aside).toHaveAttribute("data-state", "expanded")
    })

    it("reads a stored collapsed choice over defaultCollapsed={false}", () => {
      window.localStorage.setItem(STORAGE_KEY, "true")
      const { aside } = renderShell({ defaultCollapsed: false })
      expect(aside).toHaveAttribute("data-state", "collapsed")
    })

    it("ignores an unexpected stored value", () => {
      window.localStorage.setItem(STORAGE_KEY, "talvez")
      const { aside } = renderShell({ defaultCollapsed: false })
      expect(aside).toHaveAttribute("data-state", "expanded")
    })

    it("does not write to storage until the user toggles", () => {
      renderShell({ defaultCollapsed: false })
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it("keeps working when storage is blocked", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError")
      })
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("SecurityError")
      })
      const { aside } = renderShell({ defaultCollapsed: true })
      expect(aside).toHaveAttribute("data-state", "collapsed")
      await userEvent.click(within(aside).getByRole("button", { name: "Expandir menu" }))
      expect(aside).toHaveAttribute("data-state", "expanded")
    })

    it("hides labels and badges in the rail but keeps an accessible name", () => {
      const { aside } = renderShell({
        items: [{ ...items[0]!, badge: <span data-testid="badge">3</span> }, items[1]!],
      })
      expect(within(aside).queryByText("Dashboard")).not.toBeInTheDocument()
      expect(within(aside).queryByTestId("badge")).not.toBeInTheDocument()
      expect(within(aside).getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
      expect(within(aside).getByRole("link", { name: "Usuários" })).toBeInTheDocument()
    })
  })

  describe("useAppShell", () => {
    it("exposes the collapsed state to the footer and follows the toggle", async () => {
      const { aside } = renderShell({ footer: <FooterProbe /> })
      const probe = within(aside).getByTestId("footer-probe")
      expect(probe).toHaveAttribute("data-collapsed", "true")
      await userEvent.click(within(aside).getByRole("button", { name: "Expandir menu" }))
      expect(within(aside).getByTestId("footer-probe")).toHaveAttribute("data-collapsed", "false")
    })

    it("exposes the state to the navbar and the page", () => {
      function Probe({ id }: { id: string }) {
        const { collapsed, isMobile } = useAppShell()
        return <span data-testid={id}>{`${collapsed}:${isMobile}`}</span>
      }
      renderShell({ navbar: <Probe id="navbar" />, children: <Probe id="page" /> })
      expect(screen.getByTestId("navbar")).toHaveTextContent("true:false")
      expect(screen.getByTestId("page")).toHaveTextContent("true:false")
    })

    it("reports isMobile below 768px", () => {
      installMatchMedia(true)
      renderShell({ footer: <FooterProbe /> })
      expect(screen.getByTestId("footer-probe")).toHaveAttribute("data-mobile", "true")
    })

    it("throws a clear error outside <AppShell>", () => {
      vi.spyOn(console, "error").mockImplementation(() => {})
      expect(() => renderHook(() => useAppShell())).toThrow(
        "useAppShell() must be called inside <AppShell>.",
      )
    })
  })

  describe("items", () => {
    it("renders labels in the expanded menu", () => {
      const { aside } = renderShell({ defaultCollapsed: false })
      expect(within(aside).getByText("Dashboard")).toBeInTheDocument()
      expect(within(aside).getByText("Usuários")).toBeInTheDocument()
    })

    it("names the <nav> landmark", () => {
      const { aside } = renderShell({ defaultCollapsed: false })
      expect(within(aside).getByRole("navigation", { name: "Navegação principal" })).toBeVisible()
    })

    it("renders item.badge when expanded", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [{ ...items[0]!, badge: <span data-testid="badge">3</span> }],
      })
      expect(within(aside).getByTestId("badge")).toBeInTheDocument()
    })

    it("marks the active item via isActive", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        isActive: (item) => item.id === "dash",
      })
      const dash = within(aside).getByText("Dashboard").closest("a")
      expect(dash).toHaveAttribute("data-active", "true")
      expect(dash).toHaveAttribute("aria-current", "page")
      const users = within(aside).getByText("Usuários").closest("a")
      expect(users).not.toHaveAttribute("data-active")
      expect(users).not.toHaveAttribute("aria-current")
    })

    it("marks active groups and action items too", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        isActive: (item) => item.id !== "idle",
        items: [
          { id: "group", label: "Propostas", items: [{ id: "idle", label: "Pendentes" }] },
          { id: "action", label: "Configurações", onClick: () => {} },
        ],
      })
      expect(within(aside).getByRole("button", { name: "Propostas" })).toHaveAttribute(
        "data-active",
        "true",
      )
      expect(within(aside).getByRole("button", { name: "Configurações" })).toHaveAttribute(
        "data-active",
        "true",
      )
    })

    it("renders the submenu when the group has defaultOpen", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [
          {
            id: "reports",
            label: "Relatórios",
            icon: FileText,
            defaultOpen: true,
            items: [
              { id: "fin", label: "Financeiro", href: "#fin" },
              { id: "ops", label: "Operacional", href: "#ops" },
            ],
          },
        ],
      })
      expect(within(aside).getByText("Financeiro").closest("a")).toHaveClass("pl-9")
      expect(within(aside).getByText("Operacional")).toBeInTheDocument()
    })

    it("keeps the submenu closed by default and toggles it", async () => {
      const onGroupClick = vi.fn()
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [
          {
            id: "reports",
            label: "Relatórios",
            onClick: onGroupClick,
            items: [{ id: "fin", label: "Financeiro", href: "#fin" }],
          },
        ],
      })
      const trigger = within(aside).getByRole("button", { name: /relatórios/i })
      expect(trigger).toHaveAttribute("aria-expanded", "false")
      expect(within(aside).queryByText("Financeiro")).not.toBeInTheDocument()

      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      expect(trigger).toHaveAttribute("data-state", "open")
      expect(within(aside).getByText("Financeiro")).toBeInTheDocument()
      expect(onGroupClick).toHaveBeenCalledTimes(1)

      await userEvent.click(trigger)
      expect(within(aside).queryByText("Financeiro")).not.toBeInTheDocument()
    })

    it("hides the submenu in the collapsed rail", () => {
      const { aside } = renderShell({
        defaultCollapsed: true,
        items: [
          {
            id: "reports",
            label: "Relatórios",
            defaultOpen: true,
            items: [{ id: "fin", label: "Financeiro", href: "#fin" }],
          },
        ],
      })
      expect(within(aside).getByRole("button", { name: "Relatórios" })).toBeInTheDocument()
      expect(within(aside).queryByText("Financeiro")).not.toBeInTheDocument()
    })

    it("renders an item without href as a button and fires onClick", async () => {
      const onClick = vi.fn()
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [{ id: "cfg", label: "Configurações", onClick }],
      })
      const button = within(aside).getByRole("button", { name: "Configurações" })
      expect(button.tagName).toBe("BUTTON")
      expect(button).toHaveClass("text-left")
      await userEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("fires onClick on link items", async () => {
      const onClick = vi.fn()
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [{ id: "dash", label: "Dashboard", href: "#dash", onClick }],
      })
      await userEvent.click(within(aside).getByRole("link", { name: "Dashboard" }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("disables a button item", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [{ id: "cfg", label: "Configurações", onClick: () => {}, disabled: true }],
      })
      expect(within(aside).getByRole("button", { name: "Configurações" })).toBeDisabled()
    })

    it("marks a disabled anchor and blocks its navigation", () => {
      const onClick = vi.fn()
      const { aside } = renderShell({
        defaultCollapsed: false,
        items: [{ id: "x", label: "Item X", href: "#x", disabled: true, onClick }],
      })
      const link = within(aside).getByText("Item X").closest("a") as HTMLAnchorElement
      expect(link).toHaveAttribute("aria-disabled", "true")
      expect(link).toHaveAttribute("tabindex", "-1")
      expect(link).not.toHaveAttribute("href")
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      const preventDefault = vi.spyOn(event, "preventDefault")
      link.dispatchEvent(event)
      expect(preventDefault).toHaveBeenCalled()
      expect(onClick).not.toHaveBeenCalled()
    })

    describe("href protocol safety", () => {
      beforeEach(() => {
        vi.spyOn(console, "warn").mockImplementation(() => {})
      })

      it("renders javascript: hrefs as a button", () => {
        const { aside } = renderShell({
          defaultCollapsed: false,
          items: [{ id: "evil", label: "Evil", href: "javascript:alert(document.cookie)" }],
        })
        const evil = within(aside).getByText("Evil")
        expect(evil.closest("a")).toBeNull()
        expect(evil.closest("button")).not.toBeNull()
      })

      it("blocks vbscript: and file: hrefs", () => {
        const { aside } = renderShell({
          defaultCollapsed: false,
          items: [
            { id: "vbs", label: "VBS", href: "vbscript:msgbox" },
            { id: "file", label: "File", href: "file:///etc/passwd" },
          ],
        })
        expect(aside.querySelectorAll("nav a")).toHaveLength(0)
      })

      it("keeps mailto: and tel: hrefs as anchors", () => {
        const { aside } = renderShell({
          defaultCollapsed: false,
          items: [
            { id: "mail", label: "Email", href: "mailto:foo@bar.com" },
            { id: "tel", label: "Phone", href: "tel:+5511999999999" },
          ],
        })
        expect(within(aside).getByText("Email").closest("a")).not.toBeNull()
        expect(within(aside).getByText("Phone").closest("a")).not.toBeNull()
      })

      it("still fires onClick from the button fallback", async () => {
        const onClick = vi.fn()
        const { aside } = renderShell({
          defaultCollapsed: false,
          items: [{ id: "evil", label: "Evil", href: "javascript:alert(1)", onClick }],
        })
        await userEvent.click(within(aside).getByText("Evil"))
        expect(onClick).toHaveBeenCalledTimes(1)
      })

      it("warns in dev when an unsafe href is blocked", () => {
        renderShell({
          defaultCollapsed: false,
          items: [{ id: "evil", label: "Evil", href: "javascript:void(0)" }],
        })
        const message = String(vi.mocked(console.warn).mock.calls[0]?.[0] ?? "")
        expect(message).toContain("[AppShell]")
        expect(message).toContain("javascript:void(0)")
      })

      it("does not warn for safe or empty hrefs", () => {
        renderShell({
          defaultCollapsed: false,
          items: [
            { id: "ok", label: "Ok", href: "#ok" },
            { id: "empty", label: "Vazio", href: "" },
          ],
        })
        expect(console.warn).not.toHaveBeenCalled()
      })
    })
  })

  describe("mobile menu", () => {
    it("shows the brand in the mobile bar", () => {
      const { mobileBar } = renderShell({
        brand: <span data-testid="m-brand">D</span>,
        brandText: "Dash",
      })
      expect(within(mobileBar).getByTestId("m-brand")).toBeInTheDocument()
      expect(within(mobileBar).getByText("Dash")).toBeInTheDocument()
    })

    it("opens a dialog with the items, always expanded", async () => {
      installMatchMedia(true)
      renderShell({ defaultCollapsed: true })
      const trigger = screen.getByRole("button", { name: "Abrir menu" })
      expect(trigger).toHaveAttribute("aria-expanded", "false")

      const menu = await openMobileMenu()
      expect(trigger).toHaveAttribute("aria-expanded", "true")
      expect(within(menu).getByRole("navigation", { name: "Navegação principal" })).toBeVisible()
      expect(within(menu).getByText("Dashboard")).toBeInTheDocument()
      expect(within(menu).getByText("Dashboard").closest("a")).toHaveClass("min-h-11")
    })

    it("renders the brand, the brand text and the footer inside the menu", async () => {
      installMatchMedia(true)
      renderShell({
        brand: <span data-testid="brand">D</span>,
        brandText: "Dash",
        footer: <FooterProbe />,
      })
      const menu = await openMobileMenu()
      expect(within(menu).getByTestId("brand")).toBeInTheDocument()
      expect(within(menu).getByText("Dash")).toBeInTheDocument()
      // Desktop is collapsed by default, but the menu is the expanded layout.
      expect(within(menu).getByTestId("footer-probe")).toHaveAttribute("data-collapsed", "false")
    })

    it("closes after a link is chosen", async () => {
      installMatchMedia(true)
      renderShell()
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("link", { name: "Usuários" }))
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("closes after an action item and fires its onClick", async () => {
      installMatchMedia(true)
      const onClick = vi.fn()
      renderShell({ items: [{ id: "cfg", label: "Configurações", onClick }] })
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("button", { name: "Configurações" }))
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("stays open when a group is toggled and closes on its child link", async () => {
      installMatchMedia(true)
      renderShell({
        items: [
          {
            id: "propostas",
            label: "Propostas",
            items: [{ id: "pendentes", label: "Pendentes", href: "#pendentes" }],
          },
        ],
      })
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("button", { name: "Propostas" }))
      expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument()
      const child = within(menu).getByRole("link", { name: "Pendentes" })
      expect(child).toHaveClass("min-h-11")
      await userEvent.click(child)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("closes from the close button and returns focus to the trigger", async () => {
      installMatchMedia(true)
      renderShell()
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("button", { name: "Fechar menu" }))
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveFocus()
    })

    it("closes on Escape", async () => {
      installMatchMedia(true)
      renderShell()
      await openMobileMenu()
      await userEvent.keyboard("{Escape}")
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("calls onBrandClick from the menu and closes it", async () => {
      installMatchMedia(true)
      const onBrandClick = vi.fn()
      renderShell({ brand: <span>D</span>, onBrandClick })
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("button", { name: "Voltar" }))
      expect(onBrandClick).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("calls onBrandClick from the mobile bar", async () => {
      installMatchMedia(true)
      const onBrandClick = vi.fn()
      const { mobileBar } = renderShell({ brand: <span>D</span>, onBrandClick })
      await userEvent.click(within(mobileBar).getByRole("button", { name: "Voltar" }))
      expect(onBrandClick).toHaveBeenCalledTimes(1)
    })

    it("closes through useAppShell().closeMenu", async () => {
      installMatchMedia(true)
      renderShell({ footer: <FooterProbe /> })
      const menu = await openMobileMenu()
      await userEvent.click(within(menu).getByRole("button", { name: "Fechar pelo footer" }))
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("closes when the viewport grows past the breakpoint", async () => {
      const media = installMatchMedia(true)
      renderShell()
      await openMobileMenu()
      media.setMobile(false)
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  describe("labels", () => {
    it("ships pt-BR defaults", () => {
      expect(defaultAppShellLabels).toEqual({
        skipToContent: "Pular para o conteúdo",
        navigation: "Navegação principal",
        menu: "Menu",
        openMenu: "Abrir menu",
        closeMenu: "Fechar menu",
        collapse: "Recolher menu",
        expand: "Expandir menu",
        brandAction: "Voltar",
      })
    })

    it("overrides any label", async () => {
      installMatchMedia(true)
      const { aside } = renderShell({
        brand: <span>D</span>,
        onBrandClick: () => {},
        labels: {
          skipToContent: "Ir ao conteúdo",
          navigation: "Seções",
          menu: "Navegação",
          openMenu: "Mostrar menu",
          closeMenu: "Esconder menu",
          expand: "Abrir trilho",
          brandAction: "Início",
        },
      })
      expect(screen.getByRole("link", { name: "Ir ao conteúdo" })).toBeInTheDocument()
      expect(within(aside).getByRole("navigation", { name: "Seções" })).toBeInTheDocument()
      expect(within(aside).getByRole("button", { name: "Abrir trilho" })).toBeInTheDocument()
      expect(within(aside).getByRole("button", { name: "Início" })).toBeInTheDocument()

      await userEvent.click(screen.getByRole("button", { name: "Mostrar menu" }))
      const menu = screen.getByRole("dialog", { name: "Navegação" })
      expect(within(menu).getByRole("button", { name: "Esconder menu" })).toBeInTheDocument()
    })

    it("overrides the collapse label", () => {
      const { aside } = renderShell({
        defaultCollapsed: false,
        labels: { collapse: "Fechar trilho" },
      })
      expect(within(aside).getByRole("button", { name: "Fechar trilho" })).toBeInTheDocument()
    })
  })

  it("keeps the deprecated SidebarItem type assignable to AppShellItem", () => {
    const legacy: SidebarItem = { id: "a", label: "A", href: "#a" }
    const { aside } = renderShell({ defaultCollapsed: false, items: [legacy] })
    expect(within(aside).getByText("A")).toBeInTheDocument()
  })
})
