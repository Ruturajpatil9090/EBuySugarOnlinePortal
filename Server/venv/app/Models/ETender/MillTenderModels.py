from app import db
from sqlalchemy import func

class MillTender(db.Model):
    __tablename__ = 'eBuySugar_MillTender'
    
    MillTenderId = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Mill_Code = db.Column(db.Integer, nullable=False)
    mc = db.Column(db.Integer, nullable=False)
    Item_Code = db.Column(db.Integer, nullable=False)
    ic = db.Column(db.Integer, nullable=False)
    Delivery_From = db.Column(db.String(255), nullable=True)
    Start_Date = db.Column(db.Date, nullable=True)
    Start_Time = db.Column(db.Time, nullable=True)
    End_Date = db.Column(db.Date, nullable=True)
    Last_Dateof_Payment = db.Column(db.Date, nullable=True)
    End_Time = db.Column(db.Time, nullable=True)
    Lifting_Date = db.Column(db.Date, nullable=True)
    Season = db.Column(db.String(255), nullable=True)
    Packing = db.Column(db.Integer, nullable=True)
    Quantity = db.Column(db.Integer, nullable=True)
    Quantity_In = db.Column(db.String(50), nullable=True)
    Sugar_Type = db.Column(db.String(50), nullable=True)
    Grade = db.Column(db.String(50), nullable=True)
    Base_Rate = db.Column(db.Integer, nullable=True)
    Base_Rate_GST_Perc = db.Column(db.Numeric(18, 2), nullable=True)
    Base_Rate_GST_Amount = db.Column(db.Numeric(18, 2), nullable=True)
    Rate_Including_GST = db.Column(db.Numeric(18, 2), nullable=True)
    UserId = db.Column(db.Integer, nullable=True)
    Open_Base_Rate = db.Column(db.Numeric(18, 2), nullable=True)
    Open_Base_Rate_GST_Perc = db.Column(db.Numeric(18, 2), nullable=True)
    Open_Base_Rate_GST_Amount = db.Column(db.Numeric(18, 2), nullable=True)
    Open_Rate_Including_GST = db.Column(db.Numeric(18, 2), nullable=True)
    MillUserId = db.Column(db.Integer, nullable=True)
    Tender_Closed = db.Column(db.String(1), nullable=True)
    Open_tender_closed = db.Column(db.String(1), nullable=True)
    Tender_Type = db.Column(db.String(1), nullable=True)
    
    # Automatically set timestamp when a record is created
    Created_Date = db.Column(db.DateTime, default=func.now())
    
    # Automatically update timestamp when a record is updated
    Modified_Date = db.Column(db.DateTime, default=func.now(), onupdate=func.now())
