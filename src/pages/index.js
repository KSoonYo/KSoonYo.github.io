import * as React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Bio from "../components/bio"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const pages = data.allNotionPage.nodes

  if (!pages || pages.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <p>{"There are no posts!"}</p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Bio />
      <ol style={{ listStyle: `none` }}>
        {pages.map(page => {
          const title = page.title || "Untitled"

          return (
            <li
              key={page.id}
              style={{
                listStyle: "none",
              }}
            >
              <article
                className="post-list-item"
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={page.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                </header>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export default BlogIndex

export const Head = () => <Seo title="All posts" />

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allNotionPage {
      nodes {
        id
        title
        fields {
          slug
        }
      }
    }
  }
`
