/*Function to register a new user*/
CREATE FUNCTION music_app.registerUser(givenUsername VARCHAR(255), givenEmail VARCHAR(255), givenPassword VARCHAR(255))
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE msg JSON;
    
    IF EXISTS (SELECT * FROM users WHERE email = givenEmail) THEN
        SET msg = JSON_OBJECT('error', 'email already exists');
    ELSE
        INSERT INTO users (username, email, password, createdAt, updatedAt)
        VALUES (givenUsername, givenEmail, givenPassword, NOW(), NOW());
        SET msg = JSON_OBJECT(
            'id', LAST_INSERT_ID(),
            'username', givenUsername,
            'email', givenEmail
        );
    END IF;
    
    RETURN msg;
END;

/*Procedure to login a user*/
CREATE PROCEDURE music_app.findUser(givenEmail VARCHAR(255))
DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM users WHERE email = givenEmail) THEN
        SELECT JSON_OBJECT(
            'user', JSON_OBJECT(
                'id', id,
                'email', email,
                'username', username,
                'password', password,
                'usertype', usertype,
                'createdAt', createdAt,
                'updatedAt', updatedAt
            )
        ) AS result
        FROM users 
        WHERE email = givenEmail;
    ELSE
        SELECT JSON_OBJECT(
            'message', CONCAT('User does not exist', givenEmail)
        ) AS result;
    END IF;
END;

/* Procedure to register Admin */
CREATE PROCEDURE music_app.registerAdmin(givenUsername VARCHAR(255), givenEmail VARCHAR(255), givenPassword VARCHAR(255), givenRoleId INT)
DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM users WHERE email = givenEmail) THEN
        SELECT JSON_OBJECT(
            'message', 'Admin already exists'
        ) AS result;
    ELSE
        INSERT INTO users (username, email, password, createdAt, updatedAt, usertype, role_id)
        VALUES (givenUsername, givenEmail, givenPassword, NOW(), NOW(), "admin", givenRoleId);

        SELECT JSON_OBJECT(
            'message', JSON_OBJECT(
                'id', id,
                'email', email,
                'username', username,
                'password', password,
                'usertype', usertype,
                'role_id', role_id,
                'createdAt', createdAt,
                'updatedAt', updatedAt
            )
        ) AS result
        FROM users 
        WHERE email = givenEmail;
    END IF;
END