# 把小書包的資料存在家裡的群暉 NAS

設定好之後，女兒手機上的課表、打勾紀錄、練習成績都會存到家裡的 NAS。爸媽在自己的手機打開同一個網站，就能即時看到。資料不會放到 Google 或其他公司的伺服器。

整個流程分成三段，第一次大約 30–40 分鐘。建議用電腦操作 DSM。

---

## 一、在 NAS 上架好資料庫

**1. 看 NAS 是哪一種處理器**
DSM →「控制台」→「資訊中心」→「處理器」。
- Intel、AMD（大部分 + 系列機型）：不用改。
- Realtek、ARM（部分 j 系列、value 系列）：把 `docker-compose.yml` 裡的 `amd64` 改成 `arm64`。

**2. 下載這個資料夾**
在電腦打開 https://github.com/kaymico/kid-study-planner ，按綠色的「Code」→「Download ZIP」，解壓縮後找到 `nas` 資料夾。

**3. 放到 NAS 上**
用 File Station 在 `docker` 共用資料夾裡建立 `kid-planner` 資料夾，把 `nas` 裡的檔案都上傳進去：
```
docker/kid-planner/
  ├─ Dockerfile
  ├─ docker-compose.yml
  └─ pb_migrations/1760000000_kp_docs.js
```

**4. 建立專案**
打開「Container Manager」→「專案」→「新增」：
- 專案名稱：`kid-planner`
- 路徑：選剛剛的 `docker/kid-planner`
- 來源：「使用現有的 docker-compose.yml」
- 按「下一步」→「完成」。第一次會自動下載和建置，等它變成綠色的「執行中」。

**5. 建立管理員和家庭帳號**
在家裡用電腦開 `http://NAS的IP:8090/_/`（NAS 的 IP 可以在「控制台」→「網路」看到）。
1. 第一次會請你建立**管理員帳號**，密碼要設得長一點，這組只有你用。
2. 左邊選「users」→ 右上「New record」，建立一個**家庭帳號**：
   - email：隨便取，例如 `family@home.local`
   - password：至少 8 個字
   - 這組會放進女兒和你的手機裡。
3. 左邊應該會看到 `kp_docs` 這個資料表，代表設定成功了，不用動它。

---

## 二、讓手機在外面也連得到（HTTPS）

網站是 `https://`，所以 NAS 也必須是 `https://`，不然手機會擋掉。下面用群暉內建的免費功能來做。

**1. 申請免費網址**
「控制台」→「外部存取」→「DDNS」→「新增」：
- 服務供應商：Synology
- 主機名稱：自己取，例如 `mifamily`，網址就會是 `mifamily.synology.me`
- 勾選「**從 Let's Encrypt 取得憑證並將其設為預設**」
- 按「確定」

**2. 設定反向代理**
「控制台」→「登入入口」→「進階」→「反向代理伺服器」→「新增」：
- 名稱：`kid-planner`
- 來源：通訊協定 `HTTPS`，主機名稱 `mifamily.synology.me`，連接埠 `8443`
- 目的地：通訊協定 `HTTP`，主機名稱 `localhost`，連接埠 `8090`
- 「自訂標頭」→「新增」→「WebSocket」，這樣即時同步會更快
- 按「儲存」

**3. 指定憑證**
「控制台」→「安全性」→「憑證」→「設定」，找到 `mifamily.synology.me:8443` 那一行，憑證選 `mifamily.synology.me`。

**4. 路由器開連接埠**
在家裡的路由器（數據機）設定「連接埠轉送 / 虛擬伺服器」：外部 `8443` → NAS 的 IP，內部 `8443`。
不會設定的話，可以打電話問網路業者，例如中華電信，說「要把 8443 轉到 NAS」。

**5. 測試**
手機**關掉 Wi-Fi、改用行動網路**，打開 `https://mifamily.synology.me:8443/api/health`。
看到 `API is healthy` 就成功了。

---

## 三、在手機上開始同步

**女兒的手機**
1. 打開小書包 →「課表與課本」→ 最下面「家長同步」→「家裡的群暉 NAS」。
2. 填網址 `https://mifamily.synology.me:8443`，再填剛剛建立的家庭帳號和密碼。
3. 按「開始同步」。她手機上原本的資料會上傳到 NAS。
4. 畫面會出現「同步碼」，按「複製同步碼」，用 LINE 傳給爸媽。

**爸媽的手機**
1. 用 Safari 打開 https://kaymico.github.io/kid-study-planner/
2. 「課表與課本」→「家長同步」→「我有同步碼」，貼上同步碼，按「開始同步」。
3. 到「家長」分頁，用女兒手機上設定的家長帳號密碼登入。

---

## 四、（選擇性）讓 NAS 幫忙 AI 整理重點

設定之後，GitHub 網站版也能「按一下就整理好」：段考重點、拍照讀課表、拍聯絡簿、拍單字表都可以用。
沒設定的話，網站會改用「複製指令到 AI App、再把回答貼回來」的方式，一樣能用。

1. 到 https://console.anthropic.com 申請帳號，在「API Keys」建立一把金鑰（`sk-ant-` 開頭）。要先在 Billing 儲值，按用量計費。
2. 在 NAS 打開 `docker/kid-planner/docker-compose.yml`，把 `ANTHROPIC_API_KEY=` 後面填上金鑰。
3. Container Manager →「專案」→ kid-planner →「停止」→「建置」→「啟動」。
4. 手機重新打開小書包，「家長同步」那一格會寫「AI 整理也由 NAS 幫忙」。

金鑰只放在 NAS 上，手機和網站裡都沒有。如果想換別的 Claude 模型，可以在 `environment` 多加一行 `KP_MODEL=模型名稱`。

---

## 平常要注意

- **備份**：用「Hyper Backup」備份 `docker/kid-planner/pb_data` 資料夾。PocketBase 管理頁的 Settings → Backups 也可以一鍵備份。
- **NAS 關機或斷網時**：手機上的資料還在，可以照常使用，NAS 恢復後會再同步。
- **安全**：管理頁 `/_/` 從外面也連得到，管理員密碼一定要設長一點。同步碼裡面有家庭帳號密碼，只傳給家人。
- **不想開路由器的連接埠**：可以改用群暉套件中心的「Tailscale」。NAS 和兩支手機都裝 Tailscale App，不用開任何連接埠，但女兒手機要一直開著 Tailscale 才會同步。
