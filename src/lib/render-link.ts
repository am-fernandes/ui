import * as React from "react"

/**
 * O que a lib entrega para o link de um item de navegação: tudo que um `<a>`
 * aceita, com `href` sempre presente. Inclui `className`, `aria-current`,
 * `children` e o `onClick` da própria lib (que fecha o menu no celular, por
 * exemplo), então repasse tudo ao elemento que você renderizar.
 */
export interface RenderLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  ref?: React.Ref<HTMLAnchorElement>
}

/**
 * Troca o `<a>` da lib pelo link do seu roteador, sem recarregar a página:
 *
 * ```tsx
 * // React Router
 * renderLink={({ href, ...props }) => <Link to={href} {...props} />}
 * // Next.js
 * renderLink={(props) => <Link {...props} />}
 * ```
 */
export type RenderLink = (props: RenderLinkProps) => React.ReactElement

/** Renderiza o link do consumidor quando há `renderLink`; senão, um `<a>`. */
export function renderLinkElement(
  renderLink: RenderLink | undefined,
  props: RenderLinkProps,
): React.ReactElement {
  if (renderLink) return renderLink(props)
  return React.createElement("a", props)
}
