import React from 'react';
import './NotificationPage.css';

const notifications = [
  { id: 1, user: 'suru_queen', avatar: './src/images/image3.jpg', action: 'liked your post', time: '2m' },
  { id: 2, user: 'Vishu', avatar: './src/images/image1.jpg', action: 'started following you', time: '5m' },
  { id: 3, user: 'amit.verma', avatar: './src/images/image2.jpg', action: 'commented: "🔥"', time: '10m' },
  { id: 4, user: 'Punde yz', avatar: './src/images/image3.jpg', action: 'liked your post', time: '12m' },
  { id: 5, user: 'Vedu', avatar: './src/images/image2.jpg', action: 'mentioned you in a comment', time: '20m' },
];

const NotificationPage = () => (
  <div className="notification-page">
    <div className="notification-content">
     
      <h2 className="notification-title">Notifications</h2>
      <div className="notification-list">
        {notifications.map((n) => (
          <div className="notification-item" key={n.id}>
            <img className="notification-avatar" src={n.avatar} alt={n.user} />
            <div className="notification-content">
              <span className="notification-user">{n.user}</span> {n.action}
              <span className="notification-time">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default NotificationPage; 