const { Client } = require("@notionhq/client")
require("dotenv").config()

// Notion API 클라이언트 설정
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID

module.exports = { notion, databaseId }
