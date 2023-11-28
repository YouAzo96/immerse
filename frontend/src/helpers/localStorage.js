import Dexie from 'dexie';

  const db = new Dexie('immerse');
  db.version(1).stores({
    conversations: 'loggedInId, users',
  });


export async function getConversations(loggedInId) {
    try {
        console.log('loggedInId', loggedInId);
        const conversation = await db.conversations.get(loggedInId);
        if (!conversation) {
            return null;
        }
        return conversation.users;
    } catch (error) {
        if (error.name === 'DataError') {
            console.warn(`No conversations found for user with id ${loggedInId}`);
            return null;
        }
        console.error(`Error getting conversations:`, error);
    }
}

export async function getConversationByUserId(loggedInId ,userId) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        console.log('conversation', conversation.users);

        // Find the user in the conversation.users array
        const userData = conversation.users.find(user => user.id === userId);

        if (userData) {
            console.log('user', userData);

            // Accumulate messages from each user in the conversation
            const allMessages = conversation.users.reduce((acc, user) => {
                if (user.messages) {
                    return acc.concat(user.messages);
                }
                return acc;
            }, []);

            console.log('allMessages', allMessages);

            return userData;
        } else {
            console.log(`User with ID ${userId} not found in conversation`);
            return null;
        }
    } catch (error) {
        console.error(`Error getting conversation for user with id ${userId}:`, error);
    }
}

export async function addConversation(loggedInId,user) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        if (conversation) {
            // Check if user is already in the array
            const existingUser = conversation.users.find(existingUser => existingUser.id === user.id);
            if (existingUser) {
                // If user is already in the array, return the existing user
                return existingUser;
            } else {
                // If not, add it
                conversation.users.push(user);
                await db.conversations.put(conversation);
            }
        } else {
            await db.conversations.put({ loggedInId, users: [user] });
        }
        window.location.reload();
    } catch (error) {
        console.error('Error adding conversation:', error);
    }
}

export async function updateConversation(loggedInId,user) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        const existingUserIndex = conversation.users.findIndex(existingUser => existingUser.id === user.id);

        if (existingUserIndex !== -1) {
            // If user is already in the array, update the message
            conversation.users[existingUserIndex].messages = user.messages;
        } else {
            // If not, add the user
            conversation.users.push(user);
        }
        await db.conversations.put(conversation);
    } catch (error) {
        console.error(`Error updating conversation for user with id ${loggedInId}:`, error);
    }
}

export async function deleteConversation(loggedInId) {
    try {
        await db.conversations.delete(loggedInId);
    } catch (error) {
        console.error(`Error deleting conversation for user with id ${loggedInId}:`, error);
    }
}

export async function addMessage(loggedInId, userId, message) {
    try {
        const conversation = await db.conversations.get(loggedInId);
        const user = conversation.users.find(user => user.id === userId);
        user.messages.push(message);
        await db.conversations.update(loggedInId, { users: conversation.users });
    } catch (error) {
        console.error(`Error adding message for user with id ${userId} in conversation for logged in user with id ${loggedInId}:`, error);
    }
}

export async function deleteMessage(loggedInId, userId, messageId) {
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