/* Procedure to add genre */
CREATE DEFINER=`root`@`localhost` PROCEDURE `music_app`.`addGenre`(givenGenreName VARCHAR(255), givenCreatedBy INT)
    DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM genres WHERE genrename = givenGenreName) THEN
        SELECT JSON_OBJECT(
        	'data', NULL,
            'message', 'Genre with this name already exist',
            'status', 400
        ) AS result;
    ELSE
        INSERT INTO genres (genrename, created_by, createdAt, updatedAt)
        VALUES (givenGenreName, givenCreatedBy, NOW(), NOW());

        SELECT JSON_OBJECT(
        	'data', JSON_OBJECT(
             	'id', id,
                'genrename', genrename,
                'created_by', created_by,
                'createdAt', createdAt,
                'updatedAt', updatedAt
            ),
            'message', 'Genre created successfully',
            'status', 200
        ) AS result
        FROM genres 
        WHERE id = LAST_INSERT_ID();
    END IF;
END

/* Procedure to find genres using array of ids */
CREATE PROCEDURE music_app.getGenresUsingIds(givenArrayOfIds JSON, givenLimit INT, givenOffset INT)
DETERMINISTIC
BEGIN
    SELECT * FROM genres WHERE g.id IN (
        SELECT value
        FROM JSON_TABLE(givenArrayOfIds, '$[*]' COLUMNS (value INT PATH '$')) AS jt
    )
    LIMIT givenLimit OFFSET givenOffset;
END