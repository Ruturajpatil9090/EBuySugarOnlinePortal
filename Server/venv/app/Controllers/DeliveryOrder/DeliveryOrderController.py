from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from app import app, db,socketio
import os
from app.Models.DeliverOrderModels.DeliveryOrderModels import PendingDO
from decimal import Decimal
from sqlalchemy import text
from flask_socketio import SocketIO
from datetime import datetime

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

def format_dates(task):
    return {
        "Date": task.Date.strftime('%Y-%m-%d') if task.Date else None,
        "Lifting_date": task.Lifting_date.strftime('%Y-%m-%d') if task.Lifting_date else None,
        "Payment_Date": task.Payment_Date.strftime('%Y-%m-%d') if task.Payment_Date else None,
        "Display_End_Date": task.Display_End_Date.strftime('%Y-%m-%d %H:%M:%S') if task.Display_End_Date else None

    }

@app.route(API_URL+ "/orderlist", methods=['GET'])
def get_order_list():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id parameter is required"}), 400

    try:
        # Start a database transaction
        with db.session.begin_nested():
            query = '''
            SELECT
                dbo.eBuySugar_OrderList.user_id,
                dbo.eBuySugar_OrderList.tenderid,
                dbo.qrytenderhead.millname,
                dbo.qrytenderhead.millgstno,
                dbo.qrytenderhead.Grade,
                dbo.qrytenderhead.Lifting_Date,
                dbo.qrytenderhead.Packing,
                dbo.eBuySugar_OrderList.Buy_Qty,
                dbo.eBuySugar_OrderList.Buy_Rate,
                SUM(ISNULL(dbo.eBuySugar_Pending_DO.do_qntl, 0) + ISNULL(dbo.eBuySugar_Pending_DO.adjust_do_qntl, 0)) AS Lifted_qntl,
                dbo.eBuySugar_OrderList.Buy_Qty - SUM(ISNULL(dbo.eBuySugar_Pending_DO.do_qntl, 0) + ISNULL(dbo.eBuySugar_Pending_DO.adjust_do_qntl, 0)) AS Pending_qntl,
                dbo.qrytenderhead.season,
                dbo.eBuySugar_OrderList.orderid,dbo.eBuySugar_OrderList.tenderdetailid
            FROM
                dbo.eBuySugar_OrderList
            INNER JOIN
                dbo.qrytenderhead ON dbo.eBuySugar_OrderList.tenderid = dbo.qrytenderhead.tenderid
            LEFT OUTER JOIN
                dbo.eBuySugar_Pending_DO ON dbo.eBuySugar_OrderList.orderid = dbo.eBuySugar_Pending_DO.orderid
            WHERE
                dbo.eBuySugar_OrderList.user_id = :user_id
            GROUP BY
                dbo.eBuySugar_OrderList.user_id,
                dbo.eBuySugar_OrderList.tenderid,
                dbo.qrytenderhead.millname,
                dbo.qrytenderhead.millgstno,
                dbo.qrytenderhead.Grade,
                dbo.qrytenderhead.Lifting_Date,
                dbo.qrytenderhead.Packing,
                dbo.eBuySugar_OrderList.Buy_Qty,
                dbo.eBuySugar_OrderList.Buy_Rate,
                dbo.qrytenderhead.season,
                dbo.eBuySugar_OrderList.orderid,
                dbo.eBuySugar_OrderList.tenderdetailid
            '''

            result = db.session.execute(text(query), {'user_id': user_id}).fetchall()

        # Prepare response data with date formatting and Decimal conversion
        response = []
        for row in result:
            formatted_row = {
                'user_id': row.user_id,
                'tenderid': row.tenderid,
                'tenderdetailid': row.tenderdetailid,
                'millname': row.millname,
                'millgstno': row.millgstno,
                'Grade': row.Grade,
                'Lifting_Date': row.Lifting_Date.isoformat() if row.Lifting_Date else None,
                'Packing': row.Packing,
                'Buy_Qty': float(row.Buy_Qty) if row.Buy_Qty is not None else None,
                'Buy_Rate': float(row.Buy_Rate) if row.Buy_Rate is not None else None,
                'Lifted_qntl': float(row.Lifted_qntl) if row.Lifted_qntl is not None else None,
                'Pending_qntl': float(row.Pending_qntl) if row.Pending_qntl is not None else None,
                'season': row.season,
                'orderid': row.orderid
            }
            response.append(formatted_row)

        db.session.commit()
        
        # Emit the response to all connected clients
        socketio.emit('get_order_list', response)

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
#GET all account information from the account master
@app.route(API_URL + "/gstaccountinfo", methods=['GET'])
def gstaccountinfo():
    gst_no = request.args.get('GST_No')
    if not gst_no:
        return jsonify({"error": "GST_No parameter is required"}), 400

    try:
        # Start a database transaction
        with db.session.begin_nested():
            query = '''
            SELECT
                dbo.nt_1_accountmaster.Ac_Code,
                dbo.nt_1_accountmaster.Ac_Name_E,
                dbo.nt_1_accountmaster.Address_E,
                dbo.nt_1_citymaster.city_name_e,
                dbo.nt_1_citymaster.pincode,
                dbo.nt_1_citymaster.state
            FROM
                dbo.nt_1_accountmaster
            LEFT OUTER JOIN
                dbo.nt_1_citymaster ON dbo.nt_1_accountmaster.cityid = dbo.nt_1_citymaster.cityid
            WHERE
                dbo.nt_1_accountmaster.Gst_No = :gst_no
            '''

            result = db.session.execute(text(query), {'gst_no': gst_no}).fetchall()

        # Prepare response data
        response = []
        for row in result:
            formatted_row = {
                'Ac_Code':row.Ac_Code,
                'Ac_Name_E': row.Ac_Name_E,
                'Address_E': row.Address_E,
                'city_name_e': row.city_name_e,
                'pincode': row.pincode,
                'state': row.state
            }
            response.append(formatted_row)

        db.session.commit()

        # Emit the response to all connected clients (if needed)
        socketio.emit('get_account_info', response)

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    

#Post the all information to the database
@app.route(API_URL + "/savePendingDO", methods=['POST'])
def save_pending_do():
    try:
        # Extract data from the request JSON
        data = request.json
        if not data:
            return jsonify({"error": "Invalid input data"}), 400

        # Create a new PendingDO object with the data from the request
        pending_do = PendingDO(**data)

        # Start a database transaction and add the new PendingDO to the session
        db.session.add(pending_do)
        db.session.commit()

        # Emit the newly added data to all connected clients (if needed)
        socketio.emit('pending_do_saved', data)

        return jsonify({"message": "Pending DO saved successfully"}), 201

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error saving data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

    except Exception as e:
        # Handle other errors
        print("Unexpected error:", e)
        return jsonify({'error': 'An unexpected error occurred'}), 500


