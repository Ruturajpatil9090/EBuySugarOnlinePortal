import React from 'react';
import MotionHoc from "../../Pages/MotionHoc";

interface TenderProps {
 
}

const TenderCompoent: React.FC<TenderProps> = (props) => {
    return (
        <div>
            <h1>eTender Component</h1>

        </div>
    );
};
const Tender = MotionHoc(TenderCompoent);

export default Tender;
