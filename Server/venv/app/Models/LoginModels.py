from app import db

class UserLogin(db.Model):
    __tablename__ = 'eBuySugar_UserCreation'
    
    user_id = db.Column(db.Integer, primary_key=True)
    phone_no = db.Column(db.String(20), unique=True)
    user_type = db.Column(db.Integer)
    otp = db.Column(db.String(30))
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    menu_add_resell = db.Column(db.Integer)
    ac_code = db.Column(db.Integer)
    accoid = db.Column(db.Integer,autoincrement = True)



