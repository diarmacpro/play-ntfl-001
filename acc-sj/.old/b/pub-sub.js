// pubsub-client.js
/**
 * @class PubSubClient
 * Kelas untuk mengelola koneksi dan operasi Pub/Sub dengan Ably.
 * Menggunakan SDK Ably di browser.
 */
class PubSubClient {
		/**
		 * Ini adalah metode pertama yang Anda gunakan untuk
		 * membuat instance klien. Anda hanya perlu menyediakan API key Anda.
		 * Kode ini akan menginisiasi koneksi ke server Ably.
		 * Pesan ✅ Connected to Ably! atau ❌ Connection failed:
		 * akan muncul di konsol browser.
		 */
		/**
		 * @param {string} apiKey - API key Ably Anda.
		 */
		constructor(apiKey) {
				// Menggunakan objek global 'Ably' yang disediakan oleh CDN
				this.realtime = new Ably.Realtime(apiKey);

				// Menerapkan event listener untuk status koneksi
				this.realtime.connection.on('connected', () => {
						console.log('✅ Connected to Ably!');
				});
				this.realtime.connection.on('failed', (error) => {
						console.error('❌ Connection failed:', error);
				});
		}



		/**
		 * Metode ini digunakan untuk mendapatkan referensi ke sebuah channel.
		 * Meskipun metode ini tidak digunakan secara langsung di contoh Anda,
		 * ia berfungsi sebagai pembantu internal untuk metode lain.
		 * 
		 * Metode ini akan mengembalikan objek channel yang bisa Anda gunakan
		 * untuk operasi seperti subscribe atau publish secara langsung,
		 * jika Anda tidak ingin menggunakan metode subscribe atau
		 * publish yang sudah ada di kelas ini.
		 * 
		 * 
		 * 
		 * Mengambil objek channel tertentu.
		 * @param {string} channelName Nama channel.
		 * @returns {Ably.Channel}
		 */
		getChannel(channelName) {
				return this.realtime.channels.get(channelName);
		}

		/**
		 * Metode ini digunakan untuk mendengarkan pesan
		 * dari channel tertentu dengan event yang spesifik.
		 * 
		 * Parameter:
		 * channelName: Nama channel tempat Anda ingin mendengarkan pesan.
		 * eventName: Nama event atau topik yang ingin Anda terima.
		 * callback: Sebuah fungsi yang akan dijalankan setiap kali pesan
		 * dengan eventName yang sesuai diterima.
		 * Fungsi ini menerima satu argumen: message.
		 * 
		 * 
		 * 
		 * Dengan kode di atas, setiap kali ada pesan baru dengan
		 * event new-order di channel orders, fungsi messageHandler
		 * akan dieksekusi, dan konten pesan akan ditampilkan di konsol.
		 * 
		 * Subscribe ke pesan dari sebuah channel.
		 * @param {string} channelName Nama channel.
		 * @param {string} eventName Nama event yang akan disubscribe.
		 * @param {function} callback Handler untuk pesan yang diterima.
		 * @returns {Promise<void>}
		 */
		async subscribe(channelName, eventName, callback) {
				const channel = this.getChannel(channelName);
				channel.subscribe(eventName, callback);
				console.log(`📡 Subscribed to channel '${channelName}' with event '${eventName}'.`);
		}

		/**
		 * Metode ini digunakan untuk mengirim pesan ke
		 * sebuah channel dengan event tertentu.
		 * 
		 * Parameter:
		 * channelName: Nama channel tujuan.
		 * eventName: Nama event atau topik pesan.
		 * data: Payload atau konten pesan yang bisa
		 * berupa string, objek, atau data lainnya.
		 * 
		 * 
		 * 
		 * Pesan ini akan diterima oleh semua klien yang
		 * telah subscribe ke channel orders dengan event new-order.
		 * 
		 * Publish pesan ke sebuah channel.
		 * @param {string} channelName Nama channel.
		 * @param {string} eventName Nama event.
		 * @param {any} data Payload pesan.
		 * @returns {Promise<void>}
		 */
		async publish(channelName, eventName, data) {
				const channel = this.getChannel(channelName);
				await channel.publish(eventName, data);
				console.log(`📤 Message published to '${channelName}' on event '${eventName}'.`);
		}

		/**
		 * Metode ini digunakan untuk berhenti
		 * mendengarkan pesan dari sebuah channel.
		 * 
		 * Parameter:
		 * channelName: Nama channel.
		 * eventName: Nama event yang ingin dihentikan.
		 * callback: Referensi ke fungsi handler yang
		 * ingin Anda hapus (sama seperti yang Anda gunakan di subscribe).
		 * 
		 * 
		 * 
		 * Setelah kode ini dijalankan, messageHandler tidak akan lagi
		 * menerima pesan dari channel orders,
		 * meskipun pesan-pesan dengan new-order masih dikirim.
		 * 
		 * Unsubscribe dari pesan.
		 * @param {string} channelName Nama channel.
		 * @param {string} eventName Nama event.
		 * @param {function} callback Handler yang akan dihapus.
		 * @returns {Promise<void>}
		 */
		async unsubscribe(channelName, eventName, callback) {
				const channel = this.getChannel(channelName);
				channel.unsubscribe(eventName, callback);
				console.log(`🛑 Unsubscribed from channel '${channelName}' with event '${eventName}'.`);
		}

		/**
		 * Metode ini digunakan untuk memutuskan koneksi
		 * ke Ably secara aman (graceful close).
		 * 
		 * 
		 * 
		 * Kode ini akan memulai proses penutupan koneksi.
		 * Setelah berhasil, pesan 🔒 Connection closed.
		 * akan muncul di konsol. Ini penting untuk
		 * mengakhiri koneksi saat aplikasi tidak lagi memerlukannya.
		 * 
		 * Menutup koneksi Ably secara graceful.
		 */
		close() {
				if (this.realtime.connection.state !== 'closed') {
						this.realtime.connection.close();
						this.realtime.connection.once('closed', () => {
								console.log('🔒 Connection closed.');
						});
				}
		}
}