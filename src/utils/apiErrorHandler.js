class ApiError extends Error{
    constructor(statusCode,message='somthing went wrong',error=[],stuck=''){
        this.statusCode=statusCode,
        this.message=message,
        this.error=error,
        this.data=null
        this.success=false
        if(stuck){
            this.stack=stuck
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {ApiError}