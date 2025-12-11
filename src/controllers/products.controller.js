import Product from '../models/product.models.js';
import {v2 as cloudinary} from 'cloudinary';

//Función para obtener todos los productos
export const getProducts = async (req, res)=>{
    try {
        const products = await Product.find()
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al obtener los productos']})
    }
};//Fin de getProducts

//Función para crear un producto
export const createProduct = async (req, res)=>{
    try {
        const {name, price, quantity} = req.body;
        const newProduct = new Product({
            name,
            price, 
            quantity,
            image: req.urlImage,
            user: req.user.id
        });
        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al crear un producto']})
    }
};//Fin de createProduct

//Función para obtener UN producto por Id
export const getProduct = async (req, res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                      .json({message: ['Producto no encontrado']})
        res.json(product);
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al obtener un producto']})
    }
};//Fin de getProduct

//Función para eliminar un producto
export const deleteProduct = async (req, res)=>{
    try {
        //Buscamos el producto para eliminar en la base de datos
        const product = await Product.findById(req.params.id);
            if (!product) //No se encontró el producto
                return res.status(404)
                        .json({message: ['Producto no encontrado']})        
                        
        //Para eliminar la imagen de Cloudinary, es necesario extraer
        //únicamente el nombre de la imagen, sin url ni extensión.

        //Obtenemos la url de la imagen de Cloudinary
        //p.ej. http://res.cloudinary.com/dyzm9yxf9/image/upload/v1761628322/iv8nagnaphukbe8tt7te.jpg
        const imageUrl = product.image;

        //Dividimos por /la url y nos quedamos con el último parámetro que contiene
        //el nombre de la imagen
        const urlArray = imageUrl.split('/');

        //Image contendrá el id de la imagen en cloudinary
        //image=iv8nagnaphukbe8tt7te.jpg
        const image = urlArray[ urlArray.length-1 ];

        //Dividimos el nombre de la imagen para quitar la extensión
        //imageName = iv8nagnaphukbe8tt7te
        const imageName = image.split('.')[0];

        const result = await cloudinary.uploader.destroy(imageName);
        if (result.result === 'ok'){
            //Si se eliminó la imagen, eliminamos el producto
            const deletedProduct = await Product.findByIdAndDelete(req.params.id);
            
            if (!deletedProduct) //No se encontró el producto
                return res.status(404)
                        .json({message: ['Producto no encontrado']})
            
            return res.json(deletedProduct);
        } else { //Si hay error al eliminar la imagen lo retornamos y no borramos el producto
            return res.status(500)
                        .json({message: ['Error al eliminar la imagen del producto']})
            }//Fin de else
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message: ['Error al eliminar un producto']})
    }
};//Fin de deleteProduct

//Función para actualizar un producto sin actualizar la imagen
export const updateProductWithoutImage = async (req, res)=>{
    try {
        console.log("Actualizando " + req.params.id);
        //Comprobamos que exista el producto a actualizar en la bd
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                      .json({message: ['Producto no encontrado']})
        
        const dataProduct = ({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.body.image,
            user: req.user.id
        });
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, dataProduct, {new: true});
        res.json(updatedProduct);
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al actualizar un producto']})
    }
};//Fin de updateProductWithoutImage

//Función para actualizar un producto actualizando la imagen
export const updateProductWithImage = async (req, res)=>{
    try {
        //Comprobamos que exista el producto a actualizar en la bd
        const product = await Product.findById(req.params.id);
        if (!product) //No se encontró el producto
            return res.status(404)
                      .json({message: ['Producto no encontrado']})
        
        //Comprobamos que venga el nuevo archivo para actualizar
        if (!req.file){
            res.status(500)
               .json({message: ['Error al actualizar un producto, no se encontró la imagen']})
        };

        //Eliminamos la imagen anterior de Cloudinary
        //Obtenemos la url de la imagen de Cloudinary
        const imageUrl = product.image;
        const urlArray = imageUrl.split('/');
        const image = urlArray[ urlArray.length-1 ];
        const imageName = image.split('.')[0];

        const result = await cloudinary.uploader.destroy(imageName);
        if (!result.result === 'ok'){ //Hay un error al eliminar la imagen y retornamos el error
            return res.status(500)
                        .json({message: ['Error al eliminar la imagen del producto']})
        }//Fin de if

        const dataProduct = ({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            image: req.urlImage,
            user: req.user.id
        });
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, dataProduct, {new: true});
        res.json(updatedProduct);

    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al actualizar un producto']})
    }
};//Fin de updateProductWithImage

//Función para obtener todos los productos de todos los usuarios
//para la compra de productos en la vista pública
export const getAllProducts = async (req, res)=>{
    try {
        const products = await Product.find( );
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500)
           .json({message:['Error al obtener todos los productos']})
    }
};//Fin de getAllProducts
