from flask import jsonify, request
from app import app, db,socketio
from app.Models.ETender.MillTenderModels import MillTender
from flask_cors import CORS
import os
from datetime import time
from sqlalchemy import text
from flask_socketio import SocketIO
from decimal import Decimal

CORS(app, cors_allowed_origins="*")

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

#format all dates.
def format_dates(tender):
    return {
        "Start_Date": tender['Start_Date'].strftime('%Y-%m-%d') if tender['Start_Date'] else None,
        "Start_Time": tender['Start_Time'].strftime('%H:%M') if tender['Start_Time'] else None,
        "End_Date": tender['End_Date'].strftime('%Y-%m-%d') if tender['End_Date'] else None,
        "End_Time": tender['End_Time'].strftime('%H:%M') if tender['End_Time'] else None,
        "Lifting_Date": tender['Lifting_Date'].strftime('%Y-%m-%d') if tender['Lifting_Date'] else None,
        "Last_Dateof_Payment": tender['Last_Dateof_Payment'].strftime('%Y-%m-%d') if tender['Last_Dateof_Payment'] else None,
        "Created_Date": tender['Created_Date'].strftime('%Y-%m-%d') if tender['Created_Date'] else None,
        "Modified_Date": tender['Modified_Date'].strftime('%Y-%m-%d') if tender['Modified_Date'] else None,
    }

# Utility function to convert Decimal types to float
def convert_decimal_to_float(data):
    for key, value in data.items():
        if isinstance(value, Decimal):
            data[key] = float(value)  
    return data

# API to get the maximum MillTenderId
@app.route(API_URL + "/get_max_mill_tender_id", methods=["GET"])
def get_max_mill_tender_id():
    try:
        max_tender = db.session.query(db.func.max(MillTender.MillTenderId)).scalar() 
        
        if max_tender is None:
            return jsonify({'error': 'No MillTenders found'}), 404

        return jsonify({'max_mill_tender_id': max_tender})
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

#show all Mill that eTender is not Cloed
@app.route(API_URL + "/get_all_mill_tenders", methods=["GET"])
def get_all_mill_tenders():
    try:
        sql_query = """
         SELECT 
            mt.*, 
            mill.Ac_Name_E AS mill_name, 
            item.System_Name_E AS item_name, 
            uc.mill_name AS mill_user_name
        FROM 
            dbo.eBuySugar_MillTender mt
        INNER JOIN 
            dbo.nt_1_accountmaster mill ON mt.mc = mill.accoid
        INNER JOIN 
            dbo.qryItemMaster item ON mt.Item_Code = item.System_Code
        INNER JOIN 
            dbo.eBuySugar_UserCreation uc ON mt.MillUserId = uc.user_id where Tender_Closed='N' order by MillTenderId desc
        """
        
        result = db.session.execute(text(sql_query))
        mill_tenders = result.fetchall()
        
        tenders_data = []
        for tender in mill_tenders:
            tender_data = dict(tender._mapping)
            
            formatted_dates = format_dates(tender_data)
            tender_data.update(formatted_dates)

            tender_data = convert_decimal_to_float(tender_data)
            
            tenders_data.append(tender_data)

        return jsonify(tenders_data)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500
    
#show all Mill that eTender is not Cloed
@app.route(API_URL + "/getAllTendersUtility", methods=["GET"])
def get_All_TendersUtility():
    try:
        sql_query = """
         SELECT 
            mt.*, 
            mill.Ac_Name_E AS mill_name, 
            item.System_Name_E AS item_name, 
            uc.mill_name AS mill_user_name
        FROM 
            dbo.eBuySugar_MillTender mt
        INNER JOIN 
            dbo.nt_1_accountmaster mill ON mt.mc = mill.accoid
        INNER JOIN 
            dbo.qryItemMaster item ON mt.Item_Code = item.System_Code
        INNER JOIN 
            dbo.eBuySugar_UserCreation uc ON mt.MillUserId = uc.user_id order by MillTenderId desc
        """
        
        result = db.session.execute(text(sql_query))
        mill_tenders = result.fetchall()
        
        tenders_data = []
        for tender in mill_tenders:
            tender_data = dict(tender._mapping)
            
            formatted_dates = format_dates(tender_data)
            tender_data.update(formatted_dates)

            tender_data = convert_decimal_to_float(tender_data)
            
            tenders_data.append(tender_data)

        return jsonify(tenders_data)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500
    
