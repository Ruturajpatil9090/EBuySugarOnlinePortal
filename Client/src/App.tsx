import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import RouterConfig from "./Pages/RouterConfig";
import ComponentsConfig from "./components/ComponentsConfig";
import Navbar from './Layout/Navbar';
import Sidebar from './components/Sliderbar/Sliderbar';

import styled from "styled-components";

const Pages = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  h1 {
    font-size: calc(2rem + 2vw);
    background: linear-gradient(to right, #803bec 30%, #1b1b1b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

function App() {
    return (
        <div className="App">
            <Router>
                <AppContent />
            </Router>
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const { pathname } = location;

    return (
        <>
            {/* Conditionally render Navbar based on current pathname */}
            {ComponentsConfig.find(route => route.path === pathname) && pathname !== "/myorders" && pathname !== "/eTender" 
            && pathname !== "/myreports" && <Navbar />}
            {pathname === "/myorders"  && <Sidebar />}
            {pathname === "/eTender"  && <Sidebar />}
            {pathname === "/myreports"  && <Sidebar />}
            <Routes>
                {RouterConfig.map((route, index) => (
                    <Route key={index} path={route.path} element={<route.element />} />
                ))}

                {ComponentsConfig.map((route, index) => (
                    <Route key={index} path={route.path} element={<route.element />} />
                ))}
            </Routes>
        </>
    );
}

export default App;
