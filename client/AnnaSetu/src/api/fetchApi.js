import commonApi from "./commonApi";

export const register=(data)=>{
    return commonApi("http://127.0.0.1:8000/register/","POST",data,"")

}

export const login=(data)=>{
    return commonApi("http://127.0.0.1:8000/login/","POST",data)

}