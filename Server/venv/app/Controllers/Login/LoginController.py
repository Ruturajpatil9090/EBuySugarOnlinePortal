from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app import app
from app.Models.LoginModels import UserLogin 
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# API route for user login
@app.route(API_URL+'/check-phone', methods=['POST'])
def login():
    login_data = request.json
    if not login_data:
        return jsonify({'error': 'No data provided'}), 400
    phone_no = login_data.get('phone_no')
    if not phone_no :
        return jsonify({'error': 'Phone No are required!'}), 400

    # Check if user exists
    user = UserLogin.query.filter_by(phone_no=phone_no).first() 
    if not user:
        return jsonify({'error': 'Invalid Login Credentials'}), 401

    # User authenticated successfully
    user_data = user.__dict__
    # Remove unnecessary keys
    user_data.pop('_sa_instance_state', None)
    user_data.pop('Password', None)  
    # Generate JWT token
    access_token = create_access_token(identity=phone_no)
    # Return user data and JWT token in the response
    return jsonify({'message': 'Login successful', 'user_data': user_data, 'access_token': access_token}), 200

#Verify OTP API
@app.route(API_URL + '/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    phone_no = data.get('phone_no')
    otp = data.get('otp')

    if not phone_no or not otp:
        return jsonify({'error': 'Phone number and OTP are required'}), 400
    # Query user by phone number and OTP
    user = UserLogin.query.filter_by(phone_no=phone_no, otp=otp).first()

    if not user:
        return jsonify({'error': 'Invalid OTP'}), 401

    # OTP verified successfully
    return jsonify({'message': 'OTP verified successfully'}), 200
