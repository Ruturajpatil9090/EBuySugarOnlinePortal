from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from app import app, db,socketio
import os
from app.Models.PublishListModels.PublishListModels import PublishList
from decimal import Decimal
from sqlalchemy import text
from flask_socketio import SocketIO
from datetime import datetime

app.config['SECRET_KEY'] = 'ABCDEFGHIJKLMNOPQRST'
# Get the base URL from environment variables
API_URL = os.getenv('API_URL')

def format_dates(task):
    return {
        "Date": task.Date.strftime('%Y-%m-%d') if task.Date else None,
        "Lifting_date": task.Lifting_date.strftime('%Y-%m-%d') if task.Lifting_date else None,
        "Payment_Date": task.Payment_Date.strftime('%Y-%m-%d') if task.Payment_Date else None,
        "Display_End_Date": task.Display_End_Date.strftime('%Y-%m-%d %H:%M:%S') if task.Display_End_Date else None

    }

@app.route(API_URL + "/getAllDatapublishlist", methods=['GET'])
def getAllDataPublishList():
    try:
        publish_list = PublishList.query.all()
        result = []
        for tender in publish_list:
            # Convert model object to dictionary, excluding metadata
            tender_dict = {key: value for key, value in tender.__dict__.items() if not key.startswith('_')}
            
            # Format dates
            formatted_dates = format_dates(tender)
            tender_dict.update(formatted_dates)
            
            result.append(tender_dict)
            
        return jsonify(result), 200

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

