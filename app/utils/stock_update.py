from sqlalchemy.orm import Session
from app.models.product import Product
from uuid import UUID


def update_stock_levels(db: Session, product_id: UUID, quantity: int) -> None:
    """
    Update product stock levels after a stock move is created.
    
    Args:
        db: Database session
        product_id: UUID of the product
        quantity: Quantity to add/subtract
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        product.current_stock += quantity
        db.commit()
