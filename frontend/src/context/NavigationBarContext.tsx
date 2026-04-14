import React, { createContext, useContext } from "react";

type NavigationBarContextValue = {
  navHidden: boolean;
};

const NavigationBarContext = createContext<NavigationBarContextValue>({
  navHidden: false,
});

export const NavigationBarProvider = NavigationBarContext.Provider;

export const useNavigationBar = () => useContext(NavigationBarContext);
