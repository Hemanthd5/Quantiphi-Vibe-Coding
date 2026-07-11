from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


def _generate_products():
    catalog = []
    templates = [
        {
            "category": "Electronics",
            "base_names": ["Aurora", "Nimbus", "Vertex", "Pulse", "Quantum", "Orbit", "Nova", "Lumen", "Kinetic", "Helix"],
            "base_prices": [49.99, 79.0, 119.95, 149.99, 199.0, 249.5, 89.99, 129.0, 159.0, 219.0],
            "items": ["Watch", "Speaker", "Keyboard", "Headphones", "Mouse", "Laptop Stand", "Camera", "Tablet", "Monitor", "Charger"],
            "images": [
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=300&q=80",
            ],
        },
        {
            "category": "Apparel",
            "base_names": ["Pioneer", "Summit", "Harbor", "Breeze", "Northstar", "Cedar", "Drift", "Mariner", "Horizon", "Solace"],
            "base_prices": [29.0, 45.5, 54.0, 69.0, 79.0, 99.0, 35.0, 59.0, 88.0, 110.0],
            "items": ["Hoodie", "Jacket", "Shirt", "Sweater", "Cap", "Coat", "Puffer", "Trouser", "Blazer", "Socks"],
            "images": [
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=80",
            ],
        },
        {
            "category": "Footwear",
            "base_names": ["Nova", "Terra", "Nimbus", "Apex", "Crest", "Ridge", "Atlas", "Vega", "Glacier", "Mistral"],
            "base_prices": [39.5, 54.0, 79.0, 89.5, 109.0, 124.0, 64.5, 99.0, 134.0, 149.0],
            "items": ["Runner", "Sandals", "Sneakers", "Hiker", "Court Shoes", "Boot", "Loafer", "Slip-On", "Trail Shoe", "Climber"],
            "images": [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=300&q=80",
            ],
        },
        {
            "category": "Accessories",
            "base_names": ["Luma", "Cedar", "Glacier", "Studio", "Harbor", "Orbit", "Sequoia", "Meadow", "Rogue", "Echo"],
            "base_prices": [19.95, 24.5, 34.0, 44.0, 59.0, 74.0, 84.0, 92.0, 102.0, 129.0],
            "items": ["Backpack", "Bottle", "Tote", "Pillow", "Mug", "Sunglasses", "Watchband", "Scarf", "Wallet", "Travel Kit"],
            "images": [
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=300&q=80",
            ],
        },
        {
            "category": "Home",
            "base_names": ["Drift", "Solstice", "Mesa", "Harbor", "Cove", "Linen", "Marlow", "Fjord", "Aster", "Eden"],
            "base_prices": [18.0, 29.99, 39.99, 49.5, 69.0, 89.0, 99.0, 129.0, 159.0, 179.0],
            "items": ["Desk Lamp", "Ceramic Vase", "Office Chair", "Coffee Mug", "Throw Blanket", "Table Lamp", "Scented Candle", "Decor Set", "Side Table", "Wall Clock"],
            "images": [
                "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80",
            ],
        },
    ]

    for template_index, template in enumerate(templates):
        for item_index in range(20):
            price = template["base_prices"][item_index % len(template["base_prices"])] + (item_index * 3.5)
            rating = round(3.8 + ((item_index + template_index) % 10) * 0.12, 1)
            catalog.append({
                "id": len(catalog) + 1,
                "name": f"{template['base_names'][item_index % len(template['base_names'])]} {template['items'][item_index % len(template['items'])]}",
                "category": template["category"],
                "price": round(price, 2),
                "rating": rating,
                "image_thumbnail": template["images"][item_index % len(template["images"])],
            })

    return catalog


PRODUCTS = _generate_products()


def _normalize_string_list(value):
    if value is None:
        return []
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return []


def _safe_float(value, default=None):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_filters(payload):
    if not isinstance(payload, dict):
        payload = {}

    categories = _normalize_string_list(payload.get("categories"))
    min_price = _safe_float(payload.get("min_price"), None)
    max_price = _safe_float(payload.get("max_price"), None)
    min_rating = _safe_float(payload.get("min_rating"), None)
    sort_by = str(payload.get("sort_by") or "featured").strip().lower()

    if min_price is not None and max_price is not None and min_price > max_price:
        min_price, max_price = max_price, min_price

    return {
        "categories": categories,
        "min_price": min_price,
        "max_price": max_price,
        "min_rating": min_rating,
        "sort_by": sort_by,
    }


def _has_active_filters(filters):
    return bool(filters["categories"]) or filters["min_price"] is not None or filters["max_price"] is not None or filters["min_rating"] is not None


def _filter_products(products, filters):
    if not _has_active_filters(filters):
        return list(products)

    filtered = []
    for product in products:
        category_match = True
        if filters["categories"]:
            category_match = product.get("category") in filters["categories"]

        price_match = True
        if filters["min_price"] is not None:
            price_match = product.get("price", 0) >= filters["min_price"]
        if price_match and filters["max_price"] is not None:
            price_match = product.get("price", 0) <= filters["max_price"]

        rating_match = True
        if filters["min_rating"] is not None:
            rating_match = product.get("rating", 0) >= filters["min_rating"]

        if category_match and price_match and rating_match:
            filtered.append(product)

    return filtered


def _sort_products(products, sort_by):
    if sort_by == "price_low_to_high":
        return sorted(products, key=lambda item: (item.get("price", 0), item.get("id", 0)))

    if sort_by == "top_rated_first":
        return sorted(products, key=lambda item: (-item.get("rating", 0), item.get("price", 0), item.get("id", 0)))

    return sorted(products, key=lambda item: item.get("id", 0))


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


@app.route("/api/products", methods=["GET", "POST"])
def products():
    payload = request.get_json(silent=True) if request.method == "POST" else request.args.to_dict()
    filters = _normalize_filters(payload)

    base_products = list(PRODUCTS)
    filtered_products = _filter_products(base_products, filters)
    sorted_products = _sort_products(filtered_products, filters["sort_by"])

    return jsonify({
        "products": sorted_products,
        "count": len(sorted_products),
        "filters": filters,
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
