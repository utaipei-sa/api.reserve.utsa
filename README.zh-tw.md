# reserve.utsa

[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/utaipei-sa/api.reserve.utsa/blob/main/README.md)

UTSA 管理的空間及物品預約平台。

開發文件：[Wiki](https://github.com/utaipei-sa/reserve.utsa/wiki)

## 後端 API 文件

- **doc.reserve.utsa Repo: https://github.com/utaipei-sa/docs.reserve.utsa**
- Swagger UI: http://localhost:3000/docs
- Redoc: http://localhost:3000/redoc

## 如何運行

### 本地

1. `cd backend`  
2. `npm install`  
3. `nodemon`（如果你不需要自動重新載入，可以使用 `npm start`）

### Docker

1. `docker-compose up -d --build`

### 開發容器

#### Visual Studio Code

1. 如果你使用的是 Windows 作業系統，請先連線至 WSL（Windows 的 Linux 子系統）
2. 打開專案目錄
3. 選擇「在容器中重新開啟」
4. 開始你的開發之旅！

#### JetBrains 整合式開發環境

1. 在其中一個 JetBrains IDE（建議使用 **WebStorm**）中開啟你的專案
2. 打開 .devcontainer/devcontainer.json
3. 點擊編輯器中 `{` 旁邊的圖標，然後選擇「建立開發容器並掛載原始碼...」
4. 按照說明操作，即可享受你的開發旅程！

## 環境變數

- `RESERVE_MONGODB_URI` 這個 URI 用於連接到 MongoDB。
