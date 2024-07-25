from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__, static_url_path='/static')
modelt = pickle.load(open('carpricen.sav', 'rb'))

car_data = pd.read_csv('data/unique_models.csv')  # Load car data from CSV

# Define mappings for ordinal encoding
Name_mapping = {'Maruti': 1, 'Skoda': 2, 'Honda': 3, 'Hyundai': 4, 'Toyota': 5, 'Ford': 6, 'Renault': 7,
                'Mahindra': 8, 'Tata': 9, 'Chevrolet': 10, 'Datsun': 11, 'Jeep': 12, 'Mercedes': 13,
                'Mitsubishi': 14, 'Audi': 15, 'Volkswagen': 16, 'BMW': 17, 'Nissan': 18, 'Lexus': 19,
                'Jaguar': 20, 'Land': 21, 'MG': 22, 'Volvo': 23, 'Daewoo': 24, 'Kia': 25, 'Fiat': 26,
                'Force': 27, 'Ambassador': 28, 'Ashok': 29, 'Isuzu': 30, 'Opel': 31}
Fuel_mapping = {'Diesel': 1, 'Petrol': 2, 'LPG': 3, 'CNG': 4}
Seller_type_mapping = {'Individual': 1, 'Dealer': 2, 'Trustmark Dealer': 3}
Transmission_mapping = {'Manual': 1, 'Automatic': 2}
Owner_mapping = {'First Owner': 1, 'Second Owner': 2, 'Third Owner': 3,
                 'Fourth & Above Owner': 4, 'Test Drive Car': 5}

def perform_ordinal_encoding(name, fuel, seller_type, transmission, owner):
    # Perform ordinal encoding based on mappings
    encoded_name = Name_mapping.get(name, 0)
    encoded_fuel = Fuel_mapping.get(fuel, 0)
    encoded_seller_type = Seller_type_mapping.get(seller_type, 0)
    encoded_transmission = Transmission_mapping.get(transmission, 0)
    encoded_owner = Owner_mapping.get(owner, 0)
    return encoded_name, encoded_fuel, encoded_seller_type, encoded_transmission, encoded_owner

@app.route('/')
def home():
    return render_template('index.html', prediction=None)

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        # Get input values from the form
        name = request.form['brand-name']
        year = float(request.form['year'])
        km_driven = float(request.form['kilometers-driven'])
        fuel = request.form['fuel-type']
        seller_type = request.form['seller-type']
        transmission = 'manual'
        owner = request.form['owner']
        mileage = float(request.form['mileage'])
        engine = float(request.form['engine'])
        seats = float(request.form['seats'])

        # Perform ordinal encoding
        encoded_name, encoded_fuel, encoded_seller_type, encoded_transmission, encoded_owner = perform_ordinal_encoding(name, fuel, seller_type, transmission, owner)

        # Predict using the model
        result = modelt.predict([[encoded_name, year, km_driven, encoded_fuel, encoded_seller_type, encoded_transmission, encoded_owner, mileage, engine, seats]])
       
        # Pass the prediction to the template
        return render_template('res.html', prediction=result[0])
    else:
        return render_template('res.html', prediction=None)

@app.route('/models', methods=['GET'])
def get_models():
    make = request.args.get('make')
    filtered_models = car_data[car_data['Make'] == make]['Model'].unique()
    return jsonify(list(filtered_models))

@app.route('/types', methods=['GET'])
def get_types():
    model = request.args.get('model')
    car_type = car_data[car_data['Model'] == model]['Type'].values[0]
    return jsonify({'type': car_type})

@app.route('/seats', methods=['GET'])
def get_seats():
    model = request.args.get('model')
    seats = car_data[car_data['Model'] == model]['Seats'].values[0]
    return jsonify({'seats': seats})

@app.route('/engine', methods=['GET'])
def get_engine():
    brand = request.args.get('brand')
    model = request.args.get('model')
    engine = car_data[(car_data['Make'] == brand) & (car_data['Model'] == model)]['engine'].values[0]
    return jsonify({'engine': engine})


if __name__ == '__main__':
    app.run(debug=True)
