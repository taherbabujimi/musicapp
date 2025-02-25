/* Procedure to add role */
CREATE PROCEDURE music_app.addRole(givenRoleName VARCHAR(255), givenPermissions JSON)
DETERMINISTIC
BEGIN
IF EXISTS(SELECT * FROM roles WHERE role_name = givenRoleName) THEN
    SELECT JSON_OBJECT(
    'message', 'Role with this name already exists'
    ) AS result;
ELSE
	START TRANSACTION;
    	INSERT INTO roles (role_name, createdAt, updatedAt) VALUES (givenRoleName, NOW(), NOW());

    	INSERT INTO permissions_roles (role_id, permission_id, createdAt, updatedAt)
    	SELECT LAST_INSERT_ID(), value, NOW(), NOW()
    	FROM JSON_TABLE(givenPermissions, '$[*]' COLUMNS (value INT PATH '$')) AS perm_table;
	COMMIT;

    SELECT JSON_OBJECT(
    'message', JSON_OBJECT(
        'id', id,
        'role_name', role_name,
        'updatedAt', updatedAt,
        'createdAt', createdAt
    )
    ) AS result
    FROM roles
    WHERE role_name = givenRoleName;
END IF;
END