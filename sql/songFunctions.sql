/* Procedure to add song */
CREATE PROCEDURE `music_app`.`addSong`(givenSongName VARCHAR(255), givenCreatedBy INT, givenPath VARCHAR(255), givenGenres JSON)
    DETERMINISTIC
BEGIN
    DECLARE new_song_id INT;
    
    START TRANSACTION;
    
    INSERT INTO songs (songname, created_by, path, createdAt, updatedAt)
    VALUES (givenSongName, givenCreatedBy, givenPath, NOW(), NOW());
    
    SET new_song_id = LAST_INSERT_ID();
    
    INSERT INTO songs_genres (song_id, genre_id, createdAt, updatedAt)
    SELECT new_song_id, value, NOW(), NOW()
    FROM JSON_TABLE(givenGenres, '$[*]' COLUMNS (value INT PATH '$')) AS genre_table;
    
    COMMIT;
    
    SELECT JSON_OBJECT(
        'message', JSON_OBJECT(
            'id', id,
            'songname', songname,
            'created_by', created_by,
            'path', path,
            'createdAt', createdAt,
            'updatedAt', updatedAt
        )
    ) AS result
    FROM songs
    WHERE id = new_song_id;
END

/* Procedure to get song */
CREATE PROCEDURE music_app.getSong(givenSongId INT)
DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM songs WHERE id = givenSongId) THEN
        SELECT JSON_OBJECT(
            'id', s.id,
            'songname', s.songname,
            'created_by', s.created_by,
            'path', s.path,
            'createdAt', s.createdAt,
            'updatedAt', s.updatedAt,
            'genres', JSON_ARRAYAGG(g.id)
        ) AS result
        FROM songs s
        LEFT JOIN songs_genres sg ON s.id = sg.song_id
        LEFT JOIN genres g ON sg.genre_id = g.id
        WHERE s.id = givenSongId
        GROUP BY s.id;
    ELSE
        SELECT JSON_OBJECT(
            'message', 'Song does not exist'
        ) AS result;
    END IF;
END

/* Procedure to get songs by genre */
CREATE PROCEDURE music_app.getSongsByGenre(givenGenreName VARCHAR(255), givenLimit INT, givenOffset INT)
DETERMINISTIC
BEGIN
    IF EXISTS(SELECT * FROM genres WHERE genrename = givenGenreName) THEN
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', s.id,
                'songname', s.songname,
                'created_by', s.created_by,
                'createdAt', s.createdAt,
                'updatedAt', s.updatedAt
            )
        ) AS result
        FROM (
            SELECT s.id, s.songname, s.created_by, s.createdAt, s.updatedAt
            FROM genres g
            LEFT JOIN songs_genres sg ON g.id = sg.genre_id
            LEFT JOIN songs s ON sg.song_id = s.id
            WHERE g.genrename = givenGenreName
            LIMIT givenLimit OFFSET givenOffset
        ) s;
    ELSE
        SELECT JSON_OBJECT(
            'message', 'Genre does not exist'
        ) AS result;
    END IF;
END
