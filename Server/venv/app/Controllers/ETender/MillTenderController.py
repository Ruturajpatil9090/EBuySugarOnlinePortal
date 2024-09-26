from flask import jsonify, request
from app import app, db
from app.Models.ETender.MillTenderModels import MillTender
from flask_cors import CORS
import os

CORS(app, cors_allowed_origins="*")

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

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


# API to get all MillTenders
@app.route(API_URL + "/get_all_mill_tenders", methods=["GET"])
def get_all_mill_tenders():
    try:
        mill_tenders = MillTender.query.all()
        tenders_data = []
        for tender in mill_tenders:
            tender_data = {column.key: getattr(tender, column.key) for column in tender.__table__.columns}
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

        return jsonify({'message': 'MillTender deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
