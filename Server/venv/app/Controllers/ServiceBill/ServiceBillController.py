import traceback
from flask import Flask, jsonify, request
from app import app, db
from app.Models.ServiceBill.ServiceBillModel import ServiceBillHead, ServiceBillDetail
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os
from app.Models.ServiceBill.ServiceBillSchema import ServiceBillHeadSchema, ServiceBillDetailSchema
from app.utils.CommonGLedgerFunctions import fetch_company_parameters, get_accoid, getSaleAc, get_acShort_Name
import requests

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

SERVICE_BILL_DETAILS_QUERY = '''
SELECT customer.Ac_Name_E AS partyname, tdsac.Ac_Name_E AS millname, item.System_Name_E AS itemname 
FROM dbo.nt_1_rentbillhead 
LEFT OUTER JOIN dbo.nt_1_gstratemaster ON dbo.nt_1_rentbillhead.gstid = dbo.nt_1_gstratemaster.gstid 
LEFT OUTER JOIN dbo.nt_1_accountmaster AS tdsac ON dbo.nt_1_rentbillhead.ta = tdsac.accoid 
LEFT OUTER JOIN dbo.nt_1_accountmaster AS customer ON dbo.nt_1_rentbillhead.cc = customer.accoid 
LEFT OUTER JOIN dbo.nt_1_rentbilldetails 
LEFT OUTER JOIN dbo.nt_1_systemmaster AS item ON dbo.nt_1_rentbilldetails.ic = item.systemid 
ON dbo.nt_1_rentbillhead.rbid = dbo.nt_1_rentbilldetails.rbid
WHERE (item.System_Type = 'I') and dbo.nt_1_rentbillhead.rbid = :rbid
'''

service_bill_head_schema = ServiceBillHeadSchema()
service_bill_head_schemas = ServiceBillHeadSchema(many=True)

service_bill_detail_schema = ServiceBillDetailSchema()
service_bill_detail_schemas = ServiceBillDetailSchema(many=True)

def format_dates(task):
    return {
        "Date": task.Date.strftime('%Y-%m-%d') if task.Date else None,
    }


# Function to execute SQL query and return match status
def get_match_status(ac_code, company_code, year_code):
    try:
        # Use SQLAlchemy's text() function to construct a parameterized SQL query
        sql_query = text("""
            SELECT CASE WHEN c.GSTStateCode = a.GSTStateCode THEN 'TRUE' ELSE 'FALSE' END AS match_status
            FROM dbo.nt_1_companyparameters AS c
            INNER JOIN dbo.nt_1_accountmaster AS a ON c.Company_Code = a.company_code
            WHERE a.Ac_Code = :ac_code AND a.company_code = :company_code AND c.Year_Code = :year_code
        """)

        # Execute query with parameters
        result = db.session.execute(sql_query, {
            'ac_code': ac_code,
            'company_code': company_code,
            'year_code': year_code
        })

        # Fetch the scalar result (single value)
        match_status = result.scalar()

        # Print for debugging (optional)
        print("match_status:", match_status)

        return match_status

    except Exception as e:
        return str(e)
    

def get_gst_rate(doc_no):
    try:
        # Define the SQL query to fetch the GST rate
        sql_query = text("""
            SELECT Rate
            FROM [EBuyOnlinePortal17082024].[dbo].[nt_1_gstratemaster]
            WHERE Doc_No = :doc_no
        """)

        # Execute the query with the provided doc_no parameter
        result = db.session.execute(sql_query, {'doc_no': doc_no}).fetchone()
        
        # Return the GST rate if found, otherwise None
        return result.Rate if result else None

    except SQLAlchemyError as e:
        app.logger.error(f"Error fetching GST rate: {str(e)}")
        return None


