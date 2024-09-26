from flask import request, jsonify
from app import app, db, socketio
from sqlalchemy.exc import SQLAlchemyError
from app.Models.OrderList.OrderListModels import OrderList  
import os
from app.Models.TenderPurchase.TenderPurchaseModels import TenderHead, TenderDetails
from app.Models.TenderPurchase.TenserPurchaseSchema import TenderHeadSchema, TenderDetailsSchema
import requests
from datetime import datetime
from sqlalchemy import text
from decimal import Decimal
import asyncio
import aiohttp

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Define schemas
tender_head_schema = TenderHeadSchema()
tender_head_schemas = TenderHeadSchema(many=True)

tender_detail_schema = TenderDetailsSchema()
tender_detail_schemas = TenderDetailsSchema(many=True)

def calculate_total_quantal(tenderid):
    total_quantal = db.session.execute(
        text(f"SELECT SUM(Buyer_Quantal) AS total_quantal FROM nt_1_tenderdetails WHERE tenderid=:tenderid"),
        {'tenderid': tenderid}
    ).scalar() or 0
    return total_quantal

def calculate_self_quantal(tenderid):
    self_balance = db.session.execute(
        text(f"select top(1) Buyer_Quantal from nt_1_tenderdetails where tenderid=:tenderid"),
        {'tenderid': tenderid}
    ).scalar() or 0
    return self_balance


def update_buyer_quantal(tenderid, decrease_amount):
    # Define the SQL query
    query = text("""
        UPDATE nt_1_tenderdetails
        SET Buyer_Quantal = Buyer_Quantal - :decrease_amount
        WHERE tenderid = :tenderid
        AND Buyer_Quantal = (
            SELECT TOP(1) Buyer_Quantal
            FROM nt_1_tenderdetails
            WHERE tenderid = :tenderid
        )
    """)

    # Execute the query
    db.session.execute(
        query,
        {'tenderid': tenderid, 'decrease_amount': decrease_amount}
    )

    # Commit the transaction if needed
    db.session.commit()

async def async_post(url, payload):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            return await response.json(), response.status

async def async_put(url, payload):
    async with aiohttp.ClientSession() as session:
        async with session.put(url, json=payload) as response:
            return await response.json(), response.status

