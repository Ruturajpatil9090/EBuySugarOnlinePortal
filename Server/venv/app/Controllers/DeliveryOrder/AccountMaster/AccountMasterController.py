import traceback
from flask import Flask, jsonify, request
from app import app, db
import requests
from sqlalchemy import text, func
from sqlalchemy.exc import SQLAlchemyError
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# Import schemas from the schemas module
from app.Models.DeliverOrderModels.AccountMasterModels.AccountMasterModel import AccountMaster, AccountContact
from app.Models.DeliverOrderModels.AccountMasterModels.AccountMasterSchema import AccountMasterSchema, AccountContactSchema
from app.utils.CommonGLedgerFunctions import get_accoid

# Define schemas
account_master_schema = AccountMasterSchema()
account_master_schemas = AccountMasterSchema(many=True)

account_contact_schema = AccountContactSchema()
account_contact_schemas = AccountContactSchema(many=True)

# Global SQL Query
ACCOUNT_CONTACT_DETAILS_QUERY = '''
    SELECT city.city_name_e AS cityname, dbo.nt_1_bsgroupmaster.group_Name_E AS groupcodename, State.State_Name
FROM     dbo.nt_1_accountmaster LEFT OUTER JOIN
                  dbo.gststatemaster AS State ON dbo.nt_1_accountmaster.GSTStateCode = State.State_Code LEFT OUTER JOIN
                  dbo.nt_1_accontacts ON dbo.nt_1_accountmaster.accoid = dbo.nt_1_accontacts.accoid LEFT OUTER JOIN
                  dbo.nt_1_bsgroupmaster ON dbo.nt_1_accountmaster.bsid = dbo.nt_1_bsgroupmaster.bsid LEFT OUTER JOIN
                  dbo.nt_1_citymaster AS city ON dbo.nt_1_accountmaster.cityid = city.cityid
    WHERE dbo.nt_1_accountmaster.accoid = :accoid
'''

@app.route(API_URL + "/insert-accountmaster", methods=["POST"])
def insert_accountmaster():
    tranType = "OP"
    yearCode = 1

    def create_gledger_entry(data, amount, drcr, ac_code, accoid):
        return {
            "TRAN_TYPE": tranType,
            "DOC_NO": new_master.Ac_Code,
            "DOC_DATE": "03/31/2025",
            "AC_CODE": ac_code,
            "AMOUNT": amount,
            "COMPANY_CODE": data['company_code'],
            "YEAR_CODE": yearCode,
            "ORDER_CODE": 12,
            "DRCR": drcr,
            "UNIT_Code": '',
            "NARRATION": "Opening Balance",
            "TENDER_ID": 0,
            "TENDER_ID_DETAIL": 0,
            "VOUCHER_ID": 0,
            "DRCR_HEAD": 0,
            "ADJUSTED_AMOUNT": 0,
            "Branch_Code": 0,
            "SORT_TYPE": tranType,
            "SORT_NO": new_master.Ac_Code,
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
        master_data = data['master_data']
        contact_data = data['contact_data']

       
                
        # Insert new record logic
        if 'Ac_Code' not in master_data or not master_data['Ac_Code']:
            max_ac_code = db.session.query(func.max(AccountMaster.Ac_Code)).scalar() or 0
            master_data['Ac_Code'] = max_ac_code + 1
        new_master = AccountMaster(**master_data)
        db.session.add(new_master)
        db.session.flush()  # Ensure new_master.accoid is generated

        createdDetails = []
        updatedDetails = []
        deletedDetailIds = []

        max_person_id = db.session.query(func.max(AccountContact.PersonId)).scalar() or 0
        for item in contact_data:
            item['Ac_Code'] = new_master.Ac_Code
            item['accoid'] = new_master.accoid

            if 'rowaction' in item:
                if item['rowaction'] == "add":
                    del item['rowaction']
                    item['PersonId'] = max_person_id + 1
                    new_contact = AccountContact(**item)
                    db.session.add(new_contact)
                    createdDetails.append(new_contact)
                    max_person_id += 1

                elif item['rowaction'] == "update":
                    id = item['id']
                    update_values = {k: v for k, v in item.items() if k not in ('id', 'rowaction', 'accoid')}
                    db.session.query(AccountContact).filter(AccountContact.id == id).update(update_values)
                    updatedDetails.append(id)

                elif item['rowaction'] == "delete":
                    id = item['id']
                    contact_to_delete = db.session.query(AccountContact).filter(AccountContact.id == id).one_or_none()
                    if contact_to_delete:
                        db.session.delete(contact_to_delete)
                        deletedDetailIds.append(id)

        db.session.commit()

        Amount = float(master_data.get('Opening_Balance', 0) or 0)

        gledger_entries = []

        if Amount > 0:
            ac_code = master_data['Ac_Code']
            accoid = new_master.accoid
            add_gledger_entry(gledger_entries, master_data, Amount, "D", ac_code, accoid)

            db.session.commit()

        query_params = {
            'Company_Code': master_data['company_code'],
            'DOC_NO': new_master.Ac_Code,
            'Year_Code': yearCode,
            'TRAN_TYPE': tranType,
        }

        response = requests.post("http://localhost:8080/api/eBuySugar/create-Record-gLedger", params=query_params, json=gledger_entries)

        if response.status_code == 201:
            db.session.commit()
        else:
            print("Error creating gLedger record:", response.json())
            db.session.rollback()
            return jsonify({"error": "Failed to create gLedger record", "details": response.json()}), response.status_code

        return jsonify({
            "message": "Data inserted successfully",
            "AccountMaster": account_master_schema.dump(new_master),
            "AccountContacts": account_contact_schemas.dump(contact_data),
            "updatedDetails": updatedDetails,
            "deletedDetailIds": deletedDetailIds
        }), 201
    
    

    except Exception as e:
        print("Traceback", traceback.format_exc())
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500
    

#Verify Accountmaster GSt number
@app.route(API_URL + "/get-ac-code-by-gst", methods=["GET"])
def get_ac_code_by_gst():
    try:
        # Extract GST number from request
        gst_number = request.args.get('gst_number')
        
        # Validate the input parameter
        if not gst_number:
            return jsonify({'error': 'Missing GST number parameter'}), 400

        # Query the AccountMaster table to find the record with the provided GST number
        account_master = AccountMaster.query.filter_by(Gst_No=gst_number).first()

        if account_master:
            # If a record is found, return the Ac_Code
            return jsonify({
                'message': 'Record found',
                'Ac_Code': account_master.Ac_Code
            }), 200
        else:
            # If no record is found
            return jsonify({'message': 'No record found for the provided GST number'}), 404

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


