import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import styles from "../../styles/DashBoard.module.css";
import Button from "@mui/material/Button";
import TablePagination from "@mui/material/TablePagination";
import axios from "axios";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ToastComponent, {
  showSuccessToast,
} from "../../UI/ToastComponent";
const apiKey = process.env.REACT_APP_API_KEY;
const socketURL = 'http://localhost:8080';

interface RowData {
  Tender_No: number;
  Date: string;
  Mill_Name: string;
  Grade: string;
  Season: number;
  DO_Name: string;
  Item_Name: string;
  Lifting_date: string;
  Payment_Date: string;
  Mill_Rate: number;
  Purchase_Rate: number;
  Display_Qty: number | null;
  Sold_Qty: number;
  Display_Rate: number | null;
  Flag: string;
  Balance_Stock: number;
  tenderid: number;
  Mill_Code: number;
  itemcode: number;
  Display_End_Date: string;
  Payment_ToAcCode: number;
  Pt_Accoid: number;
  mc: number;
}

const TenderPublishComponent: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([]);
  const [publishedList, setPublishedList] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiKey}/publish-tender`);
        const data = response.data;
        const mappedRows: RowData[] = data.map((item: any) => ({
          Tender_No: item.Tender_No,
          Date: item.Tender_Date,
          Mill_Name: item.millshortname,
          Grade: item.Grade,
          Season: item.Year_Code,
          DO_Name: item.tenderdoshortname,
          Item_Name: item.Item_Name,
          Lifting_date: item.Lifting_Date,
          Payment_Date: item.Payment_Date || new Date().toISOString().split("T")[0],
          Display_End_Date: item.Display_End_Date,
          Mill_Rate: parseFloat(item.Mill_Rate),
          Purchase_Rate: parseFloat(item.Purc_Rate),
          Display_Qty: 0,
          Sold_Qty: 0,
          Display_Rate: 0,
          Flag: item.Flag || "Deactive",
          Balance_Stock: parseInt(item.Buyer_Quantal),
          tenderid: item.tenderid,
          Mill_Code: item.Mill_Code,
          itemcode: item.itemcode,
          Payment_ToAcCode: item.Payment_ToAcCode,
          Pt_Accoid: item.Pt_Accoid,
          mc: item.mc
        }));
        setRows(mappedRows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchPublishedList = async () => {
      try {
        const response = await axios.get(`${apiKey}/getAllDatapublishlist`);
        const publishedTenders = response.data.map((item: any) => item.Tender_No);
        setPublishedList(publishedTenders);
      } catch (error) {
        console.error("Error fetching published list:", error);
      }
    };

    fetchData();
    fetchPublishedList();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDisplayQtyChange = (rowIndex: number, value: string) => {
    const updatedRows = [...rows];
    const paginatedIndex = page * rowsPerPage + rowIndex;
    const parsedValue = parseInt(value);
    updatedRows[paginatedIndex].Display_Qty = isNaN(parsedValue) ? null : parsedValue;
    setRows(updatedRows);
  };

  const handleDisplayRateChange = (rowIndex: number, value: string) => {
    const updatedRows = [...rows];
    const paginatedIndex = page * rowsPerPage + rowIndex;
    const parsedValue = parseFloat(value);
    updatedRows[paginatedIndex].Display_Rate = isNaN(parsedValue) ? null : parsedValue;
    setRows(updatedRows);
  };

  const handlePublishClick = (Tender_No: number) => {
    const updatedRows = rows.map((row) => {
      if (row.Tender_No === Tender_No && row.Display_Rate && row.Display_Rate >= 0) {
        row.Flag = "Active";
      }
      return row;
    });
    setRows(updatedRows);

    const rowsToPublish = updatedRows.filter(
      (row) => row.Tender_No === Tender_No && row.Flag === "Active"
    );

    if (rowsToPublish.length > 0) {
      axios
        .post(`${apiKey}/publishlist-tender`, rowsToPublish)
        .then((response) => {
          showSuccessToast("Record published successfully!");
          console.log("Bulk data published successfully:", response);
          setPublishedList([...publishedList, Tender_No]);
        })
        .catch((error) => {
          console.error("Error publishing bulk data:", error);
        });
    } else {
      console.log("No rows to publish.");
    }
  };

  const handlePublishList = () => {
    navigate("/publishedlist");
  };

  const handlePaymentDateChange = (index: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index].Payment_Date = value;
    setRows(updatedRows);
  };

  const handleDisplayEndDateTimeChange = (index: number, value: string) => {
    const updatedRows = [...rows];
    const formattedValue = value.replace("T", " ");
    updatedRows[index].Display_End_Date = formattedValue;
    setRows(updatedRows);
  };

  // Slice the rows array to get the data for the current page
  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <ToastComponent />
      <div className={styles.buttonContainer}>

        {/* <TextField
          type="date"
          label="From Date"
          //value={fromDate}
          //onChange={handleFromDateChange}
          InputLabelProps={{ shrink: true }}
          sx={{ marginRight: 2 }}
        />
        <TextField
          type="date"
          label="To Date"
          //value={toDate}
          //onChange={handleToDateChange}
          InputLabelProps={{ shrink: true }}
        />
        <button style={{width:"70px",backgroundColor:"#555555"}}>
      Filter
      </button> */}
        <button onClick={handlePublishList} className={styles.publishlist}>
          Publish List <ArrowForwardIcon />
        </button>
      </div>
      <div className={styles.filtersContainer}>

      </div>
      <div className={styles.container}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Tender No</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell align="right">Mill Code</TableCell>
                <TableCell align="right">Mill Name</TableCell>
                <TableCell align="right">Grade</TableCell>
                <TableCell align="right">Season</TableCell>
                <TableCell align="right">DO Name</TableCell>
                <TableCell align="right">Item Code</TableCell>
                <TableCell align="right">Item Name</TableCell>
                <TableCell align="right">Lifting Date</TableCell>
                <TableCell align="right">Payment Date</TableCell>
                <TableCell align="right">Mill Rate</TableCell>
                <TableCell align="right">Purchase Rate</TableCell>
                <TableCell align="right">Balance Stock</TableCell>
                <TableCell align="right">End Date</TableCell>
                <TableCell align="right">Display QTY</TableCell>
                <TableCell align="right">Display Rate</TableCell>
                <TableCell align="right">Publish Post</TableCell>
                <TableCell align="right">Flag</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((row, index) => {
                const isPublished = publishedList.includes(row.Tender_No);
                return (

                  <TableRow key={row.Tender_No}>
                    <TableCell component="th" scope="row">
                      {row.Tender_No}
                    </TableCell>
                    <TableCell align="right" >{row.Date}</TableCell>
                    <TableCell align="right">{row.Mill_Code}</TableCell>
                    <TableCell align="right">{row.Mill_Name}</TableCell>
                    <TableCell align="right">{row.Grade}</TableCell>
                    <TableCell align="right">{row.Season}</TableCell>
                    <TableCell align="right">{row.DO_Name}</TableCell>
                    <TableCell align="right">{row.itemcode}</TableCell>
                    <TableCell align="right">{row.Item_Name}</TableCell>
                    <TableCell align="right">{row.Lifting_date}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="date"
                        value={row.Payment_Date}
                        onChange={(e) =>
                          handlePaymentDateChange(index, e.target.value)
                        }
                        disabled={isPublished}
                      />
                    </TableCell>
                    <TableCell align="right">{row.Mill_Rate}</TableCell>
                    <TableCell align="right">{row.Purchase_Rate}</TableCell>
                    <TableCell align="right">{row.Balance_Stock}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="datetime-local"
                        value={row.Display_End_Date ? row.Display_End_Date.replace(" ", "T") : ""}
                        onChange={(e) =>
                          handleDisplayEndDateTimeChange(index, e.target.value)
                        }
                        disabled={isPublished}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={
                          row.Display_Qty !== null ? row.Display_Qty : ""
                        }
                        onChange={(e) =>
                          handleDisplayQtyChange(index, e.target.value)
                        }
                        disabled={isPublished}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={
                          row.Display_Rate !== null ? row.Display_Rate : ""
                        }
                        onChange={(e) =>
                          handleDisplayRateChange(index, e.target.value)
                        }
                        disabled={isPublished}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => handlePublishClick(row.Tender_No)}
                        variant="contained"
                        color="success"
                        size="small"
                        style={{ marginLeft: "-40px" }}
                        disabled={
                          isPublished ||
                          row.Display_Qty === null ||
                          row.Display_Qty <= 0 ||
                          row.Display_Rate === null ||
                          row.Display_Rate <= 0
                        }
                      >
                        Publish
                      </Button>
                    </TableCell>
                    <TableCell
                      align="right"
                      style={{
                        fontWeight: isPublished ? 'bold' : 'normal',
                        color: isPublished ? 'green' : 'red',
                        fontSize: "18px"
                      }}
                    >
                      {isPublished ? "Active" : row.Flag}
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </div>
    </>
  );
};

export default TenderPublishComponent;
