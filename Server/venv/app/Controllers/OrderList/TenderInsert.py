# project_folder/app/routes/tender_routes.py
from flask import Flask, jsonify, request
from app import app, db
from app.Models.PublishListModels import TenderHead, TenderDetails 
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError 
import os
API_URL = os.getenv('API_URL')
# Import schemas from the schemas module
from app.Models.TenderPurchase.TenserPurchaseSchema import TenderHeadSchema, TenderDetailsSchema


# Global SQL Query
TASK_DETAILS_QUERY = '''
  SELECT        Mill.Ac_Name_E AS MillName, dbo.nt_1_tender.Mill_Code, dbo.nt_1_tender.mc, dbo.nt_1_tender.ic, dbo.nt_1_tender.itemcode, dbo.qrymstitem.System_Name_E AS ItemName, dbo.nt_1_tender.Bp_Account, dbo.nt_1_tender.bp, 
                         BPAccount.Ac_Name_E AS BPAcName, dbo.nt_1_tender.Payment_To, dbo.nt_1_tender.pt, PaymentTo.Ac_Name_E AS PaymentToAcName, dbo.nt_1_tender.Tender_From, dbo.nt_1_tender.tf, 
                         TenderFrom.Ac_Name_E AS TenderFromAcName, dbo.nt_1_tender.Tender_DO, dbo.nt_1_tender.td, TenderDo.Ac_Name_E AS TenderDoAcName, dbo.nt_1_tender.Voucher_By, dbo.nt_1_tender.vb, 
                         VoucherBy.Ac_Name_E AS VoucherByAcName, dbo.nt_1_tender.Broker, dbo.nt_1_tender.bk, Broker.Ac_Code AS BrokerAcName, dbo.nt_1_tender.gstratecode, dbo.nt_1_gstratemaster.GST_Name, 
                         dbo.nt_1_gstratemaster.Rate AS GSTRate, dbo.qrytenderdetail.*
FROM            dbo.nt_1_tender LEFT OUTER JOIN
                         dbo.qrytenderdetail ON dbo.nt_1_tender.tenderid = dbo.qrytenderdetail.tenderid LEFT OUTER JOIN
                         dbo.nt_1_gstratemaster ON dbo.nt_1_tender.Company_Code = dbo.nt_1_gstratemaster.Company_Code AND dbo.nt_1_tender.gstratecode = dbo.nt_1_gstratemaster.Doc_no LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS Broker ON dbo.nt_1_tender.bk = Broker.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS VoucherBy ON dbo.nt_1_tender.vb = VoucherBy.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS TenderDo ON dbo.nt_1_tender.td = TenderDo.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS TenderFrom ON dbo.nt_1_tender.tf = TenderFrom.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS PaymentTo ON dbo.nt_1_tender.pt = PaymentTo.accoid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS BPAccount ON dbo.nt_1_tender.bp = BPAccount.accoid LEFT OUTER JOIN
                         dbo.qrymstitem ON dbo.nt_1_tender.ic = dbo.qrymstitem.systemid LEFT OUTER JOIN
                         dbo.qrymstaccountmaster AS Mill ON dbo.nt_1_tender.mc = Mill.accoid
						 where  dbo.nt_1_tender.tenderid=:tenderid
'''

#date Format Function
def format_dates(task):
    return {
        "Lifting_Date": task.Lifting_Date.strftime('%Y-%m-%d') if task.Lifting_Date else None,
         "Tender_Date": task.Tender_Date.strftime('%Y-%m-%d') if task.Tender_Date else None,
        #  "Sauda_Date": task.Sauda_Date.strftime('%Y-%m-%d') if task.Sauda_Date else None,
        #  "payment_date": task.payment_date.strftime('%Y-%m-%d') if task.payment_date else None,
    }

# Define schemas
tender_head_schema = TenderHeadSchema()
tender_head_schemas = TenderHeadSchema(many=True)

tender_detail_schema = TenderDetailsSchema()
tender_detail_schemas = TenderDetailsSchema(many=True)

#Insert the record in both the table also perform the oprtation add,update,delete..
@app.route(API_URL+"/insert_tender_head_detail", methods=["POST"])
def insert_tender_head_detail():
    try:
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']
        try:
            maxTender_No = db.session.query(db.func.max(TenderHead.Tender_No)).scalar() or 0
            newTenderNo = maxTender_No + 1
            # Update Task_No in headData
            headData['Tender_No'] = newTenderNo

            new_head = TenderHead(**headData)
            db.session.add(new_head)

            createdDetails = []
            updatedDetails = []
            deletedDetailIds = []

            max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=newTenderNo).scalar() or 0

            for index, item in enumerate(detailData, start=1):
    
               if 'rowaction' in item:
                    if item['rowaction'] == "add":
                        item['ID'] = max_detail_id + index
                        item['Tender_No'] = newTenderNo
                        del item['rowaction']
                        new_detail = TenderDetails(**item)
                        new_head.details.append(new_detail)
                        createdDetails.append(new_detail)

                    elif item['rowaction'] == "update":
                        tenderdetailid = item['tenderdetailid']
                        update_values = {k: v for k, v in item.items() if k not in ('tenderdetailid', 'tenderid')}
                        del update_values['rowaction']  # Remove 'rowaction' field
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
    

#Update the record in both the table also perform the oprtation add,update,delete in detail section..
@app.route(API_URL+"/update_tender_purchase", methods=["PUT"])
def update_tender_purchase():
    try:
        # Retrieve 'tenderid' from URL parameters
        tenderid = request.args.get('tenderid')
        if tenderid is None:
            return jsonify({"error": "Missing 'tenderid' parameter"}), 400  
        data = request.get_json()
        headData = data['headData']
        detailData = data['detailData']

        try:
            transaction = db.session.begin_nested()
            # Update the head data
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
                    # Generate new ID if not provided
                    if 'ID' not in item:
                        max_detail_id = db.session.query(db.func.max(TenderDetails.ID)).filter_by(tenderid=tenderid).scalar() or 0
                        new_detail_id = max_detail_id + 1
                        item['ID'] = new_detail_id
                    del item['rowaction'] 
                    new_detail = TenderDetails(**item)
                    db.session.add(new_detail) 
                    createdDetails.append(item)

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

            # Serialize the createdDetails
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
            return jsonify({"error": "Internal server error", "message": str(e)}), 500 

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500  

