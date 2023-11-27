import Dexie from 'dexie';
import { getLoggedInUserInfo } from './authUtils';


const db = new Dexie('immerse');
const loggedInId = getLoggedInUserInfo().user_id;


db.version(1).stores({
    conversations: 'loggedInId, users',
});

export async function getConversations() {
    try {
        const conversation = await db.conversations.get(loggedInId);
        return conversation.users;
    } catch (error) {
        console.error(`Error getting conversations:`, error);
    }
}

export async function getConversationByUserId(userId) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        console.log('conversation', conversation);
        const user = conversation.users.find(user => user.id === userId);
        return user;
    } catch (error) {
        console.error(`Error getting conversation for user with id ${userId} in conversation for logged in user with id ${loggedInId}:`, error);
    }
}

export async function addConversation(users) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        if (conversation) {
            conversation.users = users;
            await db.conversations.put(conversation);
        } else {
            await db.conversations.put({ loggedInId, users });
        }
    } catch (error) {
        console.error('Error adding conversation:', error);
    }
}

export async function updateConversation(users) {
    try {
        await db.conversations.update(loggedInId, { users });
    } catch (error) {
        console.error(`Error updating conversation for user with id ${loggedInId}:`, error);
    }
}

export async function deleteConversation() {
    try {
        await db.conversations.delete(loggedInId);
    } catch (error) {
        console.error(`Error deleting conversation for user with id ${loggedInId}:`, error);
    }
}

export async function addMessage(userId, message) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        const user = conversation.users.find(user => user.id === userId);
        user.messages.push(message);
        await db.conversations.update(loggedInId, { users: conversation.users });
    } catch (error) {
        console.error(`Error adding message for user with id ${userId} in conversation for logged in user with id ${loggedInId}:`, error);
    }
}

export async function deleteMessage(userId, messageId) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        const user = conversation.users.find(user => user.id === userId);
        user.messages = user.messages.filter(message => message.id !== messageId);
        await db.conversations.update(loggedInId, { users: conversation.users });
    } catch (error) {
        console.error(`Error deleting message with id ${messageId} for user with id ${userId} in conversation for logged in user with id ${loggedInId}:`, error);
    }
}

export default db;