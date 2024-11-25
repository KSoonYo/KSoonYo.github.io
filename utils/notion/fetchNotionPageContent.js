const { notion } = require("./client")

const fetchNotionPageContent = async pageId => {
  try {
    let allBlocks = []
    let hasMore = true
    let startCursor

    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: startCursor,
        page_size: 100, // 한 번에 가져올 최대 블록 수
      })

      allBlocks = [...allBlocks, ...response.results]
      hasMore = response.has_more
      startCursor = response.next_cursor
    }

    return allBlocks
  } catch (error) {
    console.error("Error fetching Notion page content:", error)
    return []
  }
}

module.exports = { fetchNotionPageContent }
