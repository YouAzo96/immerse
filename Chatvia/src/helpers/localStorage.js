import Dexie from 'dexie';

const db = new Dexie('immerse');

db.version(1).stores({
    users: '++id, name, profilePicture, status, unRead, roomType, isGroup, messages ',
});

export function getUsers() {
    return db.users.toArray();
}

export function getUser(id) {
    return db.users.get(id);
}

export function addUser(user) {
    db.users.add(user);
}

export function updateUser(id, user) {
    db.users.update(id, user);
}

export function deleteUser(id) {
    db.users.delete(id);
}

export function addMessage(userId, message) {
    return db.users.update(userId, { messages: Dexie.Modify.push(message) });
}

export function deleteMessage(userId, messageId) {
    return db.users.update(userId, { messages: Dexie.Modify.delete(messageId, 'id') });
}

export default db;