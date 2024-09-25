// UserResaleForm.tsx
import React, { useRef, useState, useEffect } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SystemHelpMaster from "../Helper/HelpComponent/SystemMasterHelp";

// Define the validation schema with Zod
const schema = z.object({
  Date: z.string().nonempty("Date is required"),
  Mill_Code: z.number().positive("Company is required"),
  Grade: z.string().nonempty("Grade is required"),
  Season: z.string().nonempty("Season is required"),
  Lifting_date: z.string().nonempty("Lifting Date is required"),
  Payment_Date: z.string().nonempty("Payment Date is required"),
  Display_Rate: z.string().nonempty("Sale Rate is required"),
  Display_Qty: z.string().nonempty("Sale Quantal is required"),
  user_name: z.number().positive("User is required"),
  // Display_End_Date: z.string().nonempty("Date is required"),
});

type FormData = z.infer<typeof schema> & {
  Payment_ToAcCode?: number;
  Pt_Accoid?: number;
  mc?: number;
  ic?:number;
};

const apiKey = process.env.REACT_APP_API_KEY;

interface UserResaleFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserResaleForm: React.FC<UserResaleFormProps> = ({ isOpen, onClose }) => {
  const initialRef = useRef<HTMLInputElement>(null);
  const finalRef = useRef<HTMLButtonElement>(null);

  const [companies, setCompanies] = useState<{ id: number; name: string, accoid: number }[]>([]);
  const [user, setUser] = useState<{ id: number; name: string; ac_code: number; accoid: number }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [itemCode, setItemCode] = useState<number | null>(null);
  const [Item_Name, setItemName] = useState<String | null>(null);
  const [ic, setIc] = useState<number | null>(null);

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatDateTimeForSQL = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      Date: getCurrentDate(),
      Mill_Code: NaN,
      Grade: "",
      Season: "",
      Lifting_date: getCurrentDate(),
      Payment_Date: getCurrentDate(),
      Display_Rate: "",
      Display_Qty: "",
      user_name: NaN,
      Payment_ToAcCode: 0,
      Pt_Accoid: 0,
      mc: 0,
      ic:0
      // Display_End_Date: getCurrentDateTime(),
    },
  });

  useEffect(() => {
    axios
      .get(`${apiKey}/companieslist`)
      .then((response) => {
        const fetchedCompanies = response.data.map(
          (company: { user_id: number; company_name: string, accoid: number,ac_code:number }) => ({
            id: company.ac_code,
            name: company.company_name,
            accoid: company.accoid
          })
        );
        setCompanies(fetchedCompanies);
      })
      .catch((error) => {
        console.error("Error fetching company data:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${apiKey}/userlist`)
      .then((response) => {
        const fetchedUsers = response.data.map(
          (user: { user_id: number; user_name: string; ac_code: number; accoid: number }) => ({
            id: user.user_id,
            name: user.user_name,
            ac_code: user.ac_code,
            accoid: user.accoid,
          })
        );
        setUser(fetchedUsers);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const handleResaleAdd = (data: FormData, itemCode: number | null, Item_Name: String | null, ic: number | null) => {
    const selectedUser = user.find(user => user.id === data.user_name);
    const selectedCompany = companies.find(company => company.id === data.Mill_Code);

    if (!selectedUser || !selectedCompany) {
      console.error("Selected user or company not found");
      return;
    }
    // const formattedDisplayEndDate = formatDateTimeForSQL(data.Display_End_Date);
    const formDataWithItemCode = {
      ...data,
      itemcode: itemCode || 0,
      Tender_No: 0,
      Item_Name: Item_Name || "",
      user_id: data.user_name,
      Payment_ToAcCode: selectedUser.ac_code || null,
      Pt_Accoid: selectedUser.accoid || null,
      mc: selectedCompany.accoid,
      ic: ic || 0
      // Display_End_Date: formattedDisplayEndDate,
    };

    const formDataArray = [formDataWithItemCode];

    axios
      .post(`${apiKey}/publishlist-tender`, formDataArray, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        onClose();
      })
      .catch(error => {
        console.error("Error publishing form data:", error);
      });
  };

  const handleMillItemSelect = (code: number, name: string, ic: number) => {
    setItemCode(code);
    setItemName(name);
    setIc(ic)
  };

  const onSubmit = (data: FormData) => {
    handleResaleAdd(data, itemCode, Item_Name,ic);
  };

  return (
    <Modal show={isOpen} onHide={onClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ textAlign: 'center', width: '100%' }}>My Order Resale</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Date">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register("Date")}
                  isInvalid={!!errors.Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="user_name">
                <Form.Label>User Resale</Form.Label>
                <Form.Select
                  {...register("user_name", { valueAsNumber: true })}
                  isInvalid={!!errors.user_name}
                >
                  <option value="">Select User</option>
                  {user.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.user_name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Row>
              <Col md={6}>
                <Form.Group controlId="Mill_Code">
                  <Form.Label>Mill Name</Form.Label>
                  <Form.Select
                    as="select"
                    {...register("Mill_Code", { valueAsNumber: true })}
                    isInvalid={!!errors.Mill_Code}
                  >
                    <option value="">Select Mill</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.Mill_Code?.message}
                  </Form.Control.Feedback>
                </Form.Group>

              </Col>
              {/* <Col md={6}>
                <Form.Group controlId="DateTime">
                  <Form.Label>End DateTime</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    {...register("Display_End_Date")}
                    isInvalid={!!errors.Display_End_Date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Display_End_Date?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col> */}

            </Row>
            <Col md={12}>
              <Form.Label>Select Item</Form.Label>
              <SystemHelpMaster
                onAcCodeClick={handleMillItemSelect}
                name="system-help-master"
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="Grade">
                <Form.Label>Grade</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Grade"
                  {...register("Grade")}
                  isInvalid={!!errors.Grade}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Grade?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Season">
                <Form.Label>Season</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Season"
                  {...register("Season")}
                  isInvalid={!!errors.Season}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Season?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Lifting_date">
                <Form.Label>Lifting Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Lifting Date"
                  {...register("Lifting_date")}
                  isInvalid={!!errors.Lifting_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Lifting_date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Payment_Date">
                <Form.Label>Payment Date</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Payment Date"
                  {...register("Payment_Date")}
                  isInvalid={!!errors.Payment_Date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Payment_Date?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="Display_Rate">
                <Form.Label>Sale Rate</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sale Rate"
                  {...register("Display_Rate")}
                  isInvalid={!!errors.Display_Rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Display_Rate?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="Display_Qty">
                <Form.Label>Sale Quantal</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sale Quantal"
                  {...register("Display_Qty")}
                  isInvalid={!!errors.Display_Qty}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Display_Qty?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onClose} ref={finalRef}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ marginLeft: "15px" }}
              >
                Publish
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserResaleForm;
