import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { 
    getProducts,
    createProduct,
    getProduct,
    deleteProduct,
    updateProductWithoutImage,
    updateProductWithImage,
    getAllProducts
} from '../controllers/products.controller.js'

//Importamos el validationSchema
import { validateSchema } from '../middlewares/validateSchema.js';

//Importamos el esquema de validación de productos
import { productSchema, productUpdateSchema } from '../schemas/product.schemas.js'

//Importamos el middleware para subir imagenes a Cloudinary
import { uploadToCloudinary  } from '../middlewares/uploadImage.js';

//Imporamos el middlweware para administrador
import { isAdmin } from '../middlewares/isAdmin.js';

//Importamos el middleware para validarID
import { validateId } from '../middlewares/validateId.js';

const router = Router();

//Ruta para obtener todos los productos para la compra
router.get('/products/getallproducts', authRequired, getAllProducts);

//Ruta para obtener todos los productos
router.get('/products', authRequired, isAdmin, getProducts);

//Ruta para crear un producto
router.post('/products', authRequired, isAdmin, uploadToCloudinary, validateSchema(productSchema),createProduct);
    
//Ruta para obtener un producto por Id
router.get('/products/:id', validateId, authRequired, isAdmin, getProduct);

//Ruta para eliminar un producto
router.delete('/products/:id', validateId, authRequired, isAdmin, deleteProduct);

//Ruta para actualizar un producto sin actualizar la imagen
router.put('/products/:id', validateId, authRequired, isAdmin, 
                            validateSchema(productUpdateSchema),updateProductWithoutImage);

//Ruta para actualizar un producto y CAMBIAR la imagen
router.put('/products/updatewithimage/:id', validateId, authRequired, isAdmin, uploadToCloudinary, 
                                            validateSchema(productSchema),updateProductWithImage);

export default router;