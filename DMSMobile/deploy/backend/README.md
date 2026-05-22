# Backend Deployment

The backend source code is located in the `../../backend` directory.

## Deployment Steps

1. **Prepare the Server:**
   - Ensure Node.js 18+ and PostgreSQL are installed.
   - Create a PostgreSQL database (and a shadow database for migrations).

2. **Upload Code:**
   - Copy the contents of the `../../backend` folder to your server.
   - Example: `scp -r backend/ user@your-server:/var/www/dms-backend`

3. **Install Dependencies:**
   ```bash
   cd /var/www/dms-backend
   npm install
   ```

4. **Configure Environment:**
   - Create a `.env` file (based on `.env.example`).
   - Set `DATABASE_URL` and `SHADOW_DATABASE_URL`.
   - Set `JWT_SECRET`.

5. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Start the Server:**
   ```bash
   npm run build
   npm start
   ```
   (Use a process manager like PM2 for production: `pm2 start dist/index.js --name dms-backend`)

