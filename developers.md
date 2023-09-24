# 前言 Prologue
歡迎你的加入！  
Welcome join us!  

這項專案是一個面向學生、社團及學校單位的平台，提供預約學生會場地及借用物品的服務。  
This app is a platform that faces students, clubs, school departments, etc. to reserve the spaces and items managed by UTSA.   

這項專案主要由 JavaScript 撰寫，使用 Node.js(版本20)、Express.js框架、Handlebars樣板引擎和Bootstrap。  
It is mainly written in Javascript, using Node.js (version 20), Express.js, Handlebars view engine, and Bootstrap.  

以下是一些學習資源：  
Here are some resources to learn about building the app:
- Express.js: [Getting started](https://expressjs.com/en/starter/installing.html)
- Handlebars: [Language guide](https://handlebarsjs.com/guide/)
- Git: [How to write git commit messages](https://wadehuanglearning.blogspot.com/2019/05/commit-commit-commit-why-what-commit.html)
- PostgreSQL: [PostgreSQL user manual in Traditional Chinese](https://docs.postgresql.tw/tutorial)
- Docker: [Get started](https://docs.docker.com/get-started/)
- JavaScript, HTML, CSS, etc.: There are lots of documents and tutorials on the Internet, please search by yourself.

如果你不知道從何開始，可以看看 Commit 紀錄。  
If you don't know where to start, you can visit the Git commit history.  

執行這個 App 的指令：  
Commands to run this app:
- ~~MacOS or Linux: `DEBUG=reserve.utsa:* npm start`~~
- ~~Windows with Command Prompt: `set DEBUG=reserve.utsa:* & npm start`~~
- ~~Windows with PowerShell: `$env:DEBUG='reserve.utsa:*'; npm start`~~
- `docker compose up --build`

執行結果：  
Result: [`http://localhost:3000`](http://localhost:3000)  

歡迎並祝你有個愉快的開發旅程！  
Welcome and have a pleasant dev journey!  

# 關於專案 About the Project
## 路徑地圖 Route Map
```
/reserve
├── /signin      => 登入或註冊（現只開放工作人員） sign in and sign up (staff only for now)
├── /signout     => 登出 sign out
├── /reserve     => 預約 reserve spaces and items
├── /manage/<id> => 編輯或取消預約 edit or cancel the reserve
├── /timetable   => 場地及物品清單及連結 spaces and items list
|   ├── /<space> => 顯示可預約時段 showing what time is available
|   ├── /<item>  => 顯示可借用時段及數量 showing the table of time and quantity
├── /dashboard   => 工作人員儀表板 staff only
└── /......
```

### `/signin`
- 於同一頁面登入或註冊  
  Sign in and sign up start with the same page
- 支援「**通行密鑰**」  
  Support **Passkey**.
- 支援「**使用Google登入**」（未來功能）  
  Support **Sign in with Google** (in the future)

### `/signout`
- 登出並重新導向至首頁  
  Sign out and redirect to the home page

### `/reserve`
- 表單  
  Form
- 使用者可以只填一次表單，同時借用多個時段的場地及物品  
  Users can reserve multiple time slots of spaces and items in just 1 submit
- 填寫時自動確認該時段是否可借用  
  Auto check whether the time slots are reserved when users filling the form
- 填寫完畢後顯示對話框，讓使用者確認填寫的內容是否正確  
  Shows a window/block to let the user check whether the content they filled is correct
- 使用者送出表單後，自動寄送Email給使用者，而該封Email包含管理該次借用的連結  
  After the user submit the form, send an email to the user. The email contains the link to manage the reservation

### `/manage/<id>`
- 編輯預約紀錄，包含時段、空間及物品  
  Edit the reserve, including time slots, spaces and items
- 取消預約  
  Cancel the whole reservation

### `/timetable`
- 各空間及物品預約狀況表的連結  
  Links to spaces and items page

#### `/<Space>`
- 空間 Spaces:
    - 學生活動中心 Student Activity Center
    - 小舞台 Outdoor Stage
    - 其他 etc.
- 預約狀況表 Table:
    - 列：日期  
      Rows: Date
    - 欄：時段  
      Columns: Time slots
    - 儲存格：可用／不可用（工作人員可以看到細節及管理連結）  
      Cells: Available / Unavailable (Staff can watch the detail, including manage link)
    
#### `/<item>`
- 物品 Items:
    - 椅子 Chairs
    - 長桌 Tables
    - 其他 etc.
- 借用狀況表 Table:
    - 列：日期  
      Rows: Date
    - 欄：時段  
      Columns: Time slots
    - 儲存格：多少數量可供借用（工作人員可以看到細節及管理連結）  
      Cells: How many items are available (Staff can watch the detail, including manage link)

### `/dashboard`
- 若未登入：重新導向至登入頁面  
  If not signed in: redirect to the sign-in page
- 資訊 Info:
    - 場地及物品預約情況  
      The reservation of the spaces and items
- 連結 Links:
    - `/timetable`

## 資料庫結構 Database Structure
- 資料庫 Database: reserve.utsa
- 表格 Tables:
    - users: staff users (for now)
        - id: 
        - name:
        - email:
        - passkey:
        - 
    - reservations: 
        - id:
        - item: (including space)
        - org:
        - contact:
        - email:
        - datetime:
        - note: 
        - 
