import axios from "axios"
const commonApi=(reqUrl,reqMethod,reqData,reqHeader)=>{
    const config={
        url:reqUrl,
        method:reqMethod,
        data:reqData,
        headers:reqHeader?reqHeader:{'Content-Type':'application/json'}
    }
    return axios(config)
}
export default commonApi