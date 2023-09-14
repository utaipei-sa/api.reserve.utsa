# Prologue
Welcome join us!

This app is a platform that faces students, clubs, school departments, etc. to reserve the spaces and items managed by UTSA. It is mainly written in Javascript, using Node.js (version 20), Express.js, and Handlebars view engine.

Here are some resources to learn about building the app:
- Express.js: [Getting started](https://expressjs.com/en/starter/installing.html)
- Handlebars: [Language guide](https://handlebarsjs.com/guide/)
- Git: [How to write git commit messages](https://wadehuanglearning.blogspot.com/2019/05/commit-commit-commit-why-what-commit.html)
- PostgreSQL: [PostgreSQL user manual in Traditional Chinese](https://docs.postgresql.tw/tutorial)
- Docker: [Get started](https://docs.docker.com/get-started/)
- JavaScript, HTML, CSS, etc.: There are lots of documents and tutorials on the Internet, please search by yourself.

If you don't know where to start, you can visit the Git commit history.

Commands to run this app:
- ~~MacOS or Linux: `DEBUG=reserve.utsa:* npm start`~~
- ~~Windows with Command Prompt: `set DEBUG=reserve.utsa:* & npm start`~~
- ~~Windows with PowerShell: `$env:DEBUG='reserve.utsa:*'; npm start`~~
- `docker compose up --build`

Result: [`http://localhost:3000`](http://localhost:3000)

Welcome and have a pleasant dev journey!

# About the Project
## Route Map
```
/reserve
├── /signin      => sign in and sign up (staff only for now)
├── /signout     => sign out
├── /reserve     => reserve spaces and items
├── /manage/<id> => edit or cancel the reserve
├── /timetable   => spaces and items list
|   ├── /<space> => showing what time is available
|   ├── /<item>  => showing the table of time and quantity
├── /dashboard   => staff only
└── /......
```

### `/signin`
- Sign in and sign up start with the same page.
- Support **Passkey**.
- Support **Sign in with Google** (in the future)

### `/signout`
- Sign out and redirect to the home page.

### `/reserve`
- Form
- Users can reserve multiple time slots of spaces and items in just 1 submit.
- Auto check whether the time slots are reserved when users filling the form.
- Shows a window/block to let the user check whether the content they filled is correct.
- After the user submit the form, send an email to the user. The email contains the link to manage the reservation.

### `/manage/<id>`
- Edit the reserve, including time slots, spaces and items.
- Cancel the whole reservation.

### `/timetable`
- Links to spaces and items page

#### `/<Space>`
- Spaces:
    - Student Activity Center
    - Outdoor Stage
    - etc.
- Table:
    - Rows: Date
    - Columns: Time slots
    - Cells: Available / Unavailable (Staff can watch the detail, including manage link)
    
#### `/<item>`
- Items:
    - Chairs
    - Tables
    - etc.
- Table:
    - Rows: Date
    - Columns: Time slots
    - Cells: How many items are available (Staff can watch the detail, including manage link)

### `/dashboard`
- If not signed in: redirect to the sign-in page
- Info:
    - The following space and item reserve
- Links:
    - `/timetable`

## Database Structure
- Database: reserve.utsa
- Tables:
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
