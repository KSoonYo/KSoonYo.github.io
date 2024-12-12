const { notion } = require("./client")

// 특정 블록의 자식 블록 가져오기
const fetchChildBlocks = async blockId => {
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
    })
    return response.results
  } catch (error) {
    console.error("Error fetching child blocks:", error)
    return []
  }
}

const renderRichText = (richTextArray, isMarkedUp = false) => {
  return richTextArray
    .map(textObj => {
      let text = ""
      const { bold, italic, underline, strikethrough, code } =
        textObj.annotations

      if (textObj.type === "text") {
        let attributes = ""
        const content = textObj.text.content
        if (!isMarkedUp) {
          const hasLeftBracket = content.includes("<")
          const hasRightBracket = content.includes(">")

          text = content.replace(/</g, "").replace(/>/g, "")

          // bracket data 속성 추가
          if (hasLeftBracket) attributes += ' data-left-bracket="true"'
          if (hasRightBracket) attributes += ' data-right-bracket="true"'

          text = `<span${attributes}>${text}</span>`
        } else {
          text = textObj.text.content
        }

        // 링크가 있을 경우 <a> 태그로 감싸기
        if (textObj.text.link) {
          text = `<a href="${textObj.text.link.url}"${attributes}>${text}</a>`
        }

        if (bold) text = `<strong>${text}</strong>`
        if (italic) text = `<em>${text}</em>`
        if (underline) text = `<u>${text}</u>`
        if (strikethrough) text = `<s>${text}</s>`
        if (code) text = `<code>${text}</code>`

        return text
      }

      if (textObj.type === "mention") {
        const title = `${textObj?.mention?.link_mention?.title ?? "Untitled"}`
        const preview = `${
          textObj?.mention?.link_preview?.url ??
          "Unrecognized external link preview"
        }`
        const url = textObj.href ?? "/"
        switch (textObj.mention.type) {
          case "link_mention":
            text = `<a href="${url}">${title}</a>`
            break
          case "link_preview":
            text = `<a href="${url}">link:${preview}</a>`
            break
          default:
            text = `<a href="${url}">link:${"Unrecognized mention type"}</a>`
        }
        return text
      }
    })
    .join("") // 모든 텍스트를 하나의 문자열로 결합
}

const renderBlock = async (block, listCounter = 0) => {
  switch (block.type) {
    case "paragraph":
      return `<p>${
        block.paragraph?.rich_text
          ? renderRichText(block.paragraph.rich_text)
          : ""
      }</p>`
    case "heading_1":
      return `<h1>${
        block.heading_1?.rich_text
          ? renderRichText(block.heading_1.rich_text)
          : ""
      }</h1>`
    case "heading_2":
      return `<h2>${
        block.heading_2?.rich_text
          ? renderRichText(block.heading_2.rich_text)
          : ""
      }</h2>`
    case "heading_3":
      return `<h3>${
        block.heading_3?.rich_text
          ? renderRichText(block.heading_3.rich_text)
          : ""
      }</h3>`

    case "bulleted_list_item":
      const childBlocks = await fetchChildBlocks(block.id)
      let renderedChildren = []
      if (Array.isArray(childBlocks) && childBlocks.length > 0) {
        renderedChildren = await renderNotionBlocks(childBlocks)
      }
      return `<li>${
        block.bulleted_list_item?.rich_text
          ? renderRichText(block.bulleted_list_item.rich_text)
          : ""
      }${renderedChildren}</li>`

    case "numbered_list_item":
      const numberedChildBlocks = await fetchChildBlocks(block.id)
      let renderedNumberedChildren = ""
      if (
        Array.isArray(numberedChildBlocks) &&
        numberedChildBlocks.length > 0
      ) {
        renderedNumberedChildren = await renderNotionBlocks(
          numberedChildBlocks,
          listCounter + 1
        )
      }
      return `<li value="${listCounter}">${
        block.numbered_list_item?.rich_text
          ? renderRichText(block.numbered_list_item.rich_text)
          : ""
      }${renderedNumberedChildren}</li>`

    case "image":
      const imageUrl =
        block.image?.file?.url || block.image?.external?.url || ""
      const caption = `${block.image?.caption[0]?.plain_text}` ?? "Notion Image"
      return `<img src="${imageUrl}" alt="${caption}" />`

    // 코드 블록 처리
    case "code":
      const language = block.code.language || "plaintext" // 언어가 없으면 기본값으로 'plaintext'
      const markupLanguages = new Set(["html", "xml"])
      const isMarkedUp = markupLanguages.has(language)
      const codeContent = renderRichText(block.code.rich_text, isMarkedUp)

      if (isMarkedUp) {
        return `<pre class="language-markup"><code class="language-markup"><!--${codeContent}--></code></pre>`
      }
      return `<pre class="language-${language}"><code class="language-${language}">${codeContent}</code></pre>`

    case "quote":
      return `<blockquote class="notion-quote">${
        block.quote?.rich_text ? renderRichText(block.quote.rich_text) : ""
      }</blockquote>`

    default:
      return "" // 알 수 없는 블록 타입은 빈 문자열 반환
  }
}
const renderNotionBlocks = async (blocks, startCounter = 1) => {
  if (!blocks || !Array.isArray(blocks)) {
    return "" // blocks가 null이거나 배열이 아니면 빈 문자열 반환
  }

  let html = ""
  let listCounter = startCounter
  let inList = null

  for (const block of blocks) {
    if (block.type === "numbered_list_item") {
      if (inList !== "ol") {
        if (inList) html += `</${inList}>`
        html += "<ol>"
        inList = "ol"
      }
      html += await renderBlock(block, listCounter)
      listCounter++
    } else if (block.type === "bulleted_list_item") {
      if (inList !== "ul") {
        if (inList) html += `</${inList}>`
        html += "<ul>"
        inList = "ul"
      }
      html += await renderBlock(block)
    } else {
      if (inList) {
        html += `</${inList}>`
        inList = null
        listCounter = 1
      }
      html += await renderBlock(block)
    }
  }

  if (inList) {
    html += `</${inList}>`
  }

  return html
}

module.exports = { renderNotionBlocks }
