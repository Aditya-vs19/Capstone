# 🚀 Deployment Guide - Netlify Hosting

## Prerequisites
- GitHub account
- Netlify account
- Your React app ready for production

## Step 1: Prepare Your Code

### 1.1 Build Your App Locally
```bash
npm run build
```
This creates a `dist` folder with your production-ready app.

### 1.2 Test Production Build
```bash
npm run preview
```
Visit `http://localhost:4173` to test your production build.

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name it `gp-connect-frontend`
4. Make it public or private
5. Don't initialize with README (you already have one)

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/gp-connect-frontend.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### 3.1 Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"
4. Choose "GitHub"
5. Select your `gp-connect-frontend` repository

### 3.2 Configure Build Settings
Netlify will auto-detect these settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### 3.3 Deploy
Click "Deploy site" and wait for the build to complete.

## Step 4: Configure Environment Variables

### 4.1 In Netlify Dashboard
1. Go to Site settings → Environment variables
2. Add these variables:

```
VITE_API_BASE_URL=https://your-django-backend.herokuapp.com/api
VITE_WS_BASE_URL=wss://your-django-backend.herokuapp.com/ws
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 4.2 Redeploy
After adding environment variables, trigger a new deployment:
1. Go to Deploys tab
2. Click "Trigger deploy" → "Deploy site"

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `gpconnect.com`)
4. Follow DNS configuration instructions

### 5.2 SSL Certificate
Netlify automatically provides SSL certificates for all sites.

## Step 6: Backend Deployment

### 6.1 Deploy Django Backend
You'll need to deploy your Django backend separately:

**Option A: Heroku**
```bash
# Install Heroku CLI
# Create Procfile
# Deploy to Heroku
```

**Option B: Railway**
```bash
# Connect GitHub repo to Railway
# Configure environment variables
# Deploy automatically
```

**Option C: DigitalOcean App Platform**
```bash
# Create app from GitHub
# Configure build settings
# Deploy
```

### 6.2 Update Frontend API URLs
Once backend is deployed, update the environment variables in Netlify with your actual backend URLs.

## Step 7: Testing

### 7.1 Test All Features
- ✅ User registration/login
- ✅ Profile editing
- ✅ Post creation
- ✅ Like/comment functionality
- ✅ Real-time messaging
- ✅ Notifications
- ✅ Community features

### 7.2 Performance Testing
- Use Lighthouse in Chrome DevTools
- Test on mobile devices
- Check loading speeds

## Step 8: Monitoring

### 8.1 Netlify Analytics
- Enable analytics in Netlify dashboard
- Monitor site performance
- Track user behavior

### 8.2 Error Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API calls
- Check WebSocket connections

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check Node.js version
   - Verify all dependencies are installed
   - Check for syntax errors

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Redeploy after adding variables
   - Check variable names in code

3. **API Calls Failing**
   - Verify backend is deployed and accessible
   - Check CORS settings in Django
   - Ensure API URLs are correct

4. **WebSocket Connection Issues**
   - Verify WebSocket URL is correct
   - Check if backend supports WebSocket
   - Ensure SSL certificates are valid

## Performance Optimization

### 1. Image Optimization
- Use WebP format
- Implement lazy loading
- Optimize image sizes

### 2. Code Splitting
- Already configured in Vite
- Monitor bundle sizes
- Use dynamic imports where needed

### 3. Caching
- Netlify handles static asset caching
- Implement service worker for offline support
- Use CDN for better performance

## Security

### 1. Environment Variables
- Never commit sensitive data
- Use Netlify's environment variable system
- Rotate API keys regularly

### 2. CORS Configuration
- Configure Django CORS settings properly
- Only allow necessary origins
- Use secure headers

### 3. Content Security Policy
- Implement CSP headers
- Sanitize user inputs
- Validate file uploads

## Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update Node.js version when needed

### 2. Backup Strategy
- Regular database backups
- Version control for all code
- Document configuration changes

### 3. Monitoring
- Set up uptime monitoring
- Monitor error rates
- Track performance metrics

---

## 🎉 Your App is Now Live!

Your Instagram-like social media app is now publicly accessible at:
`https://your-app-name.netlify.app`

### Next Steps:
1. Test all functionality thoroughly
2. Deploy your Django backend
3. Update environment variables with real backend URLs
4. Set up monitoring and analytics
5. Consider custom domain
6. Implement additional features

### Support:
- Netlify Documentation: https://docs.netlify.com
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev 