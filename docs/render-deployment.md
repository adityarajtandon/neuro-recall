# Deploying NeuroRecall to Render

This guide walks through the steps to deploy the NeuroRecall backend to Render.

## Backend Deployment

### 1. Create a New Web Service

1. Sign in to your [Render dashboard](https://dashboard.render.com/)
2. Click "New" and select "Web Service"
3. Connect your GitHub repository or use the public repository URL

### 2. Configure the Web Service

- **Name**: neuro-recall-backend (or your preferred name)
- **Environment**: Node
- **Region**: Choose the region closest to your users
- **Branch**: main (or your deployment branch)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or select a paid plan for production use)

### 3. Set Environment Variables

Add the following environment variables in the Render dashboard:

- `PORT`: 10000 (or any port Render allows)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing
- `OPENAI_API_KEY`: Your OpenAI API key

### 4. Deploy

Click "Create Web Service" to deploy your backend.

## Frontend Deployment (Vercel)

For the frontend, we recommend deploying to Vercel:

1. Push your code to GitHub
2. Sign in to [Vercel](https://vercel.com/)
3. Import your repository
4. Configure the build settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`
5. Set environment variables:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., https://neuro-recall-backend.onrender.com/api)
6. Deploy

## Troubleshooting

### Common Issues:

1. **Connection Errors**: Make sure your MongoDB Atlas IP whitelist allows connections from anywhere (0.0.0.0/0)
2. **CORS Errors**: Verify the CORS configuration in your backend
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Failures**: Check the build logs for specific errors

### Checking Logs

To debug issues, check the logs in your Render dashboard:

1. Go to your Web Service
2. Click on "Logs" in the navigation menu
3. Review the logs for error messages

## Updating Your Deployment

When you push changes to your connected repository, Render will automatically rebuild and deploy your application. 