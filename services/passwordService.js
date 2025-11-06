import bcrypt from 'bcrypt'

export const encriptPass=async(contrasena)=>{
    return bcrypt.hash(contrasena,10)
}

export const validatePass = async (contrasena, hash) => {
 return bcrypt.compare(contrasena,hash)   
}