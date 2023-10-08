INSERT INTO user (user_id, password, email, fname, lname) 
VALUES ('JanCruz', 'password', 'jakecruz889@gmail.com', 'Jancel', 'Cruz');

-- Insert User2
INSERT INTO User (user_id, password, email, fname, lname)
VALUES ('User2', 'password', 'user2@example.com', 'John', 'Doe');

-- Insert User3
INSERT INTO User (user_id, password, email, fname, lname)
VALUES ('User3', 'password', 'user3@example.com', 'Jane', 'Smith');

INSERT INTO Conversation (conv_id, name)
VALUES (1,'Test Conversation 1');


-- User JanCruz has a contact with user User2
INSERT INTO UserHasContact (user_id, contact_id)
VALUES ('JanCruz', 'User2');

-- User JanCruz has another contact with user User3
INSERT INTO UserHasContact (user_id, contact_id)
VALUES ('JanCruz', 'User3');


-- User JanCruz participates in Conversation 1
INSERT INTO ConversationHasParticipant (user_id, conv_id)
VALUES ('JanCruz', 1);

-- User2 also participates in Conversation 1
INSERT INTO ConversationHasParticipant (user_id, conv_id)
VALUES ('User2', 1);


-- Message in Conversation 1 from JanCruz
INSERT INTO Message (content, content_type, status, timestamp, conv_id, sender_id)
VALUES ('Hello, this is a test message.', 'msg', 'delivered', NOW(), 1, 'JanCruz');

-- Another message in Conversation 1 from User2
INSERT INTO Message (content, content_type, status, timestamp, conv_id, sender_id)
VALUES ('Hi, this is a reply.', 'msg', 'delivered', NOW(), 1, 'User2');

