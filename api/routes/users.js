const express = require('express');
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/users - Create a new user (Rebuilt for robustness)
router.post('/', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id_Rol, Cedula_Usuario, Email, Clave, id_CentroVacunacion } = req.body;

        // --- 1. Validate Presence of Core Fields ---
        if (!id_Rol || !Cedula_Usuario || !Email || !Clave) {
            return res.status(400).json({ message: 'Role, Cedula, Email, and Password are required fields.' });
        }

        // --- 2. Sanitize and Validate Data Types ---
        const numericRoleId = parseInt(id_Rol, 10);
        if (isNaN(numericRoleId)) {
            return res.status(400).json({ message: 'Role ID must be a valid number.' });
        }

        // Sanitize id_CentroVacunacion: empty strings or non-numbers become null
        let finalCenterId = null;
        if (id_CentroVacunacion != null && id_CentroVacunacion !== '') {
            const parsedCenterId = parseInt(id_CentroVacunacion, 10);
            if (!isNaN(parsedCenterId)) {
                finalCenterId = parsedCenterId;
            }
        }

        // --- 3. Enforce Business Logic ---
        if (numericRoleId === 6) { // Role: 'Personal del Centro de Vacunación'
            if (finalCenterId === null) {
                return res.status(400).json({ message: 'A Vaccination Center is mandatory for this role.' });
            }
        } else {
            // For any other role, ensure id_CentroVacunacion is null
            finalCenterId = null;
        }

        // --- 4. Process and Execute ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Clave, saltRounds);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Rol', sql.Int, numericRoleId)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .input('Clave', sql.NVarChar(255), hashedPassword)
            .input('id_CentroVacunacion', sql.Int, finalCenterId)
            .execute('usp_CreateUser');

        // The stored procedure returns the new user's ID
        const newUser = result.recordset[0];
        res.status(201).json({ message: 'User created successfully.', userId: newUser.id_Usuario });

    } catch (err) {
        // Log the detailed error on the server
        console.error('API Error on POST /api/users:', err);

        // The `err.originalError.message` from the mssql driver contains the RAISERROR message from the SP
        const dbErrorMessage = err.originalError ? err.originalError.message : 'A database error occurred.';
        res.status(500).json({ message: 'Failed to create user.', error: dbErrorMessage });
    }
});

// GET /api/users - Get all users
router.get('/', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_GetAllUsers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/users:', err);
        res.status(500).send({ message: 'Failed to retrieve users.', error: err.message });
    }
});

// GET /api/users/:id - Get a single user by ID
router.get('/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_GetUserById');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve user.', error: err.message });
    }
});

// GET /api/roles - Get all roles
router.get('/roles', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await poolPromise;
                const result = await pool.request().execute('usp_GetRoles');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/roles:', err);
        res.status(500).send({ message: 'Failed to retrieve roles.', error: err.message });
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Rol, id_Estado, Cedula_Usuario, Email } = req.body;

        const pool = await poolPromise;
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .input('id_Rol', sql.Int, id_Rol)
            .input('id_Estado', sql.Int, id_Estado)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .execute('usp_UpdateUser');

        res.status(200).send({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to update user.', error: err.message });
    }
});

// DELETE /api/users/:id - Soft delete a user
router.delete('/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_DeleteUser');

        res.status(200).send({ message: 'User deactivated successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to deactivate user.', error: err.message });
    }
});

// POST /api/users/admin-create - A new, robust endpoint for creating users from the admin panel
router.post('/admin-create', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id_Rol, Cedula_Usuario, Email, Clave, id_CentroVacunacion } = req.body;

        // --- 1. Validate Presence of Core Fields ---
        if (!id_Rol || !Cedula_Usuario || !Email || !Clave) {
            return res.status(400).json({ message: 'Role, Cedula, Email, and Password are required fields.' });
        }

        // --- 2. Sanitize and Validate Data Types ---
        const numericRoleId = parseInt(id_Rol, 10);
        if (isNaN(numericRoleId)) {
            return res.status(400).json({ message: 'Role ID must be a valid number.' });
        }

        let finalCenterId = null;
        if (id_CentroVacunacion != null && id_CentroVacunacion !== '') {
            const parsedCenterId = parseInt(id_CentroVacunacion, 10);
            if (!isNaN(parsedCenterId)) {
                finalCenterId = parsedCenterId;
            }
        }

        // --- 3. Process and Execute ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Clave, saltRounds);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Rol', sql.Int, numericRoleId)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .input('Clave', sql.NVarChar(255), hashedPassword)
            .input('id_CentroVacunacion', sql.Int, finalCenterId)
            .execute('usp_CreateAdminUser'); // <-- Using the new stored procedure

        const newUser = result.recordset[0];
        res.status(201).json({ message: 'User created successfully via admin endpoint.', userId: newUser.id_Usuario });

    } catch (err) {
        console.error('API Error on POST /api/users/admin-create:', err);
        const dbErrorMessage = err.originalError ? err.originalError.message : 'A database error occurred.';
        res.status(500).json({ message: 'Failed to create user.', error: dbErrorMessage });
    }
});

module.exports = router;
