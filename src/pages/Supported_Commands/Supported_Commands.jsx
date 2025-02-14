import { useEffect, useState } from 'react';
import { usePythonApi } from '../../hooks/pythonBridge';
import { useNavigate } from 'react-router-dom';

const SupportedCommands = () => {
    const navigate = useNavigate();
    const [supportedCodes, setSupportedCodes] = useState([]);
    const [codeResults, setCodeResults] = useState({});

    async function handleCommand(command) {
        try {
            const result = await usePythonApi('query', command);
            setCodeResults((prev) => ({ ...prev, [command]: result }));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
        };

        const handleTouchMove = (e) => {
            touchEndX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            if (touchEndX - touchStartX > 50) {
                navigate('/');
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [navigate]);


    useEffect(() => {
        async function getSupportedCodes() {
            try {
                const result = await usePythonApi('fetch_all_supported_commands', null);
                setSupportedCodes(result);
            } catch (error) {
                console.error(error);
            }
        }

        getSupportedCodes();
    }, []);

    if (supportedCodes.length === 0)
        return <h1 className="text-center mt-4">Loading...</h1>;

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Supported Commands</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm rounded text-center">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="py-3">Description</th>
                            <th className="py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supportedCodes.map((code, index) => (
                            <tr key={index} className="align-middle">
                                <td className="px-4 py-2">{code.description}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleCommand(code.name)}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                        title="View Command"
                                    >
                                        {codeResults[code.name] ? (
                                            <span>
                                                {codeResults[code.name].value}
                                            </span>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                            </svg>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupportedCommands;