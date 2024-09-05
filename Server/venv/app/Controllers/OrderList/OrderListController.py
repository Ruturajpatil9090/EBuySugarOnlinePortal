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

# API route to handle placing orders
@app.route(API_URL + "/placeOrder", methods=['POST'])
def placeOrder():
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

        # Calculate the total quantal
        total_quantal = calculate_total_quantal(tenderid)
        total_quantal = float(total_quantal) if isinstance(total_quantal, Decimal) else total_quantal

        # Calculate the self_balance
        self_balance = calculate_self_quantal(tenderid)
        self_balance = float(self_balance) if isinstance(self_balance, Decimal) else self_balance


        # Define common payload structure
        quantal_value = total_quantal + Buy_Qty if self_balance <= 0 else total_quantal

        # Define common payload structure
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
                "Excise_Rate":0,
                "Branch_Id":0,
                "Voucher_No":0,
                "Sell_Note_No":0, 
                "Packing": 50,
                "Quantal": quantal_value,
                "Bags": (total_quantal + Buy_Qty) * 100 / Packing, 
                "CashDiff":0
            },
            "detailData": [
                {
                    "rowaction": "add",
                    "Company_Code": 1,
                    "Buyer": ac_code,
                    "buyerid":accoid,
                    "Buyer_Party":ac_code,
                    "buyerpartyid":accoid,
                    "sub_broker":ac_code,
                    "sbr":accoid,
                    "ShipTo":ac_code,
                    "shiptoid":accoid,
                    "Buyer_Quantal": Buy_Qty,
                    "Sale_Rate": Buy_Rate,
                    "Commission_Rate": 0,
                    "Sauda_Date": Order_Date,
                    "Lifting_Date": Order_Date,
                    "IsActive": 1,
                    "year_code": 4,
                    "CashDiff":0,
                    "tcs_rate":0,
                    "tcs_amt":0,
                    "gst_rate":5,
                    "tcs_amt":0,
                    "gst_amt":0,
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
        else:
            # Update tender purchase
            url = f"{request.host_url}{API_URL}/update_tender_purchase?tenderid={tenderid}"
   
        # Perform the API call based on the operation
        response = requests.post(url, json=payload) if not tenderid or tenderid == 0 else requests.put(url, json=payload)

        
        if response.status_code not in (200, 201):
            return jsonify({'error': 'Failed to process request', 'message': response.json()}), 500

        # Extract the details from the response
        response_data = response.json()
        added_details = response_data.get('addedDetails', [])

        # update_buyer_quantal(tenderid, Buy_Qty)
 
        # If there are exactly two records, skip the first one
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

        # Create new OrderList entry
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

        # Call the update-tender-info API to update Tender_No and tenderid
        update_url = f"{request.host_url}{API_URL}/update-tender-info?publishid={publishid}"
        update_payload = {
            "Tender_No": tender_no,
            "tenderid": tenderid
        }

        update_response = requests.put(update_url, json=update_payload)
        if self_balance > 0 :
            update_buyer_quantal(tenderid, Buy_Qty)
        if update_response.status_code not in (200, 201):
            # Log the error but continue processing
            print(f"Failed to update tender info: {update_response.json()}")

        # Emit the new order data to all connected clients
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
