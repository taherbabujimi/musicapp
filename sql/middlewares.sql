/*Procedure to authenticate usertype and allowed permissions*/
CREATE PROCEDURE music_app.verifyUsertypeAndPermission(
    IN userId INT,
    IN allowedUserType JSON,
    IN allowedPermission JSON
)
DETERMINISTIC
proc_label:BEGIN
    DECLARE userPermissions JSON;
    DECLARE usertype1 VARCHAR(255);
    DECLARE role_id1 INT;
    DECLARE missing_permissions JSON;

    -- Fetch user type and role
    SELECT usertype, role_id INTO usertype1, role_id1 FROM users WHERE id = userId;

    -- Check user type
    IF NOT JSON_CONTAINS(allowedUserType, JSON_QUOTE(usertype1), '$') THEN
        SELECT JSON_OBJECT(
            'status', 400,
            'message', 'Not Authorized - Invalid User Type',
            'data', NULL
        ) AS result;
        LEAVE proc_label;
    END IF;

    -- Check permissions if specified
    IF allowedPermission IS NOT NULL THEN
        -- Fetch user's permissions
        SELECT JSON_ARRAYAGG(p.permission) INTO userPermissions
        FROM roles r
        LEFT JOIN permissions_roles pr ON r.id = pr.role_id
        LEFT JOIN permissions p ON pr.permission_id = p.id
        WHERE r.id = role_id1;

        -- Find missing permissions
        SET missing_permissions = (
            SELECT JSON_ARRAYAGG(perm)
            FROM JSON_TABLE(allowedPermission, '$[*]' COLUMNS (perm VARCHAR(255) PATH '$')) AS jt
            WHERE NOT JSON_CONTAINS(userPermissions, JSON_QUOTE(perm), '$')
        );

        -- If any permissions are missing, return unauthorized
        IF missing_permissions IS NOT NULL THEN
            SELECT JSON_OBJECT(
                'status', 400,
                'message', 'Not Authorized - Insufficient Permissions',
                'data', NULL
            ) AS result;
            LEAVE proc_label;
        END IF;
    END IF;

END proc_label