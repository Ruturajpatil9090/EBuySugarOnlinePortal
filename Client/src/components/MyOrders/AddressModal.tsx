// AddressPopup.tsx
import React from 'react';
import "./AddressPopup.css";
import { HashLoader } from "react-spinners";

interface Address {
    addr: {
        bnm: string;
        st: string;
        loc: string;
        bno: string;
        stcd: string;
        flno: string;
        lt: string;
        lg: string;
        pncd: string;
    };
    ntr: string;
}

interface AddressPopupProps {
    addresses: Address[];
    onSelectAddress: (address: Address) => void;
    onClose: () => void;
    isLoading: boolean; // Add isLoading prop
}

const AddressPopup: React.FC<AddressPopupProps> = ({ addresses, onSelectAddress, onClose, isLoading }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const recordsPerPage = 10;

    // Calculate the indices of the records to display
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = addresses.slice(indexOfFirstRecord, indexOfLastRecord);

    // Pagination handlers
    const totalPages = Math.ceil(addresses.length / recordsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Select Address</h2>
                <button className='CloseButton' onClick={onClose}>&#x2613;</button>
                <table>
                    <thead>
                        <tr>
                            <th>Build Name</th>
                            <th>Building No</th>
                            <th>Street</th>
                            <th>Floor No</th>
                            <th>City</th>
                            <th>Pincode</th>
                            <th>State</th>
                            <th>Action Buttons</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.map((item, index) => (
                            <tr key={index}>
                                <td>{item.addr.bnm}</td>
                                <td>{item.addr.bno}</td>
                                <td>{item.addr.st}</td>
                                <td>{item.addr.flno}</td>
                                <td>{item.addr.loc}</td>
                                <td>{item.addr.pncd}</td>
                                <td>{item.addr.stcd}</td>
                                <td>
                                    <button onClick={() => onSelectAddress(item)}>&#9745;</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isLoading && <HashLoader color="#007bff" className="spinner-container" loading={true} size={80} />}
                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddressPopup;
