from app import db

class ETenderBid(db.Model):
    __tablename__ = 'eBuySugar_ETenderBidding'

    ETenderBidId = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    MillTenderId = db.Column(db.Integer, nullable=False)  
    MillUserId = db.Column(db.Integer, nullable=False)  
    UserId = db.Column(db.Integer, nullable=False)     
    BidQuantity = db.Column(db.Numeric(18, 2), nullable=False)  
    BidRate = db.Column(db.Numeric(18, 2), nullable=False)       
    Issued_Qty = db.Column(db.Numeric(18, 2))                
    Issued_Rate = db.Column(db.Numeric(18, 2))              


