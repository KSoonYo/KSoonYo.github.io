const { notion } = require("./client")

const fetchNotionPageContent = async pageId => {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    })
    return response.results
  } catch (error) {
    console.error("Error fetching Notion page content:", error)
    return []
  }
}
module.exports = { fetchNotionPageContent }
