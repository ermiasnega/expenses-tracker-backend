# Deployment Guide

## Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Git repository initialized
- Heroku account

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

## AWS Deployment

### Using Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB Application**
   ```bash
   eb init
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Set Environment Variables**
   ```bash
   eb setenv JWT_SECRET=your_secret_key
   eb setenv MONGODB_URI=your_mongodb_uri
   ```

5. **Deploy**
   ```bash
   eb deploy
   ```

## Google Cloud Platform Deployment

### Using App Engine

1. **Install Google Cloud SDK**
   ```bash
   curl https://sdk.cloud.google.com | bash
   ```

2. **Initialize GCP Project**
   ```bash
   gcloud init
   ```

3. **Deploy**
   ```bash
   gcloud app deploy
   ```

## Docker Deployment

### Build Docker Image
```bash
docker build -t expenses-tracker-backend .
```

### Run Container
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/expenses-tracker \
  -e JWT_SECRET=your_secret_key \
  expenses-tracker-backend
```

### Docker Compose
```bash
docker-compose up
```

## Environment Variables for Production

```
PORT=5000
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<strong_secret_key>
NODE_ENV=production
```

## Health Check

```bash
curl https://your-deployed-app.com/health
```

## Monitoring

- Use PM2 for process management
- Set up monitoring with New Relic or DataDog
- Configure log aggregation with ELK Stack
- Set up error tracking with Sentry
