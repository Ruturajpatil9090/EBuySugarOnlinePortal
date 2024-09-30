from flask import jsonify, request
from app import app, db, socketio
from app.Models.ETender.Bidding.ETenderBiddingModels import ETenderBid
from flask_cors import CORS
import os
from sqlalchemy import text
from decimal import Decimal

CORS(app, cors_allowed_origins="*")

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# API to create a new ETenderBid
@app.route(API_URL + "/create_e_tender_bid", methods=["POST"])
def create_e_tender_bid():
    try:
        new_bid_data = request.json
        
        # Extract UserId and MillTenderId from the new bid data
        user_id = new_bid_data.get('UserId')
        mill_tender_id = new_bid_data.get('MillTenderId')
        
        # Check if the user has already bid 5 times for this particular MillTenderId
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



# # API to get all ETenderBids
# @app.route(API_URL + "/get_all_e_tender_bids", methods=["GET"])
# def get_all_e_tender_bids():
#     try:
#         bids = ETenderBid.query.all()
#         bids_data = []

#         for bid in bids:
#             bid_data = {column.key: getattr(bid, column.key) for column in bid.__table__.columns}
#             bids_data.append(bid_data)

#         return jsonify(bids_data)
#     except Exception as e:
#         print(e)
#         return jsonify({'error': 'Internal server error'}), 500

# # API to get a specific ETenderBid by ETenderBidId
# @app.route(API_URL + "/get_e_tender_bid_by_id", methods=["GET"])
# def get_e_tender_bid_by_id():
#     try:
#         etender_bid_id = request.args.get('ETenderBidId')
#         if etender_bid_id is None:
#             return jsonify({'error': 'Missing ETenderBidId parameter'}), 400

#         etender_bid = ETenderBid.query.get(etender_bid_id)

#         if not etender_bid:
#             return jsonify({'error': 'ETenderBid not found'}), 404

#         bid_data = {column.key: getattr(etender_bid, column.key) for column in etender_bid.__table__.columns}

#         return jsonify(bid_data)
#     except Exception as e:
#         print(e)
#         return jsonify({'error': 'Internal server error'}), 500