# Insert record for ServiceBillHead and ServiceBillDetail
@app.route(API_URL + "/insert-servicebill", methods=["POST"])
def insert_servicebill():
    tran_type = "RB"
    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        partyName = get_acShort_Name(data['Customer_Code'],data['Company_Code'])
        return {
            "TRAN_TYPE": tran_type,
            "DOC_NO": new_doc_no,
            "DOC_DATE": data['Date'],
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['Company_Code'],
            "YEAR_CODE": data['Year_Code'],
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": 0,
            "NARRATION": "Service Bill No"+ str(data['Doc_No']) + partyName ,
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 1,
            "SORT_TYPE": tran_type,
            "SORT_NO": new_doc_no,
            "vc": 0,
            "progid": 0,
            "tranid": 0,
            "saleid": 0,
            "ac": accoid
        }

    def add_gledger_entry(entries, data, amount, drcr, ac_code, accoid):
        if amount > 0:
            entries.append(create_gledger_entry(data, amount, drcr, ac_code, accoid))
    try:
        data = request.get_json()
        head_data = data['head_data']
        detail_data = data['detail_data']

        print("head_data",head_data)

        match_status = get_match_status(head_data['Customer_Code'],1,4)
        GstRate = get_gst_rate(2)

        print("gstRate",GstRate)
        print("match_status",match_status)

        if match_status == "TRUE":
            rate = GstRate
            head_data['CGSTRate'] = f"{(rate / 2):.2f}"
            head_data['SGSTRate'] = f"{(rate / 2):.2f}"
            head_data['IGSTRate'] = "0.00"

            head_data['CGSTAmount'] = f"{(float(head_data.get('Subtotal', 0)) * float(head_data['CGSTRate']) / 100):.2f}"
            head_data['SGSTAmount'] = f"{(float(head_data.get('Subtotal', 0)) * float(head_data['SGSTRate']) / 100):.2f}"
            head_data['IGSTAmount'] = "0.00"
            head_data['Total'] = f"{(head_data['Subtotal'] + float(head_data['CGSTAmount']) + float(head_data['SGSTAmount'])):.2f}"
            head_data['Final_Amount'] = head_data['Total']
        else:
            rate = GstRate
            head_data['IGSTRate'] = f"{rate:.2f}"
            head_data['CGSTRate'] = "0.00"
            head_data['SGSTRate'] = "0.00"

            head_data['IGSTAmount'] = f"{(float(head_data.get('Subtotal', 0)) * float(head_data['IGSTRate']) / 100):.2f}"
            head_data['CGSTAmount'] = "0.00"
            head_data['SGSTAmount'] = "0.00"
            head_data['Total'] = f"{(head_data['Subtotal'] + float(head_data['IGSTAmount'])):.2f}"
            head_data['Final_Amount'] = head_data['Total']

        max_doc_no = db.session.query(func.max(ServiceBillHead.Doc_No)).scalar() or 0

       
        new_doc_no = max_doc_no + 1
        head_data['Doc_No'] = new_doc_no

        new_head = ServiceBillHead(**head_data)
        db.session.add(new_head)

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        for item in detail_data:
            item['Doc_No'] = new_doc_no
            item['rbid'] = new_head.rbid
            if 'rowaction' in item and item['rowaction'] == "add":
                del item['rowaction']
                new_detail = ServiceBillDetail(**item)
                new_head.details.append(new_detail)
                createdDetails.append(new_detail)

            elif item['rowaction'] == "update":
                rbdid = item['rbdid']
                update_values = {k: v for k, v in item.items() if k not in ('rbdid', 'rowaction', 'rbid')}
                db.session.query(ServiceBillDetail).filter(ServiceBillDetail.rbdid == rbdid).update(update_values)
                updatedDetails.append(rbdid)

            elif item['rowaction'] == "delete":
                rbdid = item['rbdid']
                detail_to_delete = db.session.query(ServiceBillDetail).filter(ServiceBillDetail.rbdid == rbdid).one_or_none()
                if detail_to_delete:
                    db.session.delete(detail_to_delete)
                    deletedDetailIds.append(rbdid)

    
        db.session.commit()

        igst_amount = float(head_data.get('IGSTAmount', 0) or 0)
        final_amount = float(head_data.get('Final_Amount', 0) or 0)
        sgst_amount = float(head_data.get('SGSTAmount', 0) or 0)
        cgst_amount = float(head_data.get('CGSTAmount', 0) or 0)
        TCS_Amt = float(head_data.get('TCS_Amt', 0) or 0)
        TDS_Amt = float(head_data.get('TDS', 0) or 0)

        company_parameters = fetch_company_parameters(head_data['Company_Code'], head_data['Year_Code'])

        gledger_entries = []

        if igst_amount > 0:
            ac_code = company_parameters.IGSTAc
            accoid = get_accoid(company_parameters.IGSTAc,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, igst_amount, "C", ac_code, accoid)

        if cgst_amount > 0:
            ac_code = company_parameters.CGSTAc
            accoid = get_accoid(company_parameters.CGSTAc,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, cgst_amount, "C", ac_code, accoid)

        if sgst_amount > 0:
            ac_code = company_parameters.SGSTAc
            accoid = get_accoid(company_parameters.SGSTAc,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, sgst_amount, "C", ac_code, accoid)
        
        if TCS_Amt > 0:
            ac_code = head_data['Customer_Code']
            accoid = get_accoid(ac_code,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'D', ac_code, accoid)
            ac_code = company_parameters.SaleTCSAc
            accoid = get_accoid(ac_code,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TCS_Amt, 'D', ac_code, accoid)

        if TDS_Amt > 0:
            ac_code = head_data['Customer_Code']
            accoid = get_accoid(ac_code,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'C', ac_code, accoid)
            ac_code = company_parameters.SaleTDSAc
            accoid = get_accoid(ac_code,head_data['Company_Code'])
            add_gledger_entry(gledger_entries, head_data, TDS_Amt, 'C', ac_code, accoid)


        add_gledger_entry(gledger_entries, head_data, final_amount, "D", head_data['Customer_Code'], get_accoid(head_data['Customer_Code'],head_data['Company_Code']))

        for item in detail_data:
            Item_amount = float(item.get('Amount', 0) or 0)
            ic = item.get('ic')

            if Item_amount>0:
                ac_code = getSaleAc(ic)
                add_gledger_entry(gledger_entries, head_data, Item_amount, 'C', ac_code, get_accoid(ac_code,head_data['Company_Code'])) 
                
        query_params = {
            'Company_Code': head_data['Company_Code'],
            'DOC_NO': new_doc_no,
            'Year_Code': head_data['Year_Code'],
            'TRAN_TYPE': tran_type
        }

        response = requests.post( f"{request.host_url}{API_URL}/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data Inserted successfully",
            "head": service_bill_head_schema.dump(new_head),
            "addedDetails": service_bill_detail_schemas.dump(createdDetails),
             "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500

