# app/routes/group_routes.py
from flask import jsonify, request
from app import app, db
from app.Models.DeliverOrderModels.AccountMasterModels.GLedgerModels import Gledger
import os
# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

def format_dates(task):
    return {
        "DOC_DATE": task.DOC_DATE.strftime('%Y-%m-%d') if task.DOC_DATE else None
    }

# # Create a new group API
@app.route(API_URL+"/create-Record-gLedger", methods=["POST"])
def create_Record_Gledger():
    try:
        # Extract parameters from the request
        company_code = request.args.get('Company_Code')
        doc_no = request.args.get('DOC_NO')
        year_code = request.args.get('Year_Code')
        tran_type = request.args.get('TRAN_TYPE')
        
        # Check if required parameters are missing
        if None in [company_code, doc_no, year_code, tran_type]:
            return jsonify({'error': 'Missing parameters in the request'}), 400
        
        # Convert parameters to appropriate types
        company_code = int(company_code)
        doc_no = int(doc_no)
        year_code = int(year_code)
        tran_type = str(tran_type)

        # Check if the record exists
        existing_records = Gledger.query.filter_by(
            COMPANY_CODE=company_code,
            DOC_NO=doc_no,
            YEAR_CODE=year_code,
            TRAN_TYPE=tran_type
        ).all()

        # Delete all existing records
        for record in existing_records:
            db.session.delete(record)
        
        db.session.commit()

        # Create new records
        new_records_data = request.json

        # Check if the request body is a list
        if not isinstance(new_records_data, list):
            return jsonify({'error': 'Request body must be a list of records'}), 400

        new_records = []
        for record_data in new_records_data:
            record_data['COMPANY_CODE'] = company_code
            record_data['DOC_NO'] = doc_no
            record_data['YEAR_CODE'] = year_code
            record_data['TRAN_TYPE'] = tran_type
            new_record = Gledger(**record_data)
            new_records.append(new_record)

        # Add new records to the session
        db.session.add_all(new_records)
        db.session.commit()

        return jsonify({
            'message': 'Records created successfully',
            'records': [record_data for record_data in new_records_data]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

