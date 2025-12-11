import {z} from 'zod';

export const productSchema = z.object({
    name: z.string('Nombre del producto requerido'),
    price: z.string()
            .transform( (val)=> parseFloat(val))
            .pipe (
                   z.number('Precio del producto requerido')
                    .positive('El precio debe de ser mayor a 0')
                    .refine((val) => !isNaN(val), { error: 'El precio debe ser un número válido' })
            ), 
    quantity: z.string()
               .transform( (val)=> parseInt(val))
               .pipe (
                      z.number()
                       .int({error:'Cantidad del producto requerida'})
                       .min(0, {error:'La cantidad debe ser mayor o igual a 0'})
                       .refine((val) => !isNaN(val), { error: 'La cantidad debe ser un número válido' })
            ), 
});//Fin de ProductSchema

export const productUpdateSchema = z.object({
    name: z.string('Nombre del producto requerido'),
    price: z.number('Precio del producto requerido')
            .positive('El precio debe de ser mayor a 0')
            .refine((val) => !isNaN(val), { error: 'El precio debe ser un número válido' }), 
    quantity: z.number()
               .int({error:'Cantidad del producto requerida'})
               .min(0, {error:'La cantidad debe ser mayor o igual a 0'})
               .refine((val) => !isNaN(val), { error: 'La cantidad debe ser un número válido' }),
    image: z.string('Url de la imagen requerida'),           
});//Fin de ProductUpdateSchema