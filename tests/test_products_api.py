import unittest

from app import _filter_products, _normalize_filters, _sort_products, PRODUCTS


class ProductFilterTests(unittest.TestCase):
    def test_null_filters_return_full_inventory(self):
        filters = _normalize_filters({})
        result = _filter_products(PRODUCTS, filters)
        self.assertEqual(len(result), len(PRODUCTS))

    def test_tight_filter_returns_no_results(self):
        filters = _normalize_filters({
            "categories": ["Electronics"],
            "min_price": 300,
            "max_price": 400,
            "min_rating": 5,
            "sort_by": "price_low_to_high",
        })
        result = _filter_products(PRODUCTS, filters)
        self.assertEqual(result, [])

    def test_sorting_state_applies_after_filtering(self):
        filters = _normalize_filters({
            "categories": ["Footwear"],
            "min_price": 0,
            "max_price": 200,
            "min_rating": 4.5,
            "sort_by": "top_rated_first",
        })
        filtered = _filter_products(PRODUCTS, filters)
        sorted_result = _sort_products(filtered, filters["sort_by"])
        self.assertTrue(sorted_result[0]["rating"] >= sorted_result[-1]["rating"])
        self.assertTrue(all(item["category"] == "Footwear" for item in sorted_result))


if __name__ == "__main__":
    unittest.main()
