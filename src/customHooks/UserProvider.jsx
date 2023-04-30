import React from 'react';

const UserContext = React.createContext();

function UserProvider({ children }) {

  const [user, setUser] = React.useState(null);

  // const value = React.useMemo(() => ({ user, setUser }), [user]);

  const value = { user, setUser };

  return (
    <UserContext.Provider value={value}>
      {
        React.useMemo(() => (
          <>
            {children}
          </>
        ), [children])
      }
    </UserContext.Provider>
  )
}

export const useUserContext = () => React.useContext(UserContext);

export default UserProvider;