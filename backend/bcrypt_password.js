const bcrypt = require('bcryptjs');

const pass = 'tu_contrasena'; // cámbialo por la contraseña real (ej: admin123 o docente123)
bcrypt.hash(pass, 10).then(hash => console.log(hash));
