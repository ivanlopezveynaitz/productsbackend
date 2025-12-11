//Importamos el modelo de datos
import User from '../models/user.models.js';
import Role from '../models/roles.models.js';
import bcryptjs from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

//Configuramos las variables de entorno
dotenv.config()

//Obtenemos el rol del usuario para el registro de usuarios
const roleUser = process.env.SETUP_ROLE_USER;
        
//Función para registar usuarios
export const register = async (req, res)=>{
    const {username, email, password} = req.body;

    try {

        //Validamos que el email no esté registrado en la base de datos
        const userFound = await User.findOne({email});
        
        if (userFound)//Ya se encuentra este email registrado en la db
            return res.status(400) //Retornamos error en el registro
                      .json({message: ["El email ya está registrado"]})
        
        const passwordHash = await bcryptjs.hash(password, 10);

        //Obtenemos el rol por defecto para usuarios
        //Y lo agregamos al usuario para guardarlo en la db con ese rol
        const role = await Role.findOne({role: roleUser});
        console.log(roleUser)
        if (!role) //No se encuentra el rol de usuarios inicializado
            return res.status(400) //Retornamos error en el registro
                      .json({message: ["El rol para usuarios no está definido"]})

        const newUser = new User({
            username,
            email, 
            password: passwordHash,
            role: role._id
        });
        const userSaved = await newUser.save()       
        //console.log(userSaved);

        //Generamos la cookie de inicio de sesión
        const token = await createAccessToken({id: userSaved._id});

        //Verificamos si el token de inicio de sesión lo generamos para el entorno local
        //de desarrollo, o lo generamos para el servidor en la nube
        if (process.env.ENVIRONMENT=='local'){
            res.cookie('token', token, {
                sameSite: 'lax', //Para indicar que el back y front son locales para desarrollo
            });        
        } else { //El back y front se encuentran en distintos servidores remotos
            res.cookie('token', token, {
                sameSite: 'none', //Para peticiones remotas
                secure: true, //Para activar https en deployment
            });        
        } //Fin de if(proccess.env.ENVIRONMENT)

        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: role.role
             });
    } catch (error) {
        res.status(400)
           .json({message:['Error al registrar usuario']})
        console.log(error)
    }
}; //Fin de register

//Función para iniciar sesión
export const login = async (req, res)=>{
    const { email, password } = req.body;
    try {
        //Buscamos el email en la bd
        const userFound = await User.findOne({email});
        
        if (!userFound)//No se encuentra en la db
            return res.status(400)
                      .json({message: ["Usuario no encontrado"]})
        
                      //Comparamos el password que envió el usuario con el de la db
        const isMatch = await bcryptjs.compare(password, userFound.password);
        if (!isMatch) //No coinciden
            return res.status(400)
                      .json({message: ["Password no coincide"]});
        
                      //Existe en la bd y su password es correcto
        //Generamos el token de inicio de sesión y retornamos sus datos
        const token = await createAccessToken({id: userFound._id});

        //Verificamos si el token de inicio de sesión lo generamos para el entorno local
        //de desarrollo, o lo generamos para el servidor en la nube
        if (process.env.ENVIRONMENT=='local'){
            res.cookie('token', token, {
                sameSite: 'lax', //Para indicar que el back y front son locales para desarrollo
            });        
        } else { //El back y front se encuentran en distintos servidores remotos
            res.cookie('token', token, {
                sameSite: 'none', //Para peticiones remotas
                secure: true, //Para activar https en deployment
            });        
        } //Fin de if(proccess.env.ENVIRONMENT)

        //Obtenemos el rol para el usuario que inició sesión
        //Y lo asignamos en el return del usuario.
        const role = await Role.findById(userFound.role);
        if (!role) //No se encuentra el rol del usuario 
            return res.status(400) //Retornamos error en el login
                      .json({message: ["El rol para el usuario no está definido"]})

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        });
    } catch (error) {
        console.log(error);
        res.status(400)
           .json({message:['Error al iniciar sesión']})
    }
};//Fin de login

//Función para cerrar sesión
export const logout = (req, res) =>{
    res.cookie("token", "", {
        expires: new Date(0)
    });
    return res.sendStatus(200);
}//Fin de logout

//Función para perfil del usuario
export const profile = async (req, res)=>{
    const userFound = await User.findById(req.user.id)
    
    if(!userFound) //No se encontró el id en la base de datos
       return res.status(400)
                 .json({message: ["Usuario no encontrado"]})
   
    //Obtenemos el rol para el usuario que inició sesión
    //Y lo asignamos en el return del usuario.
    const role = await Role.findById(userFound.role);
    if (!role) //No se encuentra el rol del usuario 
        return res.status(400) //Retornamos error en el login
                  .json({message: ["El rol para el usuario no está definido"]})

    res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        role: role.role
    });
}//Fin de profile

//Función para validar el token de inicio de sesión
export const verifyToken = async (req, res)=>{
    const {token} = req.cookies;
    if (!token)
        return res.status(400)
                  .json({message: ["No autorizado"]});
   
    jwt.verify(token, TOKEN_SECRET, async (err, user)=>{
        if (err) //Hay error al validar el token
            return res.status(401)
                      .json({message: ["No autorizado"]});

        const userFound = await User.findById(user.id);
        if (!userFound)//Si no encuentra el usuario que viene en el token
            return res.status(401)
                      .json({message: ["No autorizado"]});
        
        //Obtenemos el rol para el usuario que inició sesión
        //Y lo asignamos en el return del usuario.
        const role = await Role.findById(userFound.role);
        if (!role) //No se encuentra el rol del usuario 
            return res.status(400) //Retornamos error en el login
                      .json({message: ["El rol para el usuario no está definido"]})

        const userResponse = {
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: role.role
        }
        
        return res.json(userResponse);

    }); //Fin de jwt.verifyToken
}//Fin de verifyToken
