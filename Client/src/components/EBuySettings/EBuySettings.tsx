import React from 'react';
import MotionHoc from "../../Pages/MotionHoc";

interface EBuySettings {
 
}

const EBuySettings: React.FC<EBuySettings> = (props) => {
    return (
        <div>
            <h1>Settings</h1>
        </div>
    );
};
const EBuySettingsPage = MotionHoc(EBuySettings);

export default EBuySettingsPage;
