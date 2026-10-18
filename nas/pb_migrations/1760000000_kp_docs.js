/// <reference path="../pb_data/types.d.ts" />
// 小書包讀書計劃的資料表：每一筆是一份文件（planner/main、progress/日期、notes/編號…）
migrate((db) => {
  const collection = new Collection({
    name: "kp_docs",
    type: "base",
    schema: [
      { name: "owner", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", cascadeDelete: true, maxSelect: 1 } },
      { name: "path", type: "text", required: true, options: { max: 200 } },
      { name: "data", type: "json", required: false, options: { maxSize: 5000000 } },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_kp_docs_owner_path ON kp_docs (owner, path)"],
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != \"\" && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
  });
  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  return dao.deleteCollection(dao.findCollectionByNameOrId("kp_docs"));
});
