from flask import request, jsonify
from app import app, db
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text  # Import text function for raw SQL
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

# API route to get the list of companies
@app.route(API_URL + "/companieslist", methods=['GET'])
def get_companies():
    try:
        # Define the raw SQL query using text()
        sql_query = text("SELECT user_id, company_name,Mill_short_name,accoid,ac_code FROM eBuySugar_UserCreation WHERE user_type = 2 AND accoid IS NOT NULL")

        # Execute the query
        result = db.session.execute(sql_query).fetchall()

        # Convert the result to a list of dictionaries
        companies = [{'user_id': row[0], 'company_name': row[1],'Mill_short_name': row[2], 'accoid': row[3],'ac_code': row[4]} for row in result]

        return jsonify(companies), 200

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500
    

# API route to get the list of companies
@app.route(API_URL + "/userlist", methods=['GET'])
def userlist():
    try:
        # Define the raw SQL query using text()
        sql_query = text("SELECT user_id, company_name, Mill_short_name, accoid, ac_code "
                         "FROM eBuySugar_UserCreation WHERE user_type = 1 AND accoid IS NOT NULL")

        # Execute the query
        result = db.session.execute(sql_query).fetchall()

        # Convert the result to a list of dictionaries
        companies = [{'user_id': row[0], 'user_name': row[1], 'Mill_short_name': row[2], 'accoid': row[3], 'ac_code': row[4]} for row in result]

        return jsonify(companies), 200

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500