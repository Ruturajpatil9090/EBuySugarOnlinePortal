import React from 'react';
import MotionHoc from "../../Pages/MotionHoc";

interface TenderProps {
 
}

const MyReportsCompoent: React.FC<TenderProps> = (props) => {
    return (
        <div>
            <h1>My Reports</h1>

        </div>
    );
};
const MyReports = MotionHoc(MyReportsCompoent);
export default MyReports;