@app.route(API_URL + "/placeOrder", methods=['POST'])
async def placeOrder():
    try:
        data = request.json

        # Extract data from JSON request
        Order_Date = data.get('Order_Date')
        Buy_Qty = data.get('Buy_Qty')
        publishid = data.get('publishid')
        tenderid = data.get('tenderid')
        Buy_Rate = data.get('Buy_Rate')
        user_id = data.get('user_id')
        grade = data.get('grade')
        season = data.get('season')
        Display_Rate = data.get('Display_Rate')
        liftingDate = data.get('liftingDate')
        Mill_Code = data.get('Mill_Code')
        mc = data.get('mc')
        ic = data.get('ic')
        Payment_ToAcCode = data.get('Payment_ToAcCode')
        Pt_Accoid = data.get('Pt_Accoid')
        itemcode = data.get('itemcode')
        accoid = data.get("accoid")
        ac_code = data.get("ac_code")
        Packing = 50

        # Calculate the total quantal and self balance asynchronously
        total_quantal = calculate_total_quantal(tenderid)
        self_balance = calculate_self_quantal(tenderid)

        total_quantal = float(total_quantal) if isinstance(total_quantal, Decimal) else total_quantal
        self_balance = float(self_balance) if isinstance(self_balance, Decimal) else self_balance

        quantal_value = total_quantal + Buy_Qty if self_balance <= 0 else total_quantal

        payload = {
            "headData": {
                "Company_Code": 1,
                "Tender_Date": Order_Date,
                "Grade": grade,
                "season": season,
                "Purc_Rate": Display_Rate,
                "Mill_Rate": Display_Rate,
                "Party_Bill_Rate": Display_Rate,
                "Lifting_Date": liftingDate,
                "Mill_Code": Mill_Code,
                "mc": mc,
                "ic": ic,
                "Payment_To": Payment_ToAcCode,
                "pt": Pt_Accoid,
                "Tender_From": Payment_ToAcCode,
                "tf": Pt_Accoid,
                "Tender_DO": Payment_ToAcCode,
                "td": Pt_Accoid,
                "Voucher_By": Payment_ToAcCode,
                "vb": Pt_Accoid,
                "Broker": 2,
                "Brokrage": 0,
                "gstratecode": 1,
                "itemcode": itemcode,
                "TCS_Rate": 0,
                "TCS_Amt": 0,
                "TDS_Rate": 0,
                "TDS_Amt": 0,
                "Excise_Rate": 0,
                "Branch_Id": 0,
                "Voucher_No": 0,
                "Sell_Note_No": 0,
                "Packing": 50,
                "Quantal": quantal_value,
                "Bags": (total_quantal + Buy_Qty) * 100 / Packing,
                "CashDiff": 0
            },
            "detailData": [
                {
                    "rowaction": "add",
                    "Company_Code": 1,
                    "Buyer": ac_code,
                    "buyerid": accoid,
                    "Buyer_Party": ac_code,
                    "buyerpartyid": accoid,
                    "sub_broker": ac_code,
                    "sbr": accoid,
                    "ShipTo": ac_code,
                    "shiptoid": accoid,
                    "Buyer_Quantal": Buy_Qty,
                    "Sale_Rate": Buy_Rate,
                    "Commission_Rate": 0,
                    "Sauda_Date": Order_Date,
                    "Lifting_Date": Order_Date,
                    "IsActive": 1,
                    "year_code": 4,
                    "CashDiff": 0,
                    "tcs_rate": 0,
                    "tcs_amt": 0,
                    "gst_rate": 5,
                    "tcs_amt": 0,
                    "gst_amt": 0,
                }
            ]
        }

        if not tenderid or tenderid == 0:
            # Insert tender head detail
            url = f"{request.host_url}{API_URL}/insert_tender_head_detail"
            payload['headData'].update({
                "Tender_Date": Order_Date,
                "Lifting_Date": liftingDate,
                "Year_Code": 4,
                "Packing": 50,
                "Quantal": quantal_value,
                "Bags": (total_quantal + Buy_Qty) * 100 / Packing,
            })
            response, status = await async_post(url, payload)
        else:
            # Update tender purchase
            url = f"{request.host_url}{API_URL}/update_tender_purchase?tenderid={tenderid}"
            response, status = await async_put(url, payload)

        if status not in (200, 201):
            return jsonify({'error': 'Failed to process request', 'message': response}), 500

        added_details = response.get('addedDetails', [])
        if len(added_details) == 2:
            added_details = added_details[1:]

        if not added_details:
            return jsonify({'error': 'No details added in the process'}), 500

        tenderdetailid = added_details[0].get('tenderdetailid')
        tender_no = added_details[0].get('Tender_No')
        if not tenderdetailid:
            return jsonify({'error': 'Failed to retrieve tenderdetailid from added details'}), 500

        if not tenderid:
            tenderid = added_details[0].get('tenderid')

        new_order = OrderList(
            Order_Date=Order_Date,
            Buy_Qty=Buy_Qty,
            Buy_Rate=Buy_Rate,
            publishid=publishid,
            tenderid=tenderid,
            tenderdetailid=tenderdetailid,
            user_id=user_id,
        )

        db.session.add(new_order)
        db.session.commit()

        orderid = new_order.orderid

        service_bill_payload = {
            "head_data": {
                "Date": datetime.now().strftime('%Y/%m/%d'),
                "Company_Code": 1,
                "Year_Code": 4,
                "Customer_Code": ac_code,
                "GstRateCode": 2,
                "cc": accoid,
                "Subtotal": Buy_Qty * 2,
                "IsTDS": 'N',
                "orderid": orderid
            },
            "detail_data": [
                {
                    "rowaction": "add",
                    "Company_Code": 1,
                    "Year_Code": 4,
                    "Item_Code": itemcode,
                    "ic": ic,
                    "Description": "We need to charge 1 RS per quintal for brokerage",
                    "Detail_Id": 1,
                    "Amount": Buy_Qty * 2
                }
            ]
        }

        service_response, service_status = await async_post(
            f"{request.host_url}{API_URL}/insert-servicebill", service_bill_payload)

        if service_status != 201:
            return jsonify({"error": "Failed to create service bill", "details": service_response}), service_status

        update_url = f"{request.host_url}{API_URL}/update-tender-info?publishid={publishid}"
        update_payload = {"Tender_No": tender_no, "tenderid": tenderid}
        update_response, update_status = await async_put(update_url, update_payload)

        if update_status not in (200, 201):
            print(f"Failed to update tender info: {update_response}")

        if self_balance > 0:
            update_buyer_quantal(tenderid, Buy_Qty)

        socketio.emit('newOrder', {
            'Order_Date': Order_Date,
            'Buy_Qty': Buy_Qty,
            'publishid': publishid,
            'tenderid': tenderid,
            'tenderdetailid': tenderdetailid,
            'Buy_Rate': Buy_Rate,
            'user_id': user_id,
        })

        return jsonify({'message': 'Order placed successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


#insert New Tender
@app.route(API_URL+"/insert_tender_head_detail", methods=["POST"])
def insert_tender_head_detail():
    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']
        try:
            maxTender_No = db.session.query(db.func.max(TenderHead.Tender_No)).scalar() or 0
            newTenderNo = maxTender_No + 1
            headData['Tender_No'] = newTenderNo

            new_head = TenderHead(**headData)
            db.session.add(new_head)

            createdDetails = []
            updatedDetails = []
            deletedDetailIds = []

            max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=newTenderNo).scalar() or 0

            # Get the current date in the required format
            current_date = datetime.now().strftime("%Y-%m-%d")

            # Add the default entry first
            default_entry = TenderDetails(
                ID=max_detail_id + 1,
                Tender_No=newTenderNo,
                Company_Code=1,
                Buyer=2,  
                Buyer_Quantal=0, 
                Sale_Rate=0,  
                Commission_Rate=0, 
                Sauda_Date=current_date, 
                Lifting_Date=current_date,
                IsActive=1,
                year_code=4,
                buyerid=2,
                Buyer_Party=2,
                buyerpartyid=2,
                sub_broker=2,
                sbr=2,
                ShipTo=2,
                shiptoid=2,
                tcs_rate=0,
                gst_rate=5,
                tcs_amt=0,
                gst_amt=0,
                CashDiff=0
            )
            new_head.details.append(default_entry)
            createdDetails.append(default_entry)

            # Assign ID starting from 2 for additional records
            for index, item in enumerate(detailData):
                if 'rowaction' in item:
                    if item['rowaction'] == "add":
                        item['ID'] = max_detail_id + index + 2
                        item['Tender_No'] = newTenderNo
                        del item['rowaction']
                        new_detail = TenderDetails(**item)
                        new_head.details.append(new_detail)
                        createdDetails.append(new_detail)

                    elif item['rowaction'] == "update":
                        tenderdetailid = item['tenderdetailid']
                        update_values = {k: v for k, v in item.items() if k not in ('tenderdetailid', 'tenderid', 'rowaction')}
                        db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).update(update_values)
                        updatedDetails.append(tenderdetailid)

                    elif item['rowaction'] == "delete":
                        tenderdetailid = item['tenderdetailid']
                        detail_to_delete = db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).one_or_none()
                        if detail_to_delete:
                            db.session.delete(detail_to_delete)
                            deletedDetailIds.append(tenderdetailid)

            db.session.commit()

            return jsonify({
                "message": "Data Inserted successfully",
                "head": tender_head_schema.dump(new_head),
                "addedDetails": [tender_detail_schema.dump(detail) for detail in createdDetails],
                "updatedDetails": updatedDetails,
                "deletedDetailIds": deletedDetailIds
            }), 201  # 201 Created

        except Exception as e:
            db.session.rollback()
            print(e)
            return jsonify({"error": "Internal server error", "message": str(e)}), 500  

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


