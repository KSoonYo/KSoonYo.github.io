import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"

const Sidebar = () => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark {
        group(field: { frontmatter: { category: SELECT } }) {
          fieldValue
          totalCount
          subcategories: group(
            field: { frontmatter: { subcategory: SELECT } }
          ) {
            fieldValue
            totalCount
          }
        }
      }
    }
  `)

  return (
    <aside className="global-sidebar">
      <h3> Category </h3>
      <ul>
        {data.allMarkdownRemark.group.map(category => (
          <li key={category.fieldValue}>
            <strong>{category.fieldValue}</strong>

            {category.subcategories.length > 0 && (
              <ul>
                {category.subcategories.map(subcategory => (
                  <li key={subcategory.fieldValue}>
                    <Link
                      to={`/categories/${category.fieldValue.toLowerCase()}/${subcategory.fieldValue.toLowerCase()}`}
                    >
                      {subcategory.fieldValue} ({subcategory.totalCount})
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
