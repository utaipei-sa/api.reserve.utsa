# reserve.utsa

[![zh-tw](https://img.shields.io/badge/lang-zh--tw-blue.svg)](https://github.com/utaipei-sa/api.reserve.utsa/blob/main/README.zh-tw.md)

A platform to reserve the spaces and items managed by UTSA.

Develop documentation: [Wiki](https://github.com/utaipei-sa/reserve.utsa/wiki)

## Backend API Documentation

- **doc.reserve.utsa Repo: https://github.com/utaipei-sa/docs.reserve.utsa**
- Swagger UI: http://localhost:3000/docs
- Redoc: http://localhost:3000/redoc

## Environment setup

### Dev container (recommended)

#### Visual Studio Code

1. If you're using Windows OS, connect to WSL first.
2. Open project directory.
3. Select "Reopen in Container"

#### JetBrains IDEs

1. Open your project in one of JetBrains IDEs (**WebStorm** is recommended).
2. Open .devcontainer/devcontainer.json.
3. Click the icon near the `{` in the editor, then select "Create Dev Container and Mount Sources...".
4. Follow the instruction.

### Local/Docker

1. Install [Node.js](https://nodejs.org).
2. Install [MongoDB](https://www.mongodb.com/try/download/community).

## How to run

### Local
 
1. Install dependencies.

    ```sh
    npm install
    ```

2. Copy .env file.

    ```sh
    cp .env.template .env
    ```

3. Fill environment variables in `.env` according to the document.

4. Start the dev server.
    ```sh
    nodemon
    ```
    
    If you don't need auto reload, you can use the following command instead:
    
    ```sh
    npm start
    ```  

### Docker

Start Docker Compose containers.

```sh
docker compose up -d --build
```

## Environment variables

- `FRONTEND_BASE_URL` Base URL of website, is used to create verification link
- `RESERVE_MONGODB_URI` This URI is used when connecting to MongoDB.
- `EMAIL` Email address for sending email
- `EMAIL_PASSWORD` Password for login to Email address in `EMAIL`

## Contribution

Welcome!

Don't forget to update the docs after you update some code. (Especially the JSDoc comments of the APIs.)

## FQA

<details>

<summary>Why choose JavaScript?</summary>

Because it's simple. The CS department of our school has JavaScript-related courses, so there are more students who have JavaScript skills than TypeScript.

That's also the reason why we choose npm.

</details>
