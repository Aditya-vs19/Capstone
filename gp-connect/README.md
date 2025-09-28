# GP-Connect Frontend

A modern social media application built with React and Vite, featuring email verification with OTP.

## Features

- **User Authentication** with email verification
- **OTP Verification** via email
- **Social Media Feed** with posts and interactions
- **Responsive Design** for mobile and desktop
- **Real-time Features** (messages, notifications)
- **Community Management**

## Tech Stack

- **React 19.1.1** with Vite 7.1.7
- **React Router DOM 7.7.0** for navigation
- **Bootstrap 5.3.7** + React Bootstrap for UI
- **Axios 1.10.0** for API calls
- **Tailwind CSS 4.1.11** for styling

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_BASE_URL=ws://localhost:5000/ws
```

### 3. Backend Setup
Make sure your backend server is running on `http://localhost:5000` with email verification configured.

**Required Backend Environment Variables:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Email Verification Setup

#### Gmail Configuration (Recommended)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for this application
4. Use your Gmail address as `EMAIL_USER`
5. Use the generated App Password as `EMAIL_PASS`

#### Other Email Providers
- **SendGrid**: Use `smtp.sendgrid.net` as host
- **Outlook**: Use `smtp-mail.outlook.com` as host
- Update `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS` accordingly

### 5. Start Development Server
```bash
npm run dev
```

## User Registration Flow

1. **Registration Form**: Users enter full name, email, enrollment number (7 digits), and password
2. **Email Verification**: System sends 6-digit OTP to user's email
3. **OTP Verification**: User enters OTP to verify email
4. **Account Activation**: User can now login with verified account

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with OTP
- `POST /api/auth/verify` - OTP verification
- `POST /api/auth/login` - User login (requires verified email)

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/user/:id` - Get user's posts
- `DELETE /api/posts/:id` - Delete post

## Deployment

### Frontend (Netlify)
1. Build the project: `npm run build`
2. Deploy to Netlify with the `dist` folder
3. Set environment variables in Netlify dashboard

### Backend (Heroku/Railway)
1. Deploy backend with email configuration
2. Update frontend environment variables with production backend URL

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP credentials in backend `.env`
   - Verify Gmail App Password is correct
   - Check email provider settings

2. **OTP Verification Fails**
   - Ensure OTP is entered within 10 minutes
   - Check if OTP is exactly 6 digits
   - Verify email address is correct

3. **Login Issues**
   - Ensure email is verified before login
   - Check if user account exists
   - Verify password is correct

4. **CORS Errors**
   - Update backend CORS origin to match frontend URL
   - Check if backend is running on correct port

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── OtpVerificationPage.jsx
│   ├── HomePage.jsx
│   └── ...
├── services/           # API services
│   └── api.js
└── App.jsx            # Main app component
```

### Key Features Implemented
- ✅ Email verification with OTP
- ✅ User registration with enrollment validation
- ✅ Secure authentication flow
- ✅ Responsive UI design
- ✅ Error handling and validation
- ✅ Loading states and user feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.