#show all Mill that eTender is not Closed.
@app.route(API_URL + "/get_all_mill_Opentenders", methods=["GET"])
def get_all_mill_Opentenders():
    try:
        sql_query = """
         SELECT 
            mt.*, 
            mill.Ac_Name_E AS mill_name, 
            item.System_Name_E AS item_name, 
            uc.mill_name AS mill_user_name
        FROM 
            dbo.eBuySugar_MillTender mt
        INNER JOIN 
            dbo.nt_1_accountmaster mill ON mt.mc = mill.accoid
        INNER JOIN 
            dbo.qryItemMaster item ON mt.Item_Code = item.System_Code
        INNER JOIN 
            dbo.eBuySugar_UserCreation uc ON mt.MillUserId = uc.user_id where Open_tender_closed='N' order by MillTenderId desc
        """
        
        result = db.session.execute(text(sql_query))
        mill_tenders = result.fetchall()
        
        tenders_data = []
        for tender in mill_tenders:
            tender_data = dict(tender._mapping)
            
            formatted_dates = format_dates(tender_data)
            tender_data.update(formatted_dates)

            tender_data = convert_decimal_to_float(tender_data)
            
            tenders_data.append(tender_data)

        return jsonify(tenders_data)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

# API to get a specific MillTender by MillTenderId
@app.route(API_URL + "/get_mill_tender_by_id", methods=["GET"])
def get_mill_tender_by_id():
    try:
        mill_tender_id = request.args.get('MillTenderId')
        if mill_tender_id is None:
            return jsonify({'error': 'Missing MillTenderId parameter'}), 400

        mill_tender = MillTender.query.get(mill_tender_id)

        if not mill_tender:
            return jsonify({'error': 'MillTender not found'}), 404

        tender_data = {column.key: getattr(mill_tender, column.key) for column in mill_tender.__table__.columns}

        return jsonify(tender_data)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500

# API to create a new MillTender
@app.route(API_URL + "/create_mill_tender", methods=["POST"])
def create_mill_tender():
    try:
        new_tender_data = request.json
        new_mill_tender = MillTender(**new_tender_data)
        db.session.add(new_mill_tender)
        db.session.commit()

        socketio.emit('EtenderData', new_tender_data)

        return jsonify({'message': 'MillTender created successfully', 'MillTender': new_tender_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# API to update an existing MillTender by MillTenderId
@app.route(API_URL + "/update_mill_tender", methods=["PUT"])
def update_mill_tender():
    try:
        mill_tender_id = request.args.get('MillTenderId')
        if mill_tender_id is None:
            return jsonify({'error': 'Missing MillTenderId parameter'}), 400

        mill_tender = MillTender.query.get(mill_tender_id)

        if not mill_tender:
            return jsonify({'error': 'MillTender not found'}), 404

        update_data = request.json
        for key, value in update_data.items():
            setattr(mill_tender, key, value)

        db.session.commit()
        socketio.emit('mill_tender_updated', update_data)
 
        return jsonify({'message': 'MillTender updated successfully', 'MillTender': update_data})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# API to delete a MillTender by MillTenderId
@app.route(API_URL + "/delete_mill_tender", methods=["DELETE"])
def delete_mill_tender():
    try:
        mill_tender_id = request.args.get('MillTenderId')
        if mill_tender_id is None:
            return jsonify({'error': 'Missing MillTenderId parameter'}), 400

        mill_tender = MillTender.query.get(mill_tender_id)

        if not mill_tender:
            return jsonify({'error': 'MillTender not found'}), 404

        db.session.delete(mill_tender)
        db.session.commit()

        socketio.emit('EtenderData', {'message': 'ETender deleted successfully'})

        return jsonify({'message': 'MillTender deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

# API to get a specific MillTender by MillTenderId
@app.route(API_URL + "/getAlldatabyMillTenderId", methods=["GET"])
def getAlldatabyMillTenderId():
    try:
        mill_tender_id = request.args.get('MillTenderId')
        if mill_tender_id is None:
            return jsonify({'error': 'Missing MillTenderId parameter'}), 400

        mill_tender = MillTender.query.get(mill_tender_id)

        if not mill_tender:
            return jsonify({'error': 'MillTender not found'}), 404
        tender_data = {column.key: getattr(mill_tender, column.key) for column in mill_tender.__table__.columns}

        formatted_dates = format_dates(tender_data)
        tender_data.update(formatted_dates)

        tender_data = convert_decimal_to_float(tender_data)

        return jsonify(tender_data), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal server error'}), 500
    
# API to get records from nt_1_systemmaster based on System_Type
@app.route(API_URL + "/get_system_master", methods=["GET"])
def get_system_master():
    try:
        sql_query = """
            SELECT System_Name_E, System_Type FROM dbo.nt_1_systemmaster
        """
        result = db.session.execute(text(sql_query))
        system_master_data = result.fetchall()

        data = []
        for row in system_master_data:
            row_data = dict(row._mapping)  
            data.append(row_data)
        
        return jsonify(data)
    
    except Exception as e:
        print(f"Error fetching system master data: {e}")
        return jsonify({'error': 'Internal server error'}), 500

