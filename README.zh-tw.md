# reserve.utsa

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/utaipei-sa/api.reserve.utsa/blob/main/README.md)

UTSA 管理的空間及物品預約平台。

開發文件：[Wiki](https://github.com/utaipei-sa/reserve.utsa/wiki)

## 後端 API 文件

- **doc.reserve.utsa Repo: https://github.com/utaipei-sa/docs.reserve.utsa**
- Swagger UI: http://localhost:3000/docs
- Redoc: http://localhost:3000/redoc

## 環境設置

### 開發容器（推薦）

#### Visual Studio Code

1. 如果你使用的是 Windows 作業系統，請先連線至 WSL（Windows 的 Linux 子系統）
2. 打開專案目錄
3. 選擇「在容器中重新開啟」

#### JetBrains 整合式開發環境

1. 在其中一個 JetBrains IDE 中（建議使用 **WebStorm**）開啟你的專案
2. 打開 .devcontainer/devcontainer.json
3. 點擊編輯器中 `{` 旁邊的圖標，然後選擇「建立開發容器並掛載原始碼...」
4. 按照提示操作

### 本地／Docker

1. 安裝 [Node.js](https://nodejs.org)。
2. 安裝 [MongoDB](https://www.mongodb.com/try/download/community)。

## 如何運行

### 本地

1. 安裝相依套件。

    ```sh
    npm install
    ```

2. 複製 .env 檔案。

    ```sh
    cp .env.template .env
    ```

3. 根據文件描述填寫 `.env` 內的環境變數。

4. 啟動開發用伺服器。

    ```sh
    nodemon
    ```

    如果你不需要自動重新載入，可以改用以下指令：

    ```sh
    npm start
    ```

### Docker

啟動 Docker Compose 容器。

```sh
docker compose up -d --build
```

## 環境變數

- `FRONTEND_BASE_URL` 網站的 URL，用於創建驗證鏈接
- `RESERVE_MONGODB_URI` 這個 URI 用於連接到 MongoDB。
- `EMAIL` 用於發送電子郵件給使用者的電子郵件地址
- `EMAIL_PASSWORD` 用於登錄 `EMAIL` 中電子郵件地址的密碼

## 開發協作

非常歡迎！

更新程式時，別忘了更新文件（尤其是 API 的 JSDoc 註解）

## 問答

<details>

<summary>為什麼選擇 JavaScript？</summary>

因為 JavaScript 比較簡單（學校有教），考量後續負責維護的同學程度，所以選擇了 JavaScript 而非 TypeScript。

這也是為什麼我們選擇了 npm。

</details>
