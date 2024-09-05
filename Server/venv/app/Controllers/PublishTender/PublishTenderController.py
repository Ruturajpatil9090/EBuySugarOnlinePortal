from flask import jsonify, request
from app import app, db, socketio
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
import os
from datetime import datetime
from decimal import Decimal  
from flask_socketio import SocketIO
from flask_cors import CORS

app.config['SECRET_KEY'] = 'ABCDEFGHIJKLMNOPQRST'

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

def format_dates(task):
    return {
        "Lifting_Date": task.Lifting_Date.strftime('%Y-%m-%d') if task.Lifting_Date else None,
        "Tender_Date": datetime.strptime(task.Tender_Date, '%d/%m/%Y').strftime('%Y-%m-%d') if task.Tender_Date else None,
    }

@app.route(API_URL + "/publish-tender", methods=['GET'])
def publish_tender():
    try:
        # Start a database transaction
        with db.session.begin_nested():
            query = '''
              SELECT        TOP (100) PERCENT Company_Code, Lifting_Date, Year_Code, Tender_No, millshortname, Grade, Mill_Rate, Sale_Rate + Commission_Rate AS Sale_Rate, MAX(Lifting_DateConverted) AS Tender_Date, Buyer_Quantal, 
                         DESPATCH, BALANCE, tenderdoshortname, Buyer, tenderdetailid, Purc_Rate, tenderid, itemname, itemcode, Mill_Code, Payment_To, pt, mc
FROM            dbo.qrytenderdobalanceview
WHERE        (Company_Code = 1) AND (Buyer_Quantal <> 0) AND (Buyer = 2)
GROUP BY Company_Code, Lifting_Date, Year_Code, Tender_No, tenderid, millshortname, Grade, Mill_Rate, Sale_Rate, Buyer_Quantal, DESPATCH, BALANCE, tenderdoshortname, Buyer, Commission_Rate, tenderdetailid, Purc_Rate, 
                         itemname, itemcode, Mill_Code, Payment_To, pt, mc
ORDER BY Lifting_Date DESC
            '''
            result = db.session.execute(text(query)).fetchall()

        # Prepare response data with date formatting and Decimal conversion
        response = []
        for row in result:
            formatted_row = {
                "Company_Code": row.Company_Code,
                "Lifting_Date": row.Lifting_Date.strftime('%Y-%m-%d') if row.Lifting_Date else None,
                "Year_Code": row.Year_Code,
                "Tender_No": row.Tender_No,
                "millshortname": row.millshortname,
                "Grade": row.Grade,
                "Mill_Rate": float(row.Mill_Rate) if row.Mill_Rate is not None else None, 
                "Sale_Rate": float(row.Sale_Rate) if row.Sale_Rate is not None else None,  
                "Tender_Date": datetime.strptime(row.Tender_Date, '%d/%m/%Y').strftime('%Y-%m-%d') if row.Tender_Date else None,
                "Buyer_Quantal": float(row.Buyer_Quantal) if row.Buyer_Quantal is not None else None, 
                "DESPATCH": float(row.DESPATCH) if row.DESPATCH is not None else None,  
                "BALANCE": float(row.BALANCE) if row.BALANCE is not None else None,  
                "tenderdoshortname": row.tenderdoshortname,
                "Buyer": row.Buyer,
                "tenderdetailid": row.tenderdetailid,
                "Purc_Rate": float(row.Purc_Rate) if row.Purc_Rate is not None else None,
                "Item_Name": row.itemname,
                "tenderid": row.tenderid,
                "Mill_Code": row.Mill_Code,
                "itemcode": row.itemcode,
                "Payment_ToAcCode": row.Payment_To,
                "Pt_Accoid":row.pt,
                "mc":row.mc
            }
            response.append(formatted_row)

        db.session.commit()
        # Emit the response to all connected clients
        socketio.emit('all_tenders', response)

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    