@app.route(API_URL + "/publishlist-tender", methods=['POST'])
def publishlist_tender():
    try:
        rows_to_publish = request.json
        if not rows_to_publish:
            return jsonify({'error': 'No data provided'}), 400

        # Collect publishids to find all records in one query
        publishids = [row_data.get('publishid') for row_data in rows_to_publish]
        existing_tenders = PublishList.query.filter(PublishList.publishid.in_(publishids)).all()
        existing_tenders_dict = {tender.publishid: tender for tender in existing_tenders}

        # Prepare data for bulk update and create new entries
        new_tenders = []
        updates = []

        for row_data in rows_to_publish:
            publishid = row_data.get('publishid')
            tender = existing_tenders_dict.get(publishid)

            if tender:
                # Update existing record
                for key, value in row_data.items():
                    setattr(tender, key, value)
                updates.append(tender)
            else:
                # Create new record
                new_tender = PublishList(
                    Tender_No=row_data.get('Tender_No'),
                    Date=row_data.get('Date'),
                    Mill_Code=row_data.get('Mill_Code'),
                    Grade=row_data.get('Grade'),
                    Season=row_data.get('Season'),
                    DO_Name=row_data.get('DO_Name'),
                    itemcode=row_data.get('itemcode'),
                    Lifting_date=row_data.get('Lifting_date'),
                    Payment_Date=row_data.get('Payment_Date'),
                    Display_End_Date=row_data.get('Display_End_Date'),
                    Mill_Rate=row_data.get('Mill_Rate'),
                    Purchase_Rate=row_data.get('Purchase_Rate'),
                    Display_Qty=row_data.get('Display_Qty'),
                    Sold_Qty=row_data.get('Sold_Qty'),
                    Display_Rate=row_data.get('Display_Rate'),
                    tenderid=row_data.get('tenderid'),
                    Item_Name=row_data.get('Item_Name'),
                    publishid=row_data.get('publishid'),
                    Mill_Name=row_data.get('Mill_Name'),
                    user_id = row_data.get('user_id'),
                    Payment_ToAcCode = row_data.get('Payment_ToAcCode'),
                    Pt_Accoid = row_data.get('Pt_Accoid'),
                    mc = row_data.get('mc'),
                    ic = row_data.get('ic'),
                    Flag="Active"
                )
                new_tenders.append(new_tender)

        # Bulk update and add new records
        db.session.bulk_save_objects(updates)
        db.session.add_all(new_tenders)
        db.session.commit()

        # Emit the published data to all connected clients
        socketio.emit('publishList', rows_to_publish)

        return jsonify({'message': 'Bulk data published successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Update the Publish Tender dynamically
@app.route(API_URL + "/update-publish-tender", methods=['PUT'])
def update_publish_tender():
    try:
        data = request.json
        publishid = data.get('publishid', None)

        if publishid is None:
            return jsonify({'error': 'Publishid parameter is required'}), 400

        tender = PublishList.query.filter_by(publishid=publishid).first()

        if not tender:
            return jsonify({'error': 'Publish tender not found'}), 404

        for key, value in data.items():
            if key == 'Display_End_Date' and value:
                try:
                    # Handle the 'YYYY-MM-DD HH:mm' format and convert to 'YYYY-MM-DD HH:mm:ss'
                    value = datetime.strptime(value, '%Y-%m-%d %H:%M').strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    return jsonify({'error': 'Invalid Display_End_Date format'}), 400
            setattr(tender, key, value)

        db.session.commit()
        socketio.emit('update_data', data)

        return jsonify({'message': 'Publish tender updated successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
# Update Display_Rate by IncreaseRate for all entries
@app.route(API_URL + "/update-display-rate", methods=['PUT'])
def update_display_rate():
    try:
        increase_rate = Decimal(request.args.get('IncreaseRate', type=float))

        if increase_rate is None:
            return jsonify({'error': 'IncreaseRate parameter is required'}), 400

        # Fetch all entries from the database
        publish_list = PublishList.query.all()

        # Update Display_Rate for each entry
        for tender in publish_list:
            tender.Display_Rate = tender.Display_Rate + increase_rate

        db.session.commit()

        # Emit an event to notify all connected clients
        updated_entries = [
            {key: value for key, value in tender.__dict__.items() if not key.startswith('_')}
            for tender in publish_list
        ]
        socketio.emit('update_display_rate', updated_entries)

        return jsonify({'message': f'Display Rate increased by {increase_rate} for all entries'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#delete the Publish Tender
@app.route(API_URL + "/delete-publish-tender", methods=['DELETE'])
def delete_publish_tender():
    try:
        publishid = request.args.get('publishid', type=int)

        if publishid is None:
            return jsonify({'error': 'Publishid parameter is required'}), 400

        tender = PublishList.query.filter_by(publishid=publishid).first()

        if not tender:
            return jsonify({'error': 'Publish tender not found'}), 404

        db.session.delete(tender)
        db.session.commit()

        # Emit the deleted tender data to all connected clients
        socketio.emit('deletePublishTender', {'publishid': publishid})
        
        return jsonify({'message': 'Publish tender deleted successfully'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    

@app.route(API_URL + "/getAllPublishDataList", methods=['GET'])
def getAllPublishDataList():
    try:
        # Start a database transaction
        with db.session.begin_nested():
            query = '''
SELECT        dbo.eBuySugar_PublishList.Tender_No, dbo.eBuySugar_PublishList.Date, dbo.eBuySugar_PublishList.Mill_Code, dbo.eBuySugar_PublishList.Grade, dbo.eBuySugar_PublishList.season AS Season, 
                         paymentto.Ac_Name_E AS DO_Name, dbo.eBuySugar_PublishList.itemcode, dbo.eBuySugar_PublishList.Lifting_date, dbo.eBuySugar_PublishList.Payment_Date, dbo.eBuySugar_PublishList.Display_End_Date, 
                         dbo.eBuySugar_PublishList.Mill_Rate, dbo.eBuySugar_PublishList.Purchase_Rate, dbo.eBuySugar_PublishList.Display_Qty, dbo.eBuySugar_PublishList.tenderid, dbo.eBuySugar_PublishList.publishid, 
                         dbo.eBuySugar_PublishList.user_id, dbo.eBuySugar_PublishList.Payment_ToAcCode, dbo.eBuySugar_PublishList.Pt_Accoid, dbo.eBuySugar_PublishList.mc, ISNULL(SUM(dbo.eBuySugar_OrderList.Buy_Qty), 0) AS sold, 
                         dbo.eBuySugar_PublishList.Display_Qty - ISNULL(SUM(dbo.eBuySugar_OrderList.Buy_Qty), 0) AS balance, dbo.eBuySugar_PublishList.Display_Rate, dbo.eBuySugar_PublishList.Flag, dbo.eBuySugar_PublishList.Item_Name, 
                         mill.Short_Name, mill.Ac_Name_E AS Mill_Name, dbo.eBuySugar_PublishList.ic
FROM            dbo.qryItemMaster INNER JOIN
                         dbo.eBuySugar_PublishList INNER JOIN
                         dbo.nt_1_accountmaster AS mill ON dbo.eBuySugar_PublishList.mc = mill.accoid INNER JOIN
                         dbo.nt_1_accountmaster AS paymentto ON dbo.eBuySugar_PublishList.Pt_Accoid = paymentto.accoid ON dbo.qryItemMaster.System_Code = dbo.eBuySugar_PublishList.itemcode LEFT OUTER JOIN
                         dbo.eBuySugar_OrderList ON dbo.eBuySugar_PublishList.publishid = dbo.eBuySugar_OrderList.publishid
GROUP BY dbo.eBuySugar_PublishList.Tender_No, dbo.eBuySugar_PublishList.Date, dbo.eBuySugar_PublishList.Mill_Code, dbo.eBuySugar_PublishList.Grade, dbo.eBuySugar_PublishList.season, paymentto.Ac_Name_E, 
                         dbo.eBuySugar_PublishList.itemcode, dbo.eBuySugar_PublishList.Lifting_date, dbo.eBuySugar_PublishList.Payment_Date, dbo.eBuySugar_PublishList.Display_End_Date, dbo.eBuySugar_PublishList.Mill_Rate, 
                         dbo.eBuySugar_PublishList.Purchase_Rate, dbo.eBuySugar_PublishList.Display_Qty, dbo.eBuySugar_PublishList.tenderid, dbo.eBuySugar_PublishList.publishid, dbo.eBuySugar_PublishList.user_id, 
                         dbo.eBuySugar_PublishList.Payment_ToAcCode, dbo.eBuySugar_PublishList.Pt_Accoid, dbo.eBuySugar_PublishList.mc, dbo.eBuySugar_PublishList.Display_Rate, dbo.eBuySugar_PublishList.Flag, 
                         dbo.eBuySugar_PublishList.Item_Name, mill.Short_Name, mill.Ac_Name_E, dbo.eBuySugar_PublishList.ic
HAVING        (dbo.eBuySugar_PublishList.Display_Qty - ISNULL(SUM(dbo.eBuySugar_OrderList.Buy_Qty), 0) <> 0)
            '''
            result = db.session.execute(text(query)).fetchall()

        # Prepare response data with date formatting and Decimal conversion
        response = []
        for row in result:
            formatted_row = {
                'Tender_No': row.Tender_No,
                'Date': row.Date.isoformat() if row.Date else None,
                'Mill_Code': row.Mill_Code,
                'Mill_Name': row.Mill_Name,
                'Grade': row.Grade,
                'Season': row.Season,
                'DO_Name': row.DO_Name,
                'itemcode': row.itemcode,
                'Lifting_date': row.Lifting_date.isoformat() if row.Lifting_date else None,
                'Payment_Date': row.Payment_Date.isoformat() if row.Payment_Date else None,
                'Display_End_Date': row.Display_End_Date.isoformat() if row.Display_End_Date else None,
                'Mill_Rate': float(row.Mill_Rate) if row.Mill_Rate is not None else None,
                'Purchase_Rate': float(row.Purchase_Rate) if row.Purchase_Rate is not None else None,
                'Display_Rate': float(row.Display_Rate) if row.Display_Rate is not None else None,
                'Display_Qty': float(row.Display_Qty) if row.Display_Qty is not None else None,
                'tenderid': row.tenderid,
                'publishid': row.publishid,
                'user_id': row.user_id,
                'Payment_ToAcCode': row.Payment_ToAcCode,
                'Pt_Accoid': row.Pt_Accoid,
                'mc': row.mc,
                'sold': float(row.sold) if row.sold is not None else None,
                'balance': float(row.balance) if row.balance is not None else None,
                'Flag': row.Flag,
                'Item_Name': row.Item_Name,
                'ic':row.ic
            }
            response.append(formatted_row)

        db.session.commit()
        
        # Emit the response to all connected clients
        socketio.emit('get_AllTenders', response)

        return jsonify(response)

    except SQLAlchemyError as error:
        # Handle database errors
        print("Error fetching data:", error)
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
#Update the Tender_No and tenderid based on the order placed 
@app.route(API_URL + "/update-tender-info", methods=['PUT'])
def update_tender_info():
    try:
        data = request.json
        publishid = request.args.get('publishid')
        tender_no = data.get('Tender_No')
        tenderid = data.get('tenderid')

        # Check if publishid is provided
        if publishid is None:
            return jsonify({'error': 'Publishid parameter is required'}), 400

        # Fetch the existing tender record
        tender = PublishList.query.filter_by(publishid=publishid).first()

        # Check if the tender record exists
        if not tender:
            return jsonify({'error': 'Publish tender not found'}), 404

        # Update the Tender_No and tenderid in the local database
        tender.Tender_No = tender_no
        tender.tenderid = tenderid

        # Commit the changes to the database
        db.session.commit()

        # Emit the update event to all connected clients
        socketio.emit('update_tender_info', {
            'Tender_No': tender_no,
            'tenderid': tenderid
        })

        return jsonify({'message': 'Tender information updated successfully'}), 200

    except SQLAlchemyError as e:
        # Rollback the session in case of an error
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        # Catch any other exceptions
        return jsonify({'error': str(e)}), 500


    

