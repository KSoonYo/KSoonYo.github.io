const { notion, databaseId } = require("./client")

const fetchNotionData = async () => {
  try {
    // Notion 데이터베이스 쿼리
    const response = await notion.databases.query({
      database_id: databaseId,
    })
    return response
  } catch (e) {
    console.error(e)
  }
}
module.exports = { fetchNotionData }
