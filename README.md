# 小書包讀書計劃（可安裝版）

把這個資料夾整個放到任何 HTTPS 靜態網站（GitHub Pages、Netlify、Cloudflare Pages 都可以）。
用手機打開網址後：
- Android Chrome：畫面上會出現「安裝」，或從選單選「安裝應用程式」。
- iPhone Safari：按分享 →「加入主畫面」（iOS 16.4 以上，裝好後才能開通知）。

這個版本的資料存在手機的瀏覽器裡，沒有雲端同步，也沒有 AI 整理重點。
這兩個功能目前要在 Claude 上的版本使用；要放到自己的網站，需要再接一個後端
（帳號＋資料庫，例如 Firebase / Supabase，加上呼叫 Claude API 的伺服器）。

通知：App 開著或在背景時會跳出系統通知。App 完全關掉時也要準時提醒的話，
需要伺服器端的 Web Push（之後接後端時一起做）。
