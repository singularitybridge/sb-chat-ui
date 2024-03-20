import Pusher from 'pusher-js';

const pusher = new Pusher('7e8897731876adb4652f', {
    cluster: 'eu',
});

export { pusher };