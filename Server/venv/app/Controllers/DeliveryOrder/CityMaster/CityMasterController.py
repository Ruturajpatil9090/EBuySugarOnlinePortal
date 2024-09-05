# app/routes/group_routes.py
from flask import jsonify, request
from app import app, db
from app.Models.DeliverOrderModels.CityMaster.CityMasterModels import CityMaster
import os
# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# API to check if city exists by name, and if not, create it
@app.route(API_URL + "/getcreatecity", methods=["POST"])
def get_or_create_city():
    try:
        # Extract required parameters
        company_code = request.json.get('company_code')
        city_name_e = request.json.get('city_name_e')
        pincode = request.json.get('pincode')
        state = request.json.get('state')


        # Validate the input parameters
        if not company_code or not city_name_e:
            return jsonify({'error': 'Missing Company_Code or city_name_e parameter'}), 400

        try:
            company_code = int(company_code)
        except ValueError:
            return jsonify({'error': 'Invalid Company_Code parameter'}), 400

        # Check if the city already exists
        existing_city = CityMaster.query.filter_by(company_code=company_code, city_name_e=city_name_e).first()

        if existing_city:
            # If city exists, return the city id
            return jsonify({
                'message': 'City found',
                'cityid': existing_city.cityid,
                'city_code': existing_city.city_code,
                'city_name_e': existing_city.city_name_e
            }), 200
        else:
            # If city does not exist, create it
            # Fetch the maximum city_code for the given Company_Code
            max_city_code = db.session.query(db.func.max(CityMaster.city_code)).filter_by(company_code=company_code).scalar() or 0

            # Create a new CityMaster entry
            new_city = CityMaster(
                city_code=max_city_code + 1,
                city_name_e=city_name_e,
                company_code=company_code,
                state = state,
                pincode = pincode
            )

            db.session.add(new_city)
            db.session.commit()

            return jsonify({
                'message': 'City created successfully',
                'cityid': new_city.cityid,
                'city_code': new_city.city_code,
                'city_name_e': new_city.city_name_e,
                "state":state,
                "pincode":pincode
            }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500