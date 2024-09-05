from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.Models.DeliverOrderModels.AccountMasterModels.AccountMasterModel import AccountMaster,AccountContact

class AccountMasterSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AccountMaster
        include_relationships = True

class AccountContactSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AccountContact
        include_relationships = True
