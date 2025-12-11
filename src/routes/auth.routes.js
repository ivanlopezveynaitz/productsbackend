import { Router} from 'express';
import { login, 
         register, 
         logout, 
         profile,
         verifyToken        
} from '../controllers/auth.controller.js';

import { authRequired } from '../middlewares/validateToken.js';

//Importamos el validationSchema
import { validateSchema } from '../middlewares/validateSchema.js';

//Importamos los esquemas de validación
import { loginSchema, registerSchema} from '../schemas/auth.schemas.js'

const router = Router();

//Ruta para validar del token
router.get('/verify', verifyToken)

//Ruta para registrar usuarios
router.post('/register', validateSchema(registerSchema),register);

//Ruta para iniciar sesión
router.post('/login', validateSchema(loginSchema),login);

//Ruta para cerrar sesión
router.post('/logout', logout);

//Ruta para obtener el perfil del usuario
router.get('/profile', authRequired, profile);

export default router;