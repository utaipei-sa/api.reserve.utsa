# reserve.utsa

[![zh-tw](https://img.shields.io/badge/lang-zh--tw-blue.svg)](https://github.com/utaipei-sa/api.reserve.utsa/blob/main/README.zh-tw.md)

A platform to reserve the spaces and items managed by UTSA.

Develop documentation: [Wiki](https://github.com/utaipei-sa/reserve.utsa/wiki)

## Backend API Documentation

- **doc.reserve.utsa Repo: https://github.com/utaipei-sa/docs.reserve.utsa**
- Swagger UI: http://localhost:3000/docs
- Redoc: http://localhost:3000/redoc

## How to run

### Local

1. `cd backend`  
2. `npm install`  
3. `cp .env.template .env`
4. Fill environment variables in `.env` according to the document
5. `nodemon` (if you don't need auto reload, you can use `npm start`)  

### Docker

1. `docker-compose up -d --build`

### Dev container

#### Visual Studio Code

1. If you're using Windows OS, connect to WSL first.
2. Open project directory.
3. Select "Reopen in Container"
4. Start your development journey!

#### JetBrains IDEs

1. Open your project in one of JetBrains IDEs (**WebStorm** is recommended).
2. Open .devcontainer/devcontainer.json.
3. Click the icon near the `{` in the editor, then select "Create Dev Container and Mount Sources...".
4. Follow the instruction, and enjoy your development journey!

## Environment variables

- `FRONTEND_BASE_URL` Base URL of website, is used to create verification link
- `RESERVE_MONGODB_URI` This URI is used when connecting to MongoDB.
- `EMAIL` Email address for sending email
- `EMAIL_PASSWORD` Password for login to Email address in `EMAIL`
