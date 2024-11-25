/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const path = require(`path`)
const {
  fetchNotionPageContent,
  renderNotionBlocks,
  fetchNotionData,
} = require("./utils/notion")

// Define the template for blog post
const blogPost = path.resolve(`./src/templates/blog-post.js`)

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // GraphQL로 모든 NotionPage 노드를 쿼리
  const result = await graphql(`
    query {
      allNotionPage {
        nodes {
          id
          title
          contentHtml
          fields {
            slug
          }
        }
      }
    }
  `)

  const pages = result.data?.allNotionPage?.nodes
  if (!pages || pages.length === 0) {
    throw new Error("There are no posts in Notion!")
  }

  // 각 Notion 페이지에 대한 블로그 포스트 페이지 생성
  pages.forEach(page => {
    createPage({
      path: page.fields.slug,
      component: blogPost,
      context: {
        id: page.id,
        title: page.title,
        contentHtml: page.contentHtml,
      },
    })
  })
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const response = await fetchNotionData()

  const pages = response.results
  if (pages.length === 0) {
    throw new Error("No posts in Notion")
  }

  // 각 페이지를 Gatsby 노드로 변환
  for (const page of pages) {
    const nodeId = createNodeId(`NotionPage-${page.id}`)
    const nodeContent = JSON.stringify(page)
    // 페이지의 블록 콘텐츠 가져오기
    const pageBlocks = await fetchNotionPageContent(page.id)

    // 블록을 HTML로 변환
    const contentHtml = await renderNotionBlocks(pageBlocks)

    createNode({
      ...page,
      id: nodeId,
      parent: "",
      children: [],
      internal: {
        type: "NotionPage", // 노드 타입 설정
        content: nodeContent,
        contentDigest: createContentDigest(page),
      },
      title: page.properties.Name?.title[0]?.plain_text || "Untitled",
      contentHtml,
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === "NotionPage") {
    createNodeField({
      node,
      name: "slug",
      value: `/blog/${node.id}`,
    })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  // Also explicitly define the Markdown frontmatter
  // This way the "MarkdownRemark" queries will return `null` even when no
  // blog posts are stored inside "content/blog" instead of returning an error
  createTypes(`
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      github: String
    }

    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      fields: Fields
    }

    type Frontmatter {
      title: String
      description: String
      date: Date @dateformat
      category: String
    }

    type Fields {
      slug: String
    }
  `)
}
