import { createContext, useState, useContext, useCallback } from 'react';

// The context will hold both theme and loader state
const AppContext = createContext(null);

// The provider component
export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState('light'); // Your existing theme state
    const [isLoading, setIsLoading] = useState(false);

    // Use useCallback to prevent these functions from being recreated on every render
    const showLoader = useCallback(() => setIsLoading(true), []);
    const hideLoader = useCallback(() => setIsLoading(false), []);

    // Combine all values to be passed to consumers
    const value = {
        theme,
        setTheme,
        isLoading,
        showLoader,
        hideLoader
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook to easily access the loader state and functions
export const useLoader = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useLoader must be used within an AppProvider');
    }
    return { 
        isLoading: context.isLoading, 
        showLoader: context.showLoader, 
        hideLoader: context.hideLoader 
    };
};

// You can keep your useTheme hook if you have one
export const useTheme = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useTheme must be used within an AppProvider');
    }
    return { theme: context.theme, setTheme: context.setTheme };
}
