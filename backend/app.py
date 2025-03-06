from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    icon = db.Column(db.String(200))
    expenses = db.relationship('Expense', backref='category_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon
        }

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'amount': self.amount,
            'category': self.category_rel.name,
            'category_id': self.category_id,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'date': self.date.strftime('%d %b %Y'),
            'icon': self.category_rel.icon
        }

# Default category icons
category_icons = {
    'Electronics': 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png',
    'Transportation': 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png',
    'Shopping': 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png',
    'Food': 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png',
    'Entertainment': 'https://cdn-icons-png.flaticon.com/512/3227/3227053.png',
    'Health': 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
    'Education': 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png',
    'Bills': 'https://cdn-icons-png.flaticon.com/512/1802/1802979.png',
    'Other': 'https://cdn-icons-png.flaticon.com/512/3126/3126647.png'
}

# Create database tables and add default categories
with app.app_context():
    # Drop all tables first
    db.drop_all()
    # Create all tables fresh
    db.create_all()
    
    print("Database tables created successfully")
    
    # Add default categories
    for category_name, icon in category_icons.items():
        category = Category(name=category_name, icon=icon)
        db.session.add(category)
    
    try:
        db.session.commit()
        print(f"Added {len(category_icons)} default categories")
    except Exception as e:
        print(f"Error adding default categories: {str(e)}")
        db.session.rollback()

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.order_by(Expense.date.desc()).all()
    return jsonify([expense.to_dict() for expense in expenses])

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.json
        print("Received data:", data)  # Debug print
        
        # Get category
        category_name = data.get('category')
        if not category_name:
            return jsonify({'error': 'Category is required'}), 400
            
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            return jsonify({'error': f'Category {category_name} not found'}), 400

        # Validate required fields
        if not data.get('name') or not data.get('amount'):
            return jsonify({'error': 'Name and amount are required'}), 400

        new_expense = Expense(
            name=data['name'],
            amount=float(data['amount']),
            category_id=category.id,
            currency=data.get('currency', 'CAD ($)'),
            payment_method=data.get('payment_method', 'Physical Cash')
        )
        
        db.session.add(new_expense)
        db.session.commit()
        
        return jsonify(new_expense.to_dict()), 201
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': 'Invalid amount format'}), 400
    except Exception as e:
        print("Error:", str(e))  # Debug print
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{
        'id': cat.id,
        'name': cat.name,
        'icon': cat.icon
    } for cat in categories])

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
        
    # Check if category already exists
    if Category.query.filter_by(name=name).first():
        return jsonify({'error': 'Category already exists'}), 400
    
    # Use default icon or a generic one
    icon = category_icons.get(name, 'https://cdn-icons-png.flaticon.com/512/3126/3126647.png')
    
    try:
        category = Category(name=name, icon=icon)
        db.session.add(category)
        db.session.commit()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    
    db.session.add(new_expense)
    db.session.commit()
    
    return jsonify(new_expense.to_dict()), 201

@app.route('/api/balance', methods=['GET'])
def get_balance():
    expenses = Expense.query.all()
    total = sum(expense.amount for expense in expenses)
    return jsonify({'balance': 112908 - total})  # Starting with a fixed initial balance

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    data = request.json
    
    expense.name = data.get('name', expense.name)
    expense.amount = float(data.get('amount', expense.amount))
    expense.category = data.get('category', expense.category)
    expense.currency = data.get('currency', expense.currency)
    expense.payment_method = data.get('payment_method', expense.payment_method)
    
    db.session.commit()
    return jsonify(expense.to_dict())

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
