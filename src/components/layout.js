import * as React from "react"
import { Link } from "gatsby"
import "prismjs/themes/prism.css"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main className="global-main">
        <section>{children}</section>
      </main>
      <footer>
        <span
          style={{
            marginRight: "0.5rem",
          }}
        >
          © {new Date().getFullYear()}, Built with
        </span>
        <a style={{ marginRight: "0.5rem" }} href="https://www.gatsbyjs.com">
          Gatsby
        </a>
        <a href="https://developers.notion.com/docs/getting-started">
          Notion API
        </a>
      </footer>
    </div>
  )
}

export default Layout
