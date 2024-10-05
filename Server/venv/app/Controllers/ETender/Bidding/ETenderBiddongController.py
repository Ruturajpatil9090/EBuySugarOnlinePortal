from flask import jsonify, request
from app import app, db, socketio
from app.Models.ETender.Bidding.ETenderBiddingModels import ETenderBid
from flask_cors import CORS
import os
from sqlalchemy import text
from datetime import time

CORS(app, cors_allowed_origins="*")

API_URL = os.getenv('API_URL')

# API to create a new ETenderBid
@app.route(API_URL + "/create_e_tender_bid", methods=["POST"])
def create_e_tender_bid():
    try:
        new_bid_data = request.json
        
        user_id = new_bid_data.get('UserId')
        mill_tender_id = new_bid_data.get('MillTenderId')
        
        bid_count = db.session.query(db.func.count(ETenderBid.ETenderBidId)) \
            .filter(ETenderBid.UserId == user_id, ETenderBid.MillTenderId == mill_tender_id) \
            .scalar()

        if bid_count >= 5:
            return jsonify({'error': 'Your Limit is Exceeds'}), 403

        # Create a new ETenderBid instance using unpacking
        new_bid = ETenderBid(**new_bid_data)
        
        db.session.add(new_bid)
        db.session.commit()

        # Emit data to all connected clients via Socket.IO
        socketio.emit('ETenderBidData', new_bid_data)

        return jsonify({'message': 'ETenderBid created successfully', 'ETenderBids': new_bid_data}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
#fetch All Bidding ETenders 
@app.route(API_URL + "/get_e_tender_bids", methods=["GET"])
def get_e_tender_bids():
    try:
        mill_tender_id = request.args.get('MillTenderId')

        if not mill_tender_id:
            return jsonify({'error': 'MillTenderId is required'}), 400

        query = text("""
        SELECT        dbo.eBuySugar_ETenderBidding.BidQuantity, dbo.eBuySugar_ETenderBidding.BidRate, dbo.eBuySugar_UserCreation.first_name AS bidder, mill.mill_name AS seller, dbo.eBuySugar_MillTender.MillTenderId, 
                         dbo.eBuySugar_MillTender.Mill_Code, dbo.eBuySugar_MillTender.mc, dbo.eBuySugar_MillTender.Item_Code, dbo.eBuySugar_MillTender.ic, dbo.eBuySugar_MillTender.Delivery_From, dbo.eBuySugar_MillTender.Start_Date, 
                         dbo.eBuySugar_MillTender.Start_Time, dbo.eBuySugar_MillTender.End_Date, dbo.eBuySugar_MillTender.End_Time, dbo.eBuySugar_MillTender.Lifting_Date, dbo.eBuySugar_MillTender.Season, 
                         dbo.eBuySugar_MillTender.Packing, dbo.eBuySugar_MillTender.Quantity, dbo.eBuySugar_MillTender.Quantity_In, dbo.eBuySugar_MillTender.Sugar_Type, dbo.eBuySugar_MillTender.Grade, 
                         dbo.eBuySugar_MillTender.Base_Rate, dbo.eBuySugar_MillTender.Base_Rate_GST_Perc, dbo.eBuySugar_MillTender.Base_Rate_GST_Amount, dbo.eBuySugar_MillTender.Rate_Including_GST, 
                         dbo.eBuySugar_MillTender.UserId, dbo.eBuySugar_MillTender.Created_Date, dbo.eBuySugar_MillTender.Modified_Date, dbo.eBuySugar_MillTender.Tender_Type, dbo.eBuySugar_MillTender.Open_Base_Rate, 
                         dbo.eBuySugar_MillTender.Open_Base_Rate_GST_Perc, dbo.eBuySugar_MillTender.Open_Base_Rate_GST_Amount, dbo.eBuySugar_MillTender.Open_Rate_Including_GST, dbo.eBuySugar_MillTender.Last_Dateof_Payment, 
                         dbo.eBuySugar_MillTender.MillUserId, dbo.eBuySugar_MillTender.Tender_Closed, dbo.eBuySugar_MillTender.Open_tender_closed, dbo.eBuySugar_ETenderBidding.ETenderBidId
FROM            dbo.eBuySugar_MillTender INNER JOIN
                         dbo.eBuySugar_ETenderBidding ON dbo.eBuySugar_MillTender.MillTenderId = dbo.eBuySugar_ETenderBidding.MillTenderId INNER JOIN
                         dbo.eBuySugar_UserCreation AS mill ON dbo.eBuySugar_MillTender.MillUserId = mill.user_id INNER JOIN
                         dbo.eBuySugar_UserCreation ON dbo.eBuySugar_ETenderBidding.UserId = dbo.eBuySugar_UserCreation.user_id
            WHERE dbo.eBuySugar_ETenderBidding.MillTenderId = :mill_tender_id
        """)

        result = db.session.execute(query, {'mill_tender_id': mill_tender_id})
        rows = result.fetchall()
        column_names = result.keys()

        if not rows:
            return jsonify({'message': 'No records found for this MillTenderId'}), 404

        bids = []
        for row in rows:
            bid = dict(zip(column_names, row))
            
            for key, value in bid.items():
                if isinstance(value, time):
                    bid[key] = value.strftime('%H:%M:%S')  

            bids.append(bid)

        return jsonify({'ETenderBids': bids}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# API to update existing ETenderBid
@app.route(API_URL + "/update_e_tender_bid", methods=["PUT"])
def update_e_tender_bid():
    try:
        update_data = request.json 

        for bid in update_data:
            etender_bid_id = bid.get('ETenderBidId')
            issued_quantity = bid.get('IssuedQuantity')
            issued_rate = bid.get('IssuedRate')
            
            existing_bid = ETenderBid.query.get(etender_bid_id)
            if existing_bid:
                existing_bid.Issued_Qty = issued_quantity
                existing_bid.Issued_Rate = issued_rate
                db.session.commit() 

                # Emit updated bid information to all connected clients
                socketio.emit('ETenderBidUpdated', {'ETenderBidId': etender_bid_id, 'IssuedQuantity': issued_quantity, 'IssuedRate': issued_rate})

        return jsonify({'message': 'ETenderBids updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route(API_URL + "/updateCloseetender_e_tender_bid", methods=["PUT"])
def updateCloseetender_e_tender_bid():
    try:
        update_data = request.json 
        print(f"Received data: {update_data}") 

        for bid in update_data:
            etender_bid_id = bid.get('ETenderBidId')
            issued_quantity = bid.get('IssuedQuantity')
            issued_rate = bid.get('IssuedRate')
            mill_tender_id = bid.get('MillTenderId')

            # Update ETenderBid table
            existing_bid = ETenderBid.query.get(etender_bid_id)
            if existing_bid:
                existing_bid.Issued_Qty = issued_quantity
                existing_bid.Issued_Rate = issued_rate
                db.session.commit()

            # Execute raw SQL to update eBuySugar_MillTender table
            if mill_tender_id:  # Make sure MillTenderId is available
                print(f"Updating MillTenderId: {mill_tender_id}")  # Debugging info
                sql = text("""
                    UPDATE eBuySugar_MillTender
                    SET Tender_Closed = 'Y'
                    WHERE MillTenderId = :mill_tender_id
                """)
                db.session.execute(sql, {'mill_tender_id': mill_tender_id})
                db.session.commit()

                # Emit a notification about closing the tender to all connected clients
                socketio.emit('MillTenderClosed', {'MillTenderId': mill_tender_id})

        return jsonify({'message': 'ETenderBids and MillTender updated successfully'}), 200

    except Exception as e:
        db.session.rollback()  # Rollback any transaction in case of error
        print(f"Error: {str(e)}")  # Print the error
        return jsonify({'error': str(e)}), 500



