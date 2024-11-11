import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const CategoryTemplate = ({
  data: { allMarkdownRemark, site },
  pageContext,
  location,
}) => {
  const { category, subcategory } = pageContext
  const siteTitle = site.siteMetadata?.title || "Category Title"
  const { edges } = allMarkdownRemark

  return (
    <Layout location={location} title={siteTitle}>
      <h1>
        카테고리: {category} <span aria-hidden="true"> {">"} </span>
        {subcategory}
      </h1>
      <ul>
        {edges.map(({ node }) => (
          <li key={node.id} className="category-list-item">
            <a href={node.fields.slug}>{node.frontmatter.title}</a> -{" "}
            {node.frontmatter.date}
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const Head = ({ pageContext }) => {
  const { category, subcategory } = pageContext

  return <Seo title={category + " > " + subcategory} />
}

export const query = graphql`
  query ($category: String!, $subcategory: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {
        frontmatter: {
          category: { eq: $category }
          subcategory: { eq: $subcategory }
        }
      }
      sort: { frontmatter: { date: DESC } }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`

export default CategoryTemplate
