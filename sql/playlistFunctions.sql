/*Procedure to add playlist*/
CREATE PROCEDURE music_app.addPlaylist(givenPlaylistName VARCHAR(200), givenCreatedBy INT)
BEGIN
    IF EXISTS(SELECT * FROM playlists WHERE playlistname = givenPlaylistName AND created_by = givenCreatedBy) THEN
        SELECT JSON_OBJECT(
            'message', 'Playlist already exist'
        ) AS result;
    ELSE
        INSERT INTO playlists (playlistname, created_by, createdAt, updatedAt)
        VALUES (givenPlaylistName, givenCreatedBy, NOW(), NOW());

        SELECT JSON_OBJECT(
                'id', id,
                'playlistname', playlistname,
                'created_by', created_by,
                'createdAt', createdAt,
                'updatedAt', updatedAt
            ) AS result
            FROM playlists
            WHERE id = LAST_INSERT_ID();
    END IF;
END;

/*Procedure to add song to playlist*/
CREATE PROCEDURE music_app.addSongToPlaylist(givenSongId INT, givenPlaylistId INT, givenUserId INT)
BEGIN
    IF EXISTS(SELECT * FROM songs WHERE id = givenSongId) 
       AND EXISTS(SELECT * FROM playlists WHERE id = givenPlaylistId AND created_by = givenUserId) THEN
       
       IF EXISTS(SELECT * FROM songs_playlists 
                  WHERE song_id = givenSongId AND playlist_id = givenPlaylistId) THEN
        SELECT JSON_OBJECT(
        	'status', 400,
            'message', 'Song already present in the playlist',
            'data', NULL 
        ) AS result;
       ELSE
        INSERT INTO songs_playlists (song_id, playlist_id, createdAt, updatedAt)
        VALUES (givenSongId, givenPlaylistId, NOW(), NOW());

        SELECT JSON_OBJECT(
        	'status', 200,
        	'message', 'Song added successfully to the playlist',
        	'data', JSON_OBJECT(
            	'song_id', song_id,
            	'playlist_id', playlist_id,
            	'createdAt', createdAt,
            	'updatedAt', updatedAt
        	) 
        ) AS result
        FROM songs_playlists
        WHERE id = LAST_INSERT_ID();
       END IF;
      
    ELSE
        SELECT JSON_OBJECT(
        	'status', 400,
            'message', 'Provided song or playlist does not exist',
            'data', NULL
        ) AS result;
    END IF;
END;

/*Procedure to remove song from the playlist*/
CREATE PROCEDURE music_app.removeSongFromPlaylist(givenSongId INT, givenPlaylistId INT, givenUserId INT)
BEGIN
    IF EXISTS(SELECT * FROM songs WHERE id = givenSongId) 
       AND EXISTS(SELECT * FROM playlists WHERE id = givenPlaylistId AND created_by = givenUserId) THEN
       
       IF NOT EXISTS(SELECT * FROM songs_playlists 
                  WHERE song_id = givenSongId AND playlist_id = givenPlaylistId) THEN
        SELECT JSON_OBJECT(
        	'status', 400,
            'message', 'Song not present in the playlist',
            'data', NULL 
        ) AS result;
       ELSE
        DELETE FROM songs_playlists WHERE song_id = givenSongId AND playlist_id = givenPlaylistId;

        SELECT JSON_OBJECT(
        	'status', 200,
        	'message', 'Song successfully removed from the playlist',
        	'data', NULL
        ) AS result;
       END IF;
      
    ELSE
        SELECT JSON_OBJECT(
        	'status', 400,
            'message', 'Provided song or playlist does not exist',
            'data', NULL
        ) AS result;
    END IF;
END;

/*Procedure to delete playlist*/
CREATE PROCEDURE music_app.deletePlaylist(givenPlaylistId INT, givenUserId INT)
BEGIN
    DECLARE song_ids JSON;
    
    IF NOT EXISTS(SELECT * FROM playlists WHERE id = givenPlaylistId AND created_by = givenUserId) THEN
        SELECT JSON_OBJECT(
            'status', 400,
            'message', 'Playlist does not exists',
            'data', NULL
        ) AS result;
    ELSE
        START TRANSACTION;

        DELETE FROM songs_playlists WHERE playlist_id = givenPlaylistId;
        DELETE FROM playlists WHERE id = givenPlaylistId;
        
        COMMIT;
        
        SELECT JSON_OBJECT(
            'status', 200,
            'message', 'Playlist deleted successfully',
            'data', song_ids
        ) AS result;
    END IF;
END;