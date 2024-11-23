import React from "react"
import { graphql } from "gatsby"
import Prism from "prismjs"
import "prismjs/components/prism-markup" // markup 하이라이팅 추가
import "prismjs/components/prism-css" // css 하이라이팅 추가
import "prismjs/components/prism-yaml" // yaml 하이라이팅 추가
import "prismjs/components/prism-json" // yaml 하이라이팅 추가
import "prismjs/components/prism-typescript" // typescript 하이라이팅 추가
import "prismjs/components/prism-python" // Python 하이라이팅 추가
import "prismjs/components/prism-java" // Java 하이라이팅 추가
import "prismjs/components/prism-csharp" // C# 하이라이팅 추가
import "prismjs/plugins/unescaped-markup/prism-unescaped-markup" // markup 하이라이트용 플러그인

import Layout from "../components/layout"
import Bio from "../components/bio"
import Seo from "../components/seo"

const BlogPostTemplate = ({ data: { notionPage, site }, location }) => {
  const { title, contentHtml } = notionPage
  const siteTitle = site.siteMetadata?.title || `Title`
  React.useEffect(() => {
    Prism.highlightAll() // 페이지 로드 후 Prism.js 초기화
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{title}</h1>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          itemProp="articleBody"
        />
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
    </Layout>
  )
}

export const Head = ({ data: { notionPage } }) => {
  return <Seo title={notionPage.title} />
}

export const query = graphql`
  query ($id: String!) {
    site {
      siteMetadata {
        title
      }
    }
    notionPage(id: { eq: $id }) {
      title
      contentHtml
    }
  }
`

export default BlogPostTemplate
