import React, { createContext, useState, Dispatch, SetStateAction } from "react";
import { UserContextProvider } from "./user";

const GlobalContext = ({children}) => {
    return <UserContextProvider>{children}</UserContextProvider>;
}

export default GlobalContext;