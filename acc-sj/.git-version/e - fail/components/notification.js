/**
 * Professional Notification System
 * Handles all types of notifications with animations and proper UX
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = this.createContainer();
    this.maxNotifications = 5;
  }

  /**
   * Create notification container
   */
  createContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Show notification
   */
  show(message, type = 'info', options = {}) {
    const notification = this.createNotification(message, type, options);
    this.addNotification(notification);
    
    // Auto-remove after duration
    const duration = options.duration || this.getDefaultDuration(type);
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
    
    return notification.id;
  }

  /**
   * Create notification element
   */
  createNotification(message, type, options) {
    const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const config = this.getTypeConfig(type);
    const hasAction = options.action && options.actionText;
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `
      bg-white rounded-xl shadow-lg border-l-4 ${config.borderColor} 
      p-4 animate-slide-down pointer-events-auto transform transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
    `;
    
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center">
            <i class="bi ${config.icon} ${config.textColor} text-sm"></i>
          </div>
        </div>
        <div class="ml-3 flex-1">
          ${options.title ? `<p class="text-sm font-semibold text-gray-800">${options.title}</p>` : ''}
          <p class="text-sm text-gray-700 ${options.title ? 'mt-1' : ''}">${message}</p>
          ${hasAction ? `
            <div class="mt-3">
              <button class="text-xs font-medium ${config.actionColor} hover:underline" onclick="notificationManager.handleAction('${id}', ${JSON.stringify(options.action).replace(/"/g, '&quot;')})">
                ${options.actionText}
              </button>
            </div>
          ` : ''}
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="notificationManager.remove('${id}')">
            <i class="bi bi-x-lg text-sm"></i>
          </button>
        </div>
      </div>
      ${options.progress ? `
        <div class="mt-3">
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div class="bg-gradient-to-r ${config.progressColor} h-1.5 rounded-full transition-all duration-300" style="width: ${options.progress}%"></div>
          </div>
        </div>
      ` : ''}
    `;
    
    return { id, element: notification, type, options };
  }

  /**
   * Get configuration for notification type
   */
  getTypeConfig(type) {
    const configs = {
      success: {
        icon: 'bi-check-circle-fill',
        borderColor: 'border-green-500',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        actionColor: 'text-green-600',
        progressColor: 'from-green-500 to-green-600'
      },
      error: {
        icon: 'bi-exclamation-triangle-fill',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        actionColor: 'text-red-600',
        progressColor: 'from-red-500 to-red-600'
      },
      warning: {
        icon: 'bi-exclamation-circle-fill',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        actionColor: 'text-orange-600',
        progressColor: 'from-orange-500 to-orange-600'
      },
      info: {
        icon: 'bi-info-circle-fill',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        actionColor: 'text-blue-600',
        progressColor: 'from-blue-500 to-blue-600'
      }
    };
    
    return configs[type] || configs.info;
  }

  /**
   * Get default duration for notification type
   */
  getDefaultDuration(type) {
    const durations = {
      success: 4000,
      error: 8000,
      warning: 6000,
      info: 5000
    };
    
    return durations[type] || 5000;
  }

  /**
   * Add notification to container
   */
  addNotification(notification) {
    // Remove oldest if at max capacity
    if (this.notifications.length >= this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.remove(oldest.id);
    }
    
    this.notifications.push(notification);
    this.container.appendChild(notification.element);
    
    // Trigger animation
    setTimeout(() => {
      notification.element.classList.add('animate-slide-down');
    }, 10);
  }

  /**
   * Remove notification
   */
  remove(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;
    
    // Add exit animation
    notification.element.classList.add('animate-slide-up', 'opacity-0');
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.remove();
      }
      this.notifications = this.notifications.filter(n => n.id !== id);
    }, 300);
  }

  /**
   * Handle notification action
   */
  handleAction(id, action) {
    if (typeof action === 'function') {
      action();
    }
    this.remove(id);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications.forEach(notification => {
      this.remove(notification.id);
    });
  }

  /**
   * Show success notification
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Show error notification
   */
  error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  /**
   * Show warning notification
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * Show info notification
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show loading notification with progress
   */
  loading(message, options = {}) {
    return this.show(message, 'info', {
      ...options,
      duration: 0, // Don't auto-remove
      progress: options.progress || 0
    });
  }

  /**
   * Update progress of existing notification
   */
  updateProgress(id, progress) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      const progressBar = notification.element.querySelector('.bg-gradient-to-r');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }
}

// Create global notification manager
window.notificationManager = new NotificationManager();