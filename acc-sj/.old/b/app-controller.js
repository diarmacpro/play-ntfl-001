/**
 * PubSub client module for real-time communication
 */
export class PubSubManager {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = null;
        this.initialized = false;
    }

    /**
     * Initialize PubSub client
     */
    async initialize() {
        try {
            if (typeof window.PubSubClient !== 'undefined') {
                this.client = new window.PubSubClient(this.apiKey);
                this.initialized = true;
                console.log('PubSub client initialized successfully');
            } else {
                console.warn('PubSubClient not available');
            }
        } catch (error) {
            console.error('Error initializing PubSub client:', error);
        }
    }

    /**
     * Subscribe to channel and message type
     * @param {string} channel - Channel name
     * @param {string} messageType - Message type
     * @param {Function} handler - Message handler
     */
    subscribe(channel, messageType, handler) {
        if (this.initialized && this.client) {
            this.client.subscribe(channel, messageType, handler);
        }
    }

    /**
     * Publish message to channel
     * @param {string} channel - Channel name
     * @param {string} messageType - Message type
     * @param {Object} data - Message data
     */
    publish(channel, messageType, data) {
        if (this.initialized && this.client) {
            this.client.publish(channel, messageType, data);
        }
    }

    /**
     * Close PubSub connection
     */
    close() {
        if (this.initialized && this.client) {
            this.client.close();
        }
    }

    /**
     * Setup example chat handlers
     */
    setupExampleHandlers() {
        const handleChatMessage = (message) => {
            console.log('📩 Chat Message:', message.data);
        };

        const handleStatusMessage = (message) => {
            console.log('🔔 Status Update:', message.data);
        };

        this.subscribe('my-app-channel', 'chat-message', handleChatMessage);
        this.subscribe('my-app-channel', 'status-update', handleStatusMessage);

        // Example usage after 2 seconds
        setTimeout(() => {
            this.publish('my-app-channel', 'chat-message', { user: 'Alice', text: 'Halo, semua!' });
            this.publish('my-app-channel', 'status-update', { user: 'System', status: 'User Alice joined the chat.' });
        }, 2000);

        // Close connection after 10 seconds
        setTimeout(() => this.close(), 10000);
    }
}