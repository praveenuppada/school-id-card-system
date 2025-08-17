# 🚀 School ID Card Management System - Deployment Guide

## 📋 **Prerequisites**

1. **GitHub Account** - To host your code
2. **MongoDB Atlas Account** - For database (free tier available)
3. **Cloudinary Account** - For image storage (free tier available)
4. **Domain Name** - For your website (optional but recommended)

---

## 🔧 **Step 1: Prepare Your Code**

### 1.1 Create GitHub Repository
```bash
# Initialize git in your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/school-id-card-system.git
git push -u origin main
```

### 1.2 Update Environment Variables
Create `.env` file in backend folder with your production values:

```env
# Production Environment Variables
NODE_ENV=production
PORT=8081

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_id_card_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# File Upload Limits
MAX_FILE_SIZE=10485760

# CORS Configuration
FRONTEND_URL=https://your-domain.com
```

---

## 🌐 **Step 2: Deploy Backend (Railway)**

### 2.1 Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### 2.2 Deploy Backend
1. **Connect GitHub Repository**
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Choose the `backend` folder

2. **Configure Environment Variables**
   - Go to Variables tab
   - Add all environment variables from `.env` file

3. **Deploy**
   - Railway will automatically detect Node.js
   - Deploy will start automatically
   - Get your backend URL (e.g., `https://your-app.railway.app`)

---

## 🎨 **Step 3: Deploy Frontend (Vercel)**

### 3.1 Setup Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 3.2 Configure Frontend
1. **Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Environment Variables**
   - Add `VITE_API_URL=https://your-backend-url.railway.app`

3. **Deploy**
   - Vercel will automatically deploy
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

---

## 🔗 **Step 4: Connect Frontend to Backend**

### 4.1 Update API Configuration
In `src/services/api.js`, update the base URL:

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://your-backend-url.railway.app',
  timeout: 10000,
});
```

### 4.2 Update CORS in Backend
In `backend/server.js`, update CORS configuration:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'https://your-domain.com',
    'http://localhost:5175' // for development
  ],
  credentials: true
}));
```

---

## 🌍 **Step 5: Buy and Configure Domain**

### 5.1 Purchase Domain
Recommended domain registrars:
- **Namecheap** - Good prices, easy setup
- **GoDaddy** - Popular, good support
- **Google Domains** - Clean interface

### 5.2 Configure DNS
1. **For Frontend (Vercel)**
   - Add custom domain in Vercel dashboard
   - Update DNS records as instructed

2. **For Backend (Railway)**
   - Add custom domain in Railway dashboard
   - Update DNS records as instructed

### 5.3 SSL Certificates
- Vercel and Railway provide automatic SSL
- Your site will be accessible via `https://`

---

## 🔒 **Step 6: Security & Performance**

### 6.1 Security Checklist
- [ ] Strong JWT secret
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers

### 6.2 Performance Optimization
- [ ] Enable compression
- [ ] Optimize images
- [ ] Enable caching
- [ ] Monitor performance

---

## 📊 **Step 7: Monitoring & Maintenance**

### 7.1 Monitoring Tools
- **Railway Dashboard** - Monitor backend
- **Vercel Analytics** - Monitor frontend
- **MongoDB Atlas** - Monitor database

### 7.2 Backup Strategy
- **Database**: MongoDB Atlas provides backups
- **Code**: GitHub provides version control
- **Images**: Cloudinary provides redundancy

---

## 🚀 **Step 8: Go Live!**

### 8.1 Final Checklist
- [ ] Backend deployed and working
- [ ] Frontend deployed and working
- [ ] Domain configured
- [ ] SSL certificates active
- [ ] Admin account created
- [ ] Test all features

### 8.2 Share Your Application
- Share your domain URL
- Create user documentation
- Set up support channels

---

## 💰 **Estimated Costs**

### Monthly Costs:
- **Domain**: $10-15/year
- **Railway**: Free tier (then $5-20/month)
- **Vercel**: Free tier (then $20/month)
- **MongoDB Atlas**: Free tier (then $9/month)
- **Cloudinary**: Free tier (then $89/month)

**Total**: $0-150/month depending on usage

---

## 🆘 **Troubleshooting**

### Common Issues:
1. **CORS Errors**: Check CORS configuration
2. **Database Connection**: Verify MongoDB URI
3. **Image Upload**: Check Cloudinary credentials
4. **Build Failures**: Check Node.js version

### Support:
- Railway Documentation
- Vercel Documentation
- MongoDB Atlas Support
- Cloudinary Support

---

## 🎉 **Congratulations!**

Your School ID Card Management System is now live and accessible to the public!

**Your Application URL**: `https://your-domain.com`

**Admin Login**: Use the credentials you created
**Teacher Login**: Use the teacher credentials

---

## 📞 **Need Help?**

If you encounter any issues during deployment:
1. Check the error logs in Railway/Vercel
2. Verify all environment variables
3. Test locally first
4. Contact support if needed

**Good luck with your deployment! 🚀**