# Update the record in both the table also perform the operation add, update, delete in detail section.
@app.route(API_URL + "/update_tender_purchase", methods=["PUT"])
def update_tender_purchase():
    try:
        tenderid = request.args.get('tenderid')
        if tenderid is None:
            return jsonify({"error": "Missing 'tenderid' parameter"}), 400
        
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']

        try:
            transaction = db.session.begin_nested()
            updatedHeadCount = db.session.query(TenderHead).filter(TenderHead.tenderid == tenderid).update(headData)
            
            createdDetails = []
            updatedDetails = []
            deletedDetailIds = []

            updated_tender_head = db.session.query(TenderHead).filter(TenderHead.tenderid == tenderid).one()
            tender_no = updated_tender_head.Tender_No

            for item in detailData:
                if item['rowaction'] == "add":
                    item['Tender_No'] = tender_no
                    item['tenderid'] = tenderid
                    if 'ID' not in item:
                        max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
                        new_detail_id = max_detail_id + 1
                        item['ID'] = new_detail_id
                    del item['rowaction'] 
                    new_detail = TenderDetails(**item)
                    db.session.add(new_detail) 
                    db.session.flush()  
                    db.session.refresh(new_detail)  
                    createdDetails.append({
                        **item,
                        'tenderdetailid': new_detail.tenderdetailid
                    })
         
                elif item['rowaction'] == "update":
                    item['Tender_No'] = tender_no
                    item['tenderid'] = tenderid
                    tenderdetailid = item['tenderdetailid']
                    update_values = {k: v for k, v in item.items() if k not in ('tenderdetailid', 'tenderid')}
                    del update_values['rowaction'] 
                    db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).update(update_values)
                    updatedDetails.append(tenderdetailid)

                elif item['rowaction'] == "delete":
                    tenderdetailid = item['tenderdetailid']
                    detail_to_delete = db.session.query(TenderDetails).filter(TenderDetails.tenderdetailid == tenderdetailid).one_or_none()
                    if detail_to_delete:
                        db.session.delete(detail_to_delete)
                        deletedDetailIds.append(tenderdetailid)

            db.session.commit()
            serialized_created_details = createdDetails
            return jsonify({
                "message": "Data Updated successfully",
                "updatedHeadCount": updatedHeadCount,
                "addedDetails": serialized_created_details,
                "updatedDetails": updatedDetails,
                "deletedDetailIds": deletedDetailIds
            }), 200 

        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error in update_tender_purchase: {str(e)}")
            return jsonify({"error": "Internal server error", "message": str(e)}), 500 

    except Exception as e:
        app.logger.error(f"Error in update_tender_purchase: {str(e)}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    


#Our DO Report
@app.route(API_URL+"/generating_ourDO_report", methods=["GET"])
def generating_ourDO_report():
    try:
        company_code = request.args.get('Company_Code')
        year_code = request.args.get('Year_Code')
        doc_no = request.args.get('doc_no')

        if not company_code or not year_code or not doc_no:
            return jsonify({"error": "Missing 'Company_Code' or 'Year_Code' parameter"}), 400

        query = ('''SELECT dbo.nt_1_deliveryorder.tran_type, dbo.nt_1_deliveryorder.doc_no, dbo.nt_1_deliveryorder.desp_type, dbo.nt_1_deliveryorder.doc_date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.doc_date, 103) AS doc_dateConverted, 
                  dbo.nt_1_deliveryorder.mill_code, dbo.nt_1_deliveryorder.grade, dbo.nt_1_deliveryorder.quantal, dbo.nt_1_deliveryorder.packing, dbo.nt_1_deliveryorder.bags, dbo.nt_1_deliveryorder.mill_rate, dbo.nt_1_deliveryorder.sale_rate, 
                  dbo.nt_1_deliveryorder.Tender_Commission, dbo.nt_1_deliveryorder.diff_rate, dbo.nt_1_deliveryorder.diff_amount, dbo.nt_1_deliveryorder.amount, dbo.nt_1_deliveryorder.DO, dbo.nt_1_deliveryorder.voucher_by, 
                  dbo.nt_1_deliveryorder.broker, dbo.nt_1_deliveryorder.company_code, dbo.nt_1_deliveryorder.Year_Code, dbo.nt_1_deliveryorder.Branch_Code, dbo.nt_1_deliveryorder.purc_no, dbo.nt_1_deliveryorder.purc, 
                  dbo.nt_1_deliveryorder.purc_order, dbo.nt_1_deliveryorder.purc_type, dbo.nt_1_deliveryorder.truck_no, dbo.nt_1_deliveryorder.transport, dbo.nt_1_deliveryorder.less, dbo.nt_1_deliveryorder.less_amount, 
                  dbo.nt_1_deliveryorder.final_amout, dbo.nt_1_deliveryorder.vasuli, dbo.nt_1_deliveryorder.narration1, dbo.nt_1_deliveryorder.narration2, dbo.nt_1_deliveryorder.narration3, dbo.nt_1_deliveryorder.narration4, 
                  dbo.nt_1_deliveryorder.narration5, dbo.nt_1_deliveryorder.excise_rate, dbo.nt_1_deliveryorder.memo_no, dbo.nt_1_deliveryorder.freight, dbo.nt_1_deliveryorder.adv_freight1, dbo.nt_1_deliveryorder.driver_no, 
                  dbo.nt_1_deliveryorder.driver_Name, dbo.nt_1_deliveryorder.voucher_no, dbo.nt_1_deliveryorder.voucher_type, dbo.nt_1_deliveryorder.GETPASSCODE, dbo.nt_1_deliveryorder.tender_Remark, dbo.nt_1_deliveryorder.vasuli_rate, 
                  dbo.nt_1_deliveryorder.vasuli_amount, dbo.nt_1_deliveryorder.to_vasuli, dbo.nt_1_deliveryorder.naka_delivery, dbo.nt_1_deliveryorder.send_sms, dbo.nt_1_deliveryorder.Itag, dbo.nt_1_deliveryorder.Ac_Code, 
                  dbo.nt_1_deliveryorder.FreightPerQtl, dbo.nt_1_deliveryorder.Freight_Amount, dbo.nt_1_deliveryorder.Freight_RateMM, dbo.nt_1_deliveryorder.Freight_AmountMM, dbo.nt_1_deliveryorder.Memo_Advance, 
                  dbo.nt_1_deliveryorder.Paid_Rate1, dbo.nt_1_deliveryorder.Paid_Amount1, dbo.nt_1_deliveryorder.Paid_Narration1, dbo.nt_1_deliveryorder.Paid_Rate2, dbo.nt_1_deliveryorder.Paid_Amount2, dbo.nt_1_deliveryorder.Paid_Narration2, 
                  dbo.nt_1_deliveryorder.Paid_Rate3, dbo.nt_1_deliveryorder.Paid_Amount3, dbo.nt_1_deliveryorder.Paid_Narration3, dbo.nt_1_deliveryorder.MobileNo, dbo.nt_1_deliveryorder.Created_By, dbo.nt_1_deliveryorder.Modified_By, 
                  dbo.nt_1_deliveryorder.UTR_No, dbo.nt_1_deliveryorder.UTR_Year_Code, dbo.nt_1_deliveryorder.Carporate_Sale_No, dbo.nt_1_deliveryorder.Carporate_Sale_Year_Code, dbo.nt_1_deliveryorder.Delivery_Type, 
                  dbo.nt_1_deliveryorder.WhoseFrieght, dbo.nt_1_deliveryorder.SB_No, dbo.nt_1_deliveryorder.Invoice_No, dbo.nt_1_deliveryorder.vasuli_rate1, dbo.nt_1_deliveryorder.vasuli_amount1, dbo.nt_1_deliveryorder.Party_Commission_Rate, 
                  dbo.nt_1_deliveryorder.MM_CC, dbo.nt_1_deliveryorder.MM_Rate, dbo.nt_1_deliveryorder.Voucher_Brokrage, dbo.nt_1_deliveryorder.Voucher_Service_Charge, dbo.nt_1_deliveryorder.Voucher_RateDiffRate, 
                  dbo.nt_1_deliveryorder.Voucher_RateDiffAmt, dbo.nt_1_deliveryorder.Voucher_BankCommRate, dbo.nt_1_deliveryorder.Voucher_BankCommAmt, dbo.nt_1_deliveryorder.Voucher_Interest, 
                  dbo.nt_1_deliveryorder.Voucher_TransportAmt, dbo.nt_1_deliveryorder.Voucher_OtherExpenses, dbo.nt_1_deliveryorder.CheckPost, dbo.nt_1_deliveryorder.SaleBillTo, dbo.nt_1_deliveryorder.Pan_No, dbo.nt_1_deliveryorder.Vasuli_Ac, 
                  dbo.nt_1_deliveryorder.LoadingSms, dbo.nt_1_deliveryorder.GstRateCode, dbo.nt_1_deliveryorder.GetpassGstStateCode, dbo.nt_1_deliveryorder.VoucherbyGstStateCode, dbo.nt_1_deliveryorder.SalebilltoGstStateCode, 
                  dbo.nt_1_deliveryorder.GstAmtOnMR, dbo.nt_1_deliveryorder.GstAmtOnSR, dbo.nt_1_deliveryorder.GstExlSR, dbo.nt_1_deliveryorder.GstExlMR, dbo.nt_1_deliveryorder.MillGSTStateCode, 
                  dbo.nt_1_deliveryorder.TransportGSTStateCode, dbo.nt_1_deliveryorder.EWay_Bill_No, dbo.nt_1_deliveryorder.Distance, dbo.nt_1_deliveryorder.EWayBillChk, dbo.nt_1_deliveryorder.MillInvoiceNo, 
                  dbo.nt_1_deliveryorder.Purchase_Date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.Purchase_Date, 103) AS Purchase_DateConverted, dbo.nt_1_deliveryorder.doid, dbo.nt_1_deliveryorder.mc, dbo.nt_1_deliveryorder.gp, 
                  dbo.nt_1_deliveryorder.st, dbo.nt_1_deliveryorder.sb, dbo.nt_1_deliveryorder.tc, dbo.nt_1_deliveryorder.itemcode, dbo.nt_1_deliveryorder.cs, dbo.nt_1_deliveryorder.ic, dbo.nt_1_deliveryorder.tenderdetailid, dbo.nt_1_deliveryorder.bk, 
                  dbo.nt_1_deliveryorder.docd, qrymstmillcode.Ac_Name_E AS millname, qrymstmillcode.Address_E AS milladress, qrymstmillcode.Gst_No AS millgstno, qrymstmillcode.Email_Id AS millemailid, qrymstmillcode.CompanyPan AS millpanno, 
                  qrymstmillcode.cityname AS millcityname, qrymstmillcode.citypincode AS millcitypincode, qrymstmillcode.citystate AS millcitystate, qrymstmillcode.citygststatecode AS millgststatecodemster, qrymstgetpass.Ac_Name_E AS getpassname, 
                  qrymstgetpass.Address_E AS getpassaddress, qrymstgetpass.Gst_No AS getpassgstno, qrymstgetpass.Email_Id AS getpassemailid, qrymstgetpass.CompanyPan AS getpasspanno, qrymstgetpass.cityname AS getpasscityname, 
                  qrymstgetpass.citypincode AS getpasscitypincode, qrymstgetpass.citystate AS getpasscitystate, qrymstgetpass.citygststatecode AS getpasscitygststatecode, qrymstshipto.Ac_Name_E AS shiptoname, 
                  qrymstshipto.Address_E AS shiptoaddress, qrymstshipto.Gst_No AS shiptogstno, qrymstshipto.Email_Id AS shiptoemail, qrymstshipto.CompanyPan AS shiptopanno, qrymstshipto.cityname AS shiptocityname, 
                  qrymstshipto.citypincode AS shiptocitypincode, qrymstshipto.citystate AS shiptocitystate, qrymstshipto.citygststatecode AS shiptogststatecode, qrymstsalebill.Ac_Name_E AS salebillname, qrymstsalebill.Address_E AS salebilladdress, 
                  qrymstsalebill.Gst_No AS salebillgstno, qrymstsalebill.Email_Id AS salebillemail, qrymstsalebill.CompanyPan AS salebillpanno, qrymstsalebill.cityname AS salebillcityname, qrymstsalebill.citypincode AS salebillcitypincode, 
                  qrymstsalebill.citystate AS salebillcitystate, qrymstsalebill.citygststatecode AS salebillcitygststatecode, qrymsttransportcode.Ac_Name_E AS transportname, qrymsttransportcode.Address_E AS transportaddress, 
                  qrymsttransportcode.CompanyPan AS transportpanno, qrymstbrokercode.Ac_Name_E AS brokername, qrymstdo.Ac_Name_E AS doname, qrymstbrokercode.Address_E AS doaddress, qrymsttransportcode.Gst_No AS transportgstno, 
                  qrymsttransportcode.Email_Id AS transportemail, qrymstdo.Gst_No AS dogstno, qrymstdo.Email_Id AS doemail, qrymstdo.CompanyPan AS dopanno, qrymstdo.cityname AS docityname, qrymstdo.citypincode AS docitypincode, 
                  qrymstdo.citystate AS docitystate, qrymstdo.citygststatecode AS docitygststatecode, dbo.qrymstitem.System_Name_E AS itemname, dbo.qrymstitem.HSN, qrymstmillcode.Short_Name AS millshortname, 
                  qrygetpassstatemaster.State_Name AS getpassstatename, qryshiptostatemaster.State_Name AS shiptostatename, gstmstmill.State_Name AS gstmillstatename, gstmstsellbill.State_Name AS gststatesellbillname, 
                  gstmsttransport.State_Name AS gststatetransportname, dbo.nt_1_gstratemaster.GST_Name, dbo.nt_1_deliveryorder.vb, dbo.nt_1_deliveryorder.va, qrymstvoucherby.Ac_Name_E AS voucherbyname, 
                  qrymstvasuliacc.Ac_Name_E AS vasuliacname, qrymstshipto.Mobile_No AS shiptomobno, qrymstshipto.FSSAI AS shiptofssai, qrymstshipto.ECC_No AS shiptoeccno, qrymsttransportcode.Mobile_No AS transportmobno, 
                  qrymstgetpass.Mobile_No AS getpassmobno, qrymstgetpass.Cst_no AS getpasscstno, qrymstgetpass.FSSAI AS getpassfssai, qrymstvoucherby.Address_E AS vouvherbyaddress, qrymstvoucherby.cityname AS voucherbycityname, 
                  qrymstvoucherby.citystate AS voucherbycitystate, qrymstvoucherby.Cst_no AS voucherbycstno, qrymstvoucherby.Gst_No AS voucherbygstno, qrymstvoucherby.CompanyPan AS voucherbypan, 
                  qrymstvoucherby.Mobile_No AS voucherbymobno, qrymstmillcode.Mobile_No AS millmobno, qrymstsalebill.Mobile_No AS salebillmobno, qrymstbrokercode.Mobile_No AS brokermobno, dbo.nt_1_deliveryorder.carporate_ac, 
                  dbo.nt_1_deliveryorder.ca, qrycarporateac.Ac_Name_E AS carporateacname, qrycarporateac.Gst_No AS carporateacgstno, qrycarporateac.citygststatecode AS carporateacstatecode, 
                  qrymstvoucherby.citygststatecode AS voucherbystatecode, qrymsttransportcode.citygststatecode AS transportstatecode, dbo.nt_1_deliveryorder.mill_inv_date, CONVERT(varchar(10), dbo.nt_1_deliveryorder.mill_inv_date, 103) 
                  AS mill_inv_dateConverted, dbo.nt_1_deliveryorder.mill_rcv, qrymstsalebill.Short_Name AS billtoshortname, qrymstshipto.Short_Name AS shiptoshortname, qrymsttransportcode.Short_Name AS transportshortname, 
                  qrymstdo.Short_Name AS doshortname, qrymstvoucherby.Short_Name AS voucherbyshortname, qrymstgetpass.Short_Name AS getpassshortname, dbo.nt_1_deliveryorder.MillEwayBill, dbo.nt_1_deliveryorder.TCS_Rate, 
                  dbo.nt_1_deliveryorder.Sale_TCS_Rate, dbo.nt_1_deliveryorder.Mill_AmtWO_TCS, dbo.nt_1_deliveryorder.newsbno, CONVERT(varchar(10), dbo.nt_1_deliveryorder.newsbdate, 103) AS newsbdate, dbo.nt_1_deliveryorder.einvoiceno, 
                  dbo.nt_1_deliveryorder.ackno, dbo.nt_1_deliveryorder.brandcode, dbo.Brand_Master.Marka, dbo.nt_1_deliveryorder.Cash_diff, dbo.nt_1_deliveryorder.CashDiffAc, dbo.nt_1_deliveryorder.TDSAc, dbo.nt_1_deliveryorder.CashDiffAcId, 
                  dbo.nt_1_deliveryorder.TDSAcId, dbo.nt_1_deliveryorder.TDSRate, dbo.nt_1_deliveryorder.TDSAmt, qryTDS.Ac_Name_E AS TDSName, qrycashdiif.Ac_Name_E AS CAshdiffName, dbo.nt_1_deliveryorder.TDSCut, 
                  dbo.nt_1_deliveryorder.tenderid, dbo.nt_1_tender.Payment_To, dbo.nt_1_deliveryorder.MemoGSTRate, qrymstshipto.Pincode, dbo.nt_1_deliveryorder.RCMCGSTAmt, dbo.nt_1_deliveryorder.RCMSGSTAmt, 
                  dbo.nt_1_deliveryorder.RCMIGSTAmt, dbo.nt_1_deliveryorder.saleid, qrymstgetpass.Pincode AS getpasspin, dbo.nt_1_tender.season, dbo.nt_1_accountmaster.Short_Name AS paymentshortname, dbo.nt_1_deliveryorder.RCMNumber, 
                  CONVERT(varchar(10), dbo.nt_1_deliveryorder.EwayBillValidDate, 103) AS EwayBillValidDate, dbo.nt_1_deliveryorder.SaleTDSRate, dbo.nt_1_deliveryorder.PurchaseTDSRate, dbo.nt_1_deliveryorder.PurchaseRate, 
                  dbo.nt_1_deliveryorder.SBNarration, ' ' AS WordinAmount, dbo.nt_1_tender.Tender_Date, ' ' AS utrnarration, qrymstdo.Address_E AS DoAdd, qrymstgetpass.Tan_no AS getpasstan_no, qrymstshipto.Tan_no AS shiptotan_no, 
                  qrymstdo.FSSAI AS dofssaino, qrycashdiif.cityname AS cashdiifcity, qrycashdiif.Mobile_No AS cashdiifmobno, dbo.nt_1_deliveryorder.MailSend, dbo.nt_1_deliveryorder.ISEInvoice, dbo.nt_1_deliveryorder.IsPayment, 
                  CONVERT(varchar(10), dbo.nt_1_deliveryorder.Do_DATE, 103) AS Do_Date_Conv, dbo.nt_1_sugarsale.saleid AS saleidtable, dbo.qrymstaccountmaster.Ac_Name_E AS saleBillToName, 
                  dbo.qrymstaccountmaster.Pincode AS saleBillToPinCode, dbo.qrymstaccountmaster.Gst_No AS saleBillToGSTNo, dbo.qrymstaccountmaster.FSSAI AS saleBillToFSSAI, dbo.qrymstaccountmaster.GSTStateCode, 
                  dbo.qrymstaccountmaster.cityname AS saleBillToCityName, dbo.qrymstaccountmaster.CompanyPan AS saleBillToPan, dbo.qrymstaccountmaster.State_Name AS saleBillToStateName, 
                  dbo.qrymstaccountmaster.Address_E AS saleBillToAddress, dbo.qrydodetail.Narration, dbo.qrydodetail.Amount AS UTRAmount, dbo.qrydodetail.UTRDate, dbo.qrydodetail.totUTRAmt
FROM     dbo.nt_1_deliveryorder INNER JOIN
                  dbo.qrymstaccountmaster ON dbo.nt_1_deliveryorder.sb = dbo.qrymstaccountmaster.accoid LEFT OUTER JOIN
                  dbo.qrydodetail ON dbo.nt_1_deliveryorder.doid = dbo.qrydodetail.doid LEFT OUTER JOIN
                  dbo.nt_1_sugarsale ON dbo.nt_1_deliveryorder.Year_Code = dbo.nt_1_sugarsale.Year_Code AND dbo.nt_1_deliveryorder.company_code = dbo.nt_1_sugarsale.Company_Code AND 
                  dbo.nt_1_deliveryorder.doc_no = dbo.nt_1_sugarsale.DO_No LEFT OUTER JOIN
                  dbo.nt_1_accountmaster RIGHT OUTER JOIN
                  dbo.nt_1_tender ON dbo.nt_1_accountmaster.accoid = dbo.nt_1_tender.pt ON dbo.nt_1_deliveryorder.purc_no = dbo.nt_1_tender.Tender_No AND 
                  dbo.nt_1_deliveryorder.company_code = dbo.nt_1_tender.Company_Code LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qryTDS ON dbo.nt_1_deliveryorder.TDSAcId = qryTDS.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrycashdiif ON dbo.nt_1_deliveryorder.CashDiffAcId = qrycashdiif.accoid LEFT OUTER JOIN
                  dbo.Brand_Master ON dbo.nt_1_deliveryorder.company_code = dbo.Brand_Master.Company_Code AND dbo.nt_1_deliveryorder.brandcode = dbo.Brand_Master.Code LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymsttransportcode ON dbo.nt_1_deliveryorder.tc = qrymsttransportcode.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrycarporateac ON dbo.nt_1_deliveryorder.ca = qrycarporateac.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstvasuliacc ON dbo.nt_1_deliveryorder.va = qrymstvasuliacc.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstvoucherby ON dbo.nt_1_deliveryorder.vb = qrymstvoucherby.accoid LEFT OUTER JOIN
                  dbo.nt_1_gstratemaster ON dbo.nt_1_deliveryorder.GstRateCode = dbo.nt_1_gstratemaster.Doc_no AND dbo.nt_1_deliveryorder.company_code = dbo.nt_1_gstratemaster.Company_Code LEFT OUTER JOIN
                  dbo.qrymstitem ON dbo.nt_1_deliveryorder.ic = dbo.qrymstitem.systemid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstdo ON dbo.nt_1_deliveryorder.docd = qrymstdo.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstbrokercode ON qrymstbrokercode.accoid = dbo.nt_1_deliveryorder.bk LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstsalebill ON dbo.nt_1_deliveryorder.sb = qrymstsalebill.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstshipto LEFT OUTER JOIN
                  dbo.gststatemaster AS qryshiptostatemaster ON qryshiptostatemaster.State_Code = qrymstshipto.GSTStateCode ON dbo.nt_1_deliveryorder.st = qrymstshipto.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstgetpass LEFT OUTER JOIN
                  dbo.gststatemaster AS qrygetpassstatemaster ON qrygetpassstatemaster.State_Code = qrymstgetpass.GSTStateCode ON dbo.nt_1_deliveryorder.gp = qrymstgetpass.accoid LEFT OUTER JOIN
                  dbo.qrymstaccountmaster AS qrymstmillcode LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmstmill ON qrymstmillcode.GSTStateCode = gstmstmill.State_Code ON qrymstmillcode.accoid = dbo.nt_1_deliveryorder.mc LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmstsellbill ON qrymstsalebill.GSTStateCode = gstmstsellbill.State_Code LEFT OUTER JOIN
                  dbo.gststatemaster AS gstmsttransport ON qrymsttransportcode.GSTStateCode = gstmsttransport.State_Code
                 where dbo.nt_1_deliveryorder.Company_Code = :company_code and dbo.nt_1_deliveryorder.Year_Code = :year_code and dbo.nt_1_deliveryorder.doc_no = :doc_no
                                 '''
            )
        additional_data = db.session.execute(text(query), {"company_code": company_code, "year_code": year_code, "doc_no": doc_no})

        # Extracting category name from additional_data
        additional_data_rows = additional_data.fetchall()
        

        # Convert additional_data_rows to a list of dictionaries
        all_data = [dict(row._mapping) for row in additional_data_rows]

        for data in all_data:
            if 'doc_date' in data and data['doc_date'] is not None:
                data['doc_date'] = data['doc_date'].strftime('%Y-%m-%d')
            else:
                data['doc_date'] = None

            if 'Purchase_Date' in data and data['Purchase_Date'] is not None:
                data['Purchase_Date'] = data['Purchase_Date'].strftime('%Y-%m-%d')
            else:
                data['Purchase_Date'] = None

            if 'mill_inv_date' in data and data['mill_inv_date'] is not None:
                data['mill_inv_date'] = data['mill_inv_date'].strftime('%Y-%m-%d')
            else:
                data['mill_inv_date'] = None

            if 'Tender_Date' in data and data['Tender_Date'] is not None:
                data['Tender_Date'] = data['Tender_Date'].strftime('%Y-%m-%d')
            else:
                data['Tender_Date'] = None

            if 'UTRDate' in data and data['UTRDate'] is not None:
                data['UTRDate'] = data['UTRDate'].strftime('%Y-%m-%d')
            else:
                data['UTRDate'] = None


        # Prepare response data 
        response = {
            "all_data": all_data
        }
        # If record found, return it
        return jsonify(response), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


