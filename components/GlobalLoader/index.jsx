import { Spin, Space } from 'antd';
import { useLoader } from '../Layout/Theme/ThemeContext';

const GlobalLoader = () => {
    const { isLoading } = useLoader();

    if (!isLoading) {
        return null;
    }

    return (
        // Full screen overlay. We can add a blur effect for a more modern look.
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(4px)', // This adds a nice frosted glass effect behind the loader
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {/* A container card for the loader to give it more presence */}
            <div className="bg-white p-8 rounded-xl shadow-2xl flex items-center justify-center">
                <Space direction="vertical" align="center" size="large">
                    {/* 1. Use Ant Design's large spinner */}
                    <Spin size="large" />

                    {/* 2. Add responsive text that is larger on big screens */}
                    <span className="text-base md:text-lg text-gray-700 font-semibold tracking-wide">
                        Loading...
                    </span>
                </Space>
            </div>
        </div>
    );
};

export default GlobalLoader;
