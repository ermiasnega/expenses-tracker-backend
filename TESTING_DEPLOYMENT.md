# Expenses Tracker Backend - Testing & Deployment Guide

## Testing

### Running Tests

```bash
npm test
```

### Test Files

- `tests/auth.test.js` - Authentication routes tests
- `tests/expenses.test.js` - Expenses routes tests
- `tests/categories.test.js` - Categories routes tests

### Test Coverage

```bash
npm test -- --coverage
```

### Running Specific Tests

```bash
# Test authentication
npm test -- auth.test.js

# Test expenses
npm test -- expenses.test.js

# Test categories
npm test -- categories.test.js
```

## Deployment Options

### 1. Heroku (Easiest)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_atlas_uri

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 2. Docker

```bash
# Build image
docker build -t expenses-tracker-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/expenses-tracker \
  -e JWT_SECRET=your_secret_key \
  expenses-tracker-backend
```

### 3. Docker Compose

```bash
# Start services
docker-compose up

# Stop services
docker-compose down
```

### 4. AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

### 5. Google Cloud App Engine

```bash
# Deploy
gcloud app deploy
```

## CI/CD Pipeline

GitHub Actions workflows are configured:

- **tests.yml** - Runs tests on push/PR to main and develop
- **deploy.yml** - Automatically deploys to Heroku on push to main

### Setting up GitHub Secrets

For deployment, add these secrets to your GitHub repository:

```
HEROKU_API_KEY - Your Heroku API key
HEROKU_APP_NAME - Your Heroku app name
HEROKU_EMAIL - Your Heroku email
```

## Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Enable HTTPS
- [ ] Set NODE_ENV to production
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable CORS only for your frontend
- [ ] Set up error tracking (Sentry)
- [ ] Configure database backups
- [ ] Test all endpoints

## Environment Variables

```
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/expenses-tracker
JWT_SECRET=your_strong_secret_key_min_32_chars
NODE_ENV=production
```

## Monitoring

### Health Check
```bash
curl https://your-app.com/health
```

### Recommended Tools
- New Relic - Application monitoring
- DataDog - Infrastructure monitoring
- Sentry - Error tracking
- LogRocket - Session replay

## Troubleshooting

### App crashes
1. Check logs: `heroku logs --tail`
2. Verify environment variables
3. Check MongoDB connection

### Connection issues
1. Verify MongoDB URI
2. Check IP whitelist in MongoDB Atlas
3. Test connection locally

### Performance issues
1. Enable caching
2. Optimize database queries
3. Use CDN for static files
4. Implement rate limiting
