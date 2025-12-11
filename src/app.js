import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv'

//Configuramos la lectura de las variables de entorno
//para configurar las URL del BackEnd y FrontEnd
dotenv.config();

console.log("backend:" ,process.env.BASE_URL_BACKEND);
console.log("frontend:" ,process.env.BASE_URL_FRONTEND);

//Importamos las rutas para usuarios
import authRoutes from './routes/auth.routes.js';

//Importamos las rutas para productos
import productRoutes from './routes/products.routes.js';

//Importamos las rutas para las ordenes
import orderRoutes from './routes/order.routes.js';
import { version } from 'mongoose';

const app = express();

app.use(cors({
    origin: [
        process.env.BASE_URL_BACKEND, 
        process.env.BASE_URL_FRONTEND 
    ],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))

//Indicamos que el servidor utilice el objeto authRoutes
app.use('/api/', authRoutes)
app.use('/api/', productRoutes);
app.use('/api/', orderRoutes);
app.get('/', (req, res)=>{
    res.json({
        message: "Bienvenido al API REST de Productos",
        version: "1.0.0",
        rutasDisponibles: [
            { endpoint: "/api/register", method:"POST", description: "Registrar un nuevo usuario" },
            { endpoint: "/api/login", method:"POST", description: "Iniciar sesión" },
            { endpoint: "/", method: "GET", description: "Ruta inicial de la aplicación"}
        ]
    });
}); //Fin de app.get /

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ProductosApp API se está ejecutando correctamente' 
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

export default app;