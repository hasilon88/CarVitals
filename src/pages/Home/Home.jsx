import { useState, useEffect, useRef } from 'react';
import Speedometer, {
    Background,
    Arc,
    Needle,
    Progress,
    Marks,
    Indicator,
    DangerPath
} from 'react-speedometer';
import { Row, Col } from 'react-bootstrap';
import { usePythonState } from '../../hooks/pythonBridge';
import './Home.css';
import Clock from 'react-digital-clock';
import { ProgressBar } from 'ms-react-progress-bar';
import 'ms-react-progress-bar/dist/ProgressBar.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current && touchEndX.current) {
            const diff = touchStartX.current - touchEndX.current;
            if (diff > 50) {
                navigate('/supported_commands');
            } else if (diff < -50) {
                navigate('/error_codes');
            }
        }
    };

    const rawRpm = usePythonState('rpm') || 0;
    const rawSpeed = usePythonState('speed') || 0;
    const fuel = usePythonState('fuel') || 50;
    const engine_load = usePythonState('engine_load') || 0;

    const rpm = Math.min(Math.max(rawRpm / 1000, 0), 8);
    const speed = Math.min(Math.max(rawSpeed, 0), 200);

    const [smoothSpeed, setSmoothSpeed] = useState(speed);
    const [smoothRpm, setSmoothRpm] = useState(rpm);

    const speedRef = useRef(speed);
    const rpmRef = useRef(rpm);

    useEffect(() => {
        speedRef.current = speed;
        rpmRef.current = rpm;
    }, [speed, rpm]);

    useEffect(() => {
        let lastTime = performance.now();

        const updateValues = (time) => {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            const smoothingFactor = Math.min(1, deltaTime * 6);

            setSmoothSpeed((prev) => prev + (speedRef.current - prev) * smoothingFactor);
            setSmoothRpm((prev) => prev + (rpmRef.current - prev) * smoothingFactor);

            requestAnimationFrame(updateValues);
        };

        const animationFrameId = requestAnimationFrame(updateValues);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="home-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <Row className="justify-content-center align-items-center mt-3">
                <h3><Clock /></h3>
            </Row>
            <Row className="justify-content-center align-items-center">
                <Col md={6} className="gauge-container">
                    <Speedometer
                        value={smoothSpeed}
                        max={200}
                        needleTransition="easeElasticOut"
                        needleColor="#ff4757"
                        arcColor={(value) => (value < 100 ? "#1dd1a1" : value < 160 ? "#feca57" : "#ff6b6b")}
                        indicatorColor="black"
                        backgroundColor="transparent"
                    >
                        <Background />
                        <Arc />
                        <Needle />
                        <Progress />
                        <Marks step={15} />
                        <Indicator />
                    </Speedometer>
                </Col>
                <Col md={6} className="gauge-container">
                    <Speedometer
                        value={smoothRpm}
                        max={8}
                        fontFamily="squada-one"
                        needleTransition="easeElasticOut"
                        needleColor="#ff9f43"
                        arcColor={(value) => (value < 4 ? "#1dd1a1" : value < 6 ? "#feca57" : "#ff6b6b")}
                        indicatorColor="black"
                        backgroundColor="transparent"
                    >
                        <Background />
                        <Arc arcWidth={4} />
                        <Needle baseOffset={40} circleRadius={30} />
                        <DangerPath color="#ff0000" from={6} to={8} />
                        <Progress arcWidth={6.5} />
                        <Marks step={0.5} />
                    </Speedometer>
                </Col>
            </Row>
        </div>
    );
};

export default Home;