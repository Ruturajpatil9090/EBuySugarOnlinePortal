import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import DataTableSearch from "../HelpCommon/DataTableSearch";
import DataTablePagination from "../HelpCommon/DataTablePagination";
import CloseIcon from '@mui/icons-material/Close';
const apiKey = process.env.REACT_APP_API_KEY;

interface SystemHelpMasterProps {
    onAcCodeClick?: (code: number, name: string, id: number,axRate : string,  minRate:string) => void;
    name: string;
}

interface SystemData {
    System_Code: number;
    System_Name_E: string;
    systemid: number;
    maxRate : string;
    minRate:string;
}

const SystemHelpMaster: React.FC<SystemHelpMasterProps> = ({ onAcCodeClick, name }) => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [popupContent, setPopupContent] = useState<SystemData[]>([]);
    const [enteredCode, setEnteredCode] = useState<string>("");
    const [enteredName, setEnteredName] = useState<string>("");
    const [systemID, setSystemId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
    const [apiDataFetched, setApiDataFetched] = useState<boolean>(false);
    const [minRate, setMinRate] = useState<string>("");
const [maxRate, setMaxRate] = useState<string>("");


    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get<SystemData[]>(`${apiKey}/systemmaster`);
            setPopupContent(response.data);
            setApiDataFetched(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, []);

    const fetchAndOpenPopup = async () => {
        if (!apiDataFetched) {
            await fetchData();
        }
        setShowModal(true);
    };

    const handleButtonClicked = () => {
        fetchAndOpenPopup();
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCodeChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setEnteredCode(value);
        setEnteredName("");

        if (!apiDataFetched) {
            await fetchData();
        }

        const matchingItem = popupContent.find((item) => item.System_Code === parseInt(value, 10));

        if (matchingItem) {
            setEnteredCode(matchingItem.System_Code.toString());
            setEnteredName(matchingItem.System_Name_E);
            setSystemId(matchingItem.systemid.toString())
            setMinRate(matchingItem.minRate); 
            setMaxRate(matchingItem.maxRate); 

            if (onAcCodeClick) {
                onAcCodeClick(matchingItem.System_Code, matchingItem.System_Name_E, matchingItem.systemid,matchingItem.minRate,matchingItem.maxRate);
            }
        } else {
            setEnteredName("");
        }
    };

    const handleRecordDoubleClick = (item: SystemData) => {
        setEnteredCode(item.System_Code.toString());
        setEnteredName(item.System_Name_E);
        setSystemId(item.systemid.toString())
        setMinRate(item.minRate); 
        setMaxRate(item.maxRate); 

        if (onAcCodeClick) {
            onAcCodeClick(item.System_Code, item.System_Name_E, item.systemid, item.minRate, item.maxRate);
        }
        setShowModal(false);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);
    };

    const filteredData = popupContent.filter((item) =>
        item.System_Name_E.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "F1") {
                if (event.target instanceof HTMLInputElement && event.target.id === name) {
                    fetchAndOpenPopup();
                    event.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [name, fetchAndOpenPopup]);

    useEffect(() => {
        const handleKeyNavigation = (event: KeyboardEvent) => {
            if (showModal) {
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.min(prev + 1, itemsToDisplay.length - 1));
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    if (selectedRowIndex >= 0) {
                        handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyNavigation);

        return () => {
            window.removeEventListener("keydown", handleKeyNavigation);
        };
    }, [showModal, selectedRowIndex, itemsToDisplay, handleRecordDoubleClick]);

    return (
        <div className="d-flex flex-row">
            <div className="d-flex">
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredCode}
                        onChange={handleCodeChange}
                        style={{ width: "200px", height: "45px" }}
                        placeholder="Slect Item"
                    />
                    <Button
                        variant="primary"
                        onClick={handleButtonClicked}
                        className="ms-1"
                        style={{ width: "30px", height: "35px" }}
                    >
                        ...
                    </Button>
                    <label id="nameLabel" className="form-labels ms-2">
                        {enteredName}
                    </label>
                </div>
            </div>

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="modal-dialog"

            >
                <Modal.Header closeButton>
                    <Modal.Title>Select Items</Modal.Title>
                </Modal.Header>
                <DataTableSearch data={popupContent} onSearch={handleSearch} />
                <Modal.Body>
                    {Array.isArray(popupContent) ? (
                        <div className="table-responsive">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Item Code</th>
                                        <th>Item Name</th>
                                        {/* <th>Systemid</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsToDisplay.map((item, index) => (
                                        <tr
                                            key={item.System_Code}
                                            className={
                                                selectedRowIndex === index ? "selected-row" : ""
                                            }
                                            onDoubleClick={() => handleRecordDoubleClick(item)}
                                        >
                                            <td>{item.System_Code}</td>
                                            <td>{item.System_Name_E}</td>
                                            {/* <td>{item.systemid}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        "Loading..."
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <DataTablePagination
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                    {/* <Button style={{width:"35px"}} onClick={handleCloseModal}>
                    <CloseIcon />
                    </Button> */}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SystemHelpMaster;
