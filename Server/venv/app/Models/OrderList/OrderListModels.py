from app import db

class OrderList(db.Model):
    __tablename__ = 'eBuySugar_OrderList'
    
    Order_Date = db.Column(db.Date, nullable=False)
    Buy_Qty = db.Column(db.Numeric(18, 2), nullable=False)
    Buy_Rate = db.Column(db.Numeric(18, 2), nullable=False)
    publishid = db.Column(db.Integer, nullable=False)
    tenderid = db.Column(db.Integer, nullable=False)
    orderid = db.Column(db.Integer, primary_key=True)
    tenderdetailid = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer)