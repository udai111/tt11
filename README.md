npm install
```

Create a `.env` file with the following variables:
```env
DATABASE_URL=your_database_url
PGHOST=your_db_host
PGPORT=your_db_port
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
```

## Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/trading-platform.git
git push -u origin main
```

### Netlify Deployment

1. Sign up or log in to [Netlify](https://www.netlify.com)

2. Connect your GitHub repository:
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist/public`

3. Configure environment variables:
   - Go to Site settings > Build & deploy > Environment
   - Add the following environment variables:
     ```
     DATABASE_URL=your_database_url
     PGHOST=your_db_host
     PGPORT=your_db_port
     PGUSER=your_db_user
     PGPASSWORD=your_db_password
     PGDATABASE=your_db_name
     NODE_ENV=production
     ```

4. Deploy your site:
   - Netlify will automatically deploy your site
   - Any push to the main branch will trigger a new deployment

5. Verify deployment:
   - Check the deployment logs for any errors
   - Test the API endpoints using the Netlify function URL
   - Verify database connectivity through the health check endpoint

### Troubleshooting

- If the build fails, check the build logs in Netlify
- Ensure all environment variables are correctly set
- Verify database connection string is correct
- Check the Functions log in Netlify for serverless function errors

### Development

For local development:
```bash
npm run dev