import { TOKEN_SECRET } from '../config.js';
import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) =>{
    const {token} = req.cookies;
    if (!token) //Si no hay token en las cookies
        return res.status(401)
                  .json({message:["No token, autorización denegada"]});

    //Verificamos el token
    jwt.verify(token, TOKEN_SECRET, (err, user)=>{
        if (err) //Si hay error al validar el token
            return res.status(403)
                      .json({message: ['Token inválido']});
        //Si no hay error, guardamos los datos  del usuario que inició sesión 
        //en el objeto req
        req.user = user;
        next ();
    })
}