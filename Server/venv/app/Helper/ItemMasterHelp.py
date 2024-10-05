from flask import jsonify
from app import app, db 
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
import os

# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

@app.route(API_URL + '/systemmaster', methods=['GET'])
def system_master():
    try:
        # Start a database transaction
        with db.session.begin_nested():
            query = db.session.execute(text('''
                select * from nt_1_systemmaster where System_Type='I'
            '''))

            result = query.fetchall()

        response = []
        for row in result:
            response.append({
                'System_Code': row.System_Code,
                'System_Name_E': row.System_Name_E,
                'systemid': row.systemid,
                'minRate': row.minRate,
                'maxRate': row.maxRate,
               
            })

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500


