import { useEffect, useState } from 'react';
import { usePythonApi } from '../../hooks/pythonBridge';
import { useNavigate } from 'react-router-dom';

const ErrorCodes = () => {
    const navigate = useNavigate();
    const [errorCodes, setErrorCodes] = useState(null);
    let touchStartX = 0;
    let touchEndX = 0;

    useEffect(() => {
        const fetchErrorCodes = async () => {
            try {
                const result = await usePythonApi('fetch_diagnostic_trouble_codes', null);
                setErrorCodes(result || []);
            } catch (error) {
                console.error('Failed to fetch error codes:', error);
                setErrorCodes([]);
            }
        };

        fetchErrorCodes();
    }, []);

    useEffect(() => {
        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
        };

        const handleTouchMove = (e) => {
            touchEndX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            if (touchStartX - touchEndX > 50) {
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

    if (errorCodes === null) {
        return <h1 className="text-center mt-4">Loading...</h1>;
    } 
    
    if (errorCodes.length === 0) {
        return <h1 className="text-center mt-4">Good news, your car has no issues!</h1>;
    }

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4 fw-bold text-primary">Error Codes</h2>
            <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm rounded text-center">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th>Error Code</th>
                            <th>Priority</th>
                            <th>Overview</th>
                            <th>Estimated Repair Time (hrs)</th>
                            <th>Causes</th>
                            <th>Symptoms</th>
                            <th>Diagnostic Steps</th>
                            <th>Solutions</th>
                            <th>Required Tools</th>
                            <th>Repair Cost (Min - Max)</th>
                            <th>Related Issues</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errorCodes.map((errorData, index) => (
                            <tr key={index}>
                                <td>{errorData.error_code || 'N/A'}</td>
                                <td>{errorData.priority || 'N/A'}</td>
                                <td>{errorData.overview || 'N/A'}</td>
                                <td>{errorData.estimated_repair_time ?? 'Unknown'}</td>
                                <td>
                                    <ul>
                                        {(errorData.causes || []).map((cause, idx) => (
                                            <li key={idx}>{cause}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        {(errorData.symptoms || []).map((symptom, idx) => (
                                            <li key={idx}>{symptom}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        {(errorData.steps || []).map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        {(errorData.solutions || []).map((solution, idx) => (
                                            <li key={idx}>{solution}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        {(errorData.tools || []).map((tool, idx) => (
                                            <li key={idx}>{tool}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    {errorData.costs && errorData.costs.length === 2
                                        ? `$${errorData.costs[0]} - $${errorData.costs[1]}`
                                        : 'N/A'}
                                </td>
                                <td>
                                    <ul>
                                        {(errorData.related_issues || []).map((issue, idx) => (
                                            <li key={idx}>{issue}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ErrorCodes;
