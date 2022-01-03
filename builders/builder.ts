export interface Builder<T>{
    register(register:any):Builder<T>;
    build():T;
}