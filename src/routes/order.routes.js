import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { 
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getUserOrders,
    getOrderById,
    deleteOrder
} from '../controllers/order.controller.js';

//Importamos el middleware para validar el esquema
import { validateSchema } from '../middlewares/validateSchema.js';

//Importamos el esquema de validación para crear una orden
import { orderSchema } from '../schemas/order.schemas.js';

//Importamos el middleware para validarID
import { validateId } from '../middlewares/validateId.js';

const router = Router();

//Obtener todas las ordenes para un usuario
router.get('/order/getuserorders', authRequired, getUserOrders)

//Ruta para crear una orden
router.post('/order', authRequired, validateSchema(orderSchema), createOrder);

//Ruta para actualizar el status de una orden por Id
router.put('/order/:id', validateId, authRequired, updateOrderStatus);

//Obtener todas las ordenes para el administrador
router.get('/order/', authRequired, isAdmin, getAllOrders);

//Obtener una orden por id
router.get('/order/:id', validateId, authRequired, getOrderById);

//Eliminar una orden
router.delete('/order/:id', validateId, authRequired, isAdmin, deleteOrder);

export default router;