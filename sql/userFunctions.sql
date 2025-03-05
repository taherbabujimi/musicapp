/*Function to register a new user*/
CREATE FUNCTION music_app.registerUser(givenUsername VARCHAR(255), givenEmail VARCHAR(255), givenPassword VARCHAR(255)) RETURNS json
    DETERMINISTIC
BEGIN
    DECLARE msg JSON;
    
    IF EXISTS (SELECT * FROM users WHERE email = givenEmail) THEN
        SET msg = JSON_OBJECT(
        	'data', NULL,
       		'message', 'email already exists',
       		'status', 400
       	);
    ELSE
        INSERT INTO users (username, email, password, createdAt, updatedAt)
        VALUES (givenUsername, givenEmail, givenPassword, NOW(), NOW());
        SET msg = JSON_OBJECT(
        	'data', JSON_OBJECT(
	            'id', LAST_INSERT_ID(),
	            'username', givenUsername,
	            'email', givenEmail
	            ),
            'message', 'User created successfully',
            'status', 200
        );
    END IF;
    
    RETURN msg;
END

/*Procedure to login a user*/
CREATE PROCEDURE music_app.userLogin(givenEmail VARCHAR(255))
    DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM users WHERE email = givenEmail) THEN
        SELECT JSON_OBJECT(
           'data', JSON_OBJECT(
	               'id', id,
	               'email', email,
	               'username', username,
	               'usertype', usertype,
	               'createdAt', createdAt,
	               'updatedAt', updatedAt
            	),
           	'message', 'User logged in successfully',
           	'status', 200,
           	'password', password
        ) AS result
        FROM users 
        WHERE email = givenEmail;
    ELSE
        SELECT JSON_OBJECT(
        	'data', NULL,
            'message', 'User with this email does not exist',
            'status', 400
        ) AS result;
    END IF;
END

/* Procedure to register Admin */
CREATE PROCEDURE music_app.registerAdmin(givenUsername VARCHAR(255), givenEmail VARCHAR(255), givenPassword VARCHAR(255), givenRoleId INT)
    DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM users WHERE email = givenEmail) THEN
        SELECT JSON_OBJECT(
        	'data', NULL,
            'message', 'Admin already exist',
            'status', 400
        ) AS result;
    ELSE
        INSERT INTO users (username, email, password, createdAt, updatedAt, usertype, role_id)
        VALUES (givenUsername, givenEmail, givenPassword, NOW(), NOW(), "admin", givenRoleId);

        SELECT JSON_OBJECT(
           'data', JSON_OBJECT(
	               'id', id,
	               'email', email,
	               'username', username,
	               'password', password,
	               'usertype', usertype,
	               'role_id', role_id,
	               'createdAt', createdAt,
	               'updatedAt', updatedAt
            	),
            'message', 'Admin created successfully',
            'status', 200
        ) AS result
        FROM users 
        WHERE email = givenEmail;
    END IF;
END

/* Procedure to get one user */
CREATE PROCEDURE music_app.getOneUser(givenUserId INT)
    DETERMINISTIC
BEGIN

    IF EXISTS (SELECT * FROM users WHERE id = givenUserId) THEN
        SELECT JSON_OBJECT(
                'id', id,
                'username', username,
                'email', email,
                'password', password,
                'usertype', usertype,
                'createdAt', createdAt,
                'updatedAt', updatedAt,
                'user_genre_preference', user_genre_preference,
                'role_id', role_id
            ) AS result
            FROM users
            WHERE id = givenUserId;
    ELSE
        SELECT JSON_OBJECT(
            'message', 'User does not exist'
        ) AS result;
    END IF;
END