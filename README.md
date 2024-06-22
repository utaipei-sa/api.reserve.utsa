# reserve.utsa
A platform to reserve the spaces and items managed by UTSA.

Develop documentation: [Wiki](https://github.com/utaipei-sa/reserve.utsa/wiki)

### Back-end API Documentation
- Swagger UI: http://localhost:3000/docs
- Redoc: http://localhost:3000/redoc

### How to run:  
**back end**  
1. `cd backend`  
2. `npm install`  
3. `nodemon` (if you don't need auto reload, you can use `npm start`)  

**fornt end**  
1. `cd frontend`  
2. `npm install`  
3. `npm run dev`  

**backend by docker**

1. `docker-compose up -d --build`

### Environment variables:  
- `RESERVE_MONGODB_URI` This URI is used when connecting to MongoDB.
