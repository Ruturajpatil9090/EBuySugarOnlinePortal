# from flask import Flask, request, jsonify
# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy.exc import SQLAlchemyError
# from app import app, db,socketio
# import os
# from app.Models.DeliverOrderModels.DeliveryOrderModels import PendingDO
# from decimal import Decimal
# from sqlalchemy import text
# from flask_socketio import SocketIO
# from datetime import datetime

# # Get the base URL from environment variables
# API_URL = os.getenv('API_URL')  

# # Define the API route
# @app.route(API_URL+"/checkOrderStatus", methods=['GET'])
# def check_order_status():
#     order_id = request.args.get('order_id')

#     if not order_id:
#         return jsonify({"error": "order_id is required"}), 400

#     try:
#         # Step 1: Check in the OrderList table
#         orderlist_query = '''
#             SELECT COUNT(*) as count FROM dbo.eBuySugar_OrderList WHERE orderid = :order_id
#         '''
#         orderlist_result = db.session.execute(text(orderlist_query), {'order_id': order_id}).fetchone()
#         is_in_orderlist = orderlist_result.count > 0

#         # Step 2: Check in the PendingDO table
#         pendingdo_query = '''
#             SELECT COUNT(*) as count FROM dbo.eBuySugar_Pending_DO WHERE orderid = :order_id
#         '''
#         pendingdo_result = db.session.execute(text(pendingdo_query), {'order_id': order_id}).fetchone()
#         is_in_pendingdo = pendingdo_result.count > 0

#         # Step 3: Check in the DeliveryOrder table (doid != 0)
#         deliveryorder_query = '''
#             SELECT COUNT(*) as count FROM dbo.nt_1_deliveryorder WHERE orderid = :order_id AND doid != 0
#         '''
#         deliveryorder_result = db.session.execute(text(deliveryorder_query), {'order_id': order_id}).fetchone()
#         is_in_deliveryorder = deliveryorder_result.count > 0

#         # Step 3: Check in the DeliveryOrder table (doid != 0)
#         deliveryorder_query = '''
#             SELECT COUNT(*) as count FROM dbo.nt_1_deliveryorder WHERE orderid = :order_id AND doid != 0 AND SB_No !=0
#         '''
#         deliveryorder_result = db.session.execute(text(deliveryorder_query), {'order_id': order_id}).fetchone()
#         is_In_SaleBill = deliveryorder_result.count > 0

#         # Compile the response with true/false values for each check
#         response = {
#             'OrderList': is_in_orderlist,
#             'PendingDO': is_in_pendingdo,
#             'DeliveryOrder': is_in_deliveryorder,
#             'SaleBill': is_In_SaleBill
#         }

#         return jsonify(response), 200

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": "An error occurred while processing your request."}), 500


