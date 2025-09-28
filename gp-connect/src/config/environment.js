// Environment configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    WS_BASE_URL: 'ws://localhost:8000/ws',
    FIREBASE_CONFIG: {
      apiKey: "your-dev-firebase-api-key",
      authDomain: "your-dev-project.firebaseapp.com",
      projectId: "your-dev-project-id",
      storageBucket: "your-dev-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "your-dev-app-id"
    }
  },
  production: {
    API_BASE_URL: 'https://your-django-backend.herokuapp.com/api',
    WS_BASE_URL: 'wss://your-django-backend.herokuapp.com/ws',
    FIREBASE_CONFIG: {
      apiKey: "your-prod-firebase-api-key",
      authDomain: "your-prod-project.firebaseapp.com",
      projectId: "your-prod-project-id",
      storageBucket: "your-prod-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "your-prod-app-id"
    }
  }
};

const environment = import.meta.env.MODE || 'development';
export default config[environment]; 