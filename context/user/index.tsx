import React, { createContext, useState, Dispatch, SetStateAction } from "react";

type UserType = {
    name: string;
    type: string;
}

type PropsUserContext = {
    state: UserType
    setState: Dispatch<SetStateAction<UserType>>
}

const DEFAULT_VALUE = {
    state: {
        name: '',
        type: ''
    },
    setState: () => {}
}

const UserContext = createContext<PropsUserContext>(DEFAULT_VALUE);

const UserContextProvider = ({children}) => {
    const [state, setState] = useState(DEFAULT_VALUE.state);
    return (
        <UserContext.Provider
            value={{
                state,
                setState
            }}
        >{children}
        </UserContext.Provider>
    );
}

export { UserContextProvider };
export default UserContext;