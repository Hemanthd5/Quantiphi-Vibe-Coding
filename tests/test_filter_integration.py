"""
Comprehensive Integration Tests for E-Commerce Product Multi-Filter System
Tests server-side combinatorial filtering, null handling, and sorting logic.
"""

import unittest
import json
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, PRODUCTS


class TestProductFilterIntegration(unittest.TestCase):
    """Integration tests for the product filtering and sorting system."""

    def setUp(self):
        """Set up test client before each test."""
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

    def test_null_filters_return_full_dataset(self):
        """
        Test Case 1: Graceful Null Handling
        When all filters are empty/null, backend must return full inventory.
        """
        # Test with empty POST body
        response = self.client.post(
            '/api/products',
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Should return all products
        self.assertEqual(len(data['products']), len(PRODUCTS))
        self.assertEqual(data['count'], len(PRODUCTS))
        
        # Test with explicit None values
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        self.assertEqual(data['count'], len(PRODUCTS))
        
        # Test with GET request (no parameters)
        response = self.client.get('/api/products')
        data = json.loads(response.data)
        self.assertEqual(data['count'], len(PRODUCTS))

    def test_combinatorial_intersect_filtering(self):
        """
        Test Case 2: Combinatorial Intersect Filtering
        Items must satisfy ALL active filter criteria simultaneously.
        """
        # Test 1: Category filter only
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['Electronics'],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # All returned products must be Electronics
        for product in data['products']:
            self.assertEqual(product['category'], 'Electronics')
        
        # Test 2: Price range filter only
        min_price_test = 50
        max_price_test = 100
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': min_price_test,
                'max_price': max_price_test,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # All returned products must be within price range
        for product in data['products']:
            self.assertGreaterEqual(product['price'], min_price_test)
            self.assertLessEqual(product['price'], max_price_test)
        
        # Test 3: Rating filter only
        min_rating_test = 4.5
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': None,
                'max_price': None,
                'min_rating': min_rating_test,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # All returned products must meet minimum rating
        for product in data['products']:
            self.assertGreaterEqual(product['rating'], min_rating_test)
        
        # Test 4: ALL filters active (combinatorial intersect)
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['Electronics', 'Footwear'],
                'min_price': 60,
                'max_price': 150,
                'min_rating': 4.0,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # All products must satisfy ALL three criteria
        for product in data['products']:
            # Check category membership
            self.assertIn(product['category'], ['Electronics', 'Footwear'])
            # Check price bounds
            self.assertGreaterEqual(product['price'], 60)
            self.assertLessEqual(product['price'], 150)
            # Check rating threshold
            self.assertGreaterEqual(product['rating'], 4.0)

    def test_tight_limit_conditions(self):
        """
        Test Case 3: Tight Limit Conditions
        Edge cases with extreme filter boundaries.
        """
        # Test 1: Very tight price range
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': 99.95,
                'max_price': 100.05,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # Should return limited or zero results
        for product in data['products']:
            self.assertGreaterEqual(product['price'], 99.95)
            self.assertLessEqual(product['price'], 100.05)
        
        # Test 2: Maximum rating filter (5 stars only)
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': None,
                'max_price': None,
                'min_rating': 5.0,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        for product in data['products']:
            self.assertGreaterEqual(product['rating'], 5.0)
        
        # Test 3: Single category with tight constraints
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['Accessories'],
                'min_price': 200,
                'max_price': 250,
                'min_rating': 4.8,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # May return zero results (valid outcome)
        for product in data['products']:
            self.assertEqual(product['category'], 'Accessories')
            self.assertGreaterEqual(product['price'], 200)
            self.assertLessEqual(product['price'], 250)
            self.assertGreaterEqual(product['rating'], 4.8)
        
        # Test 4: Inverted price range (should auto-correct)
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': 150,
                'max_price': 50,  # Inverted!
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # Backend should swap values and return products in 50-150 range
        for product in data['products']:
            self.assertGreaterEqual(product['price'], 50)
            self.assertLessEqual(product['price'], 150)

    def test_server_side_sorting_pipeline(self):
        """
        Test Case 4: Server-Side Sorting Pipeline
        Backend must filter FIRST, then apply sorting logic.
        """
        # Test 1: Price Low to High
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'price_low_to_high'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # Verify ascending price order
        prices = [p['price'] for p in data['products']]
        self.assertEqual(prices, sorted(prices))
        
        # Test 2: Top Rated First
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'top_rated_first'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # Verify descending rating order
        ratings = [p['rating'] for p in data['products']]
        self.assertEqual(ratings, sorted(ratings, reverse=True))
        
        # Test 3: Sorting with active filters (pipeline test)
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['Apparel'],
                'min_price': 30,
                'max_price': 100,
                'min_rating': 4.0,
                'sort_by': 'price_low_to_high'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # Verify all filters applied
        for product in data['products']:
            self.assertEqual(product['category'], 'Apparel')
            self.assertGreaterEqual(product['price'], 30)
            self.assertLessEqual(product['price'], 100)
            self.assertGreaterEqual(product['rating'], 4.0)
        
        # Verify sorting applied after filtering
        prices = [p['price'] for p in data['products']]
        self.assertEqual(prices, sorted(prices))

    def test_zero_results_scenario(self):
        """
        Test Case 5: Zero Results Handling
        When no products match criteria, return empty array gracefully.
        """
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['NonExistentCategory'],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Should return empty list, not error
        self.assertEqual(len(data['products']), 0)
        self.assertEqual(data['count'], 0)
        
        # Test impossible price range
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': 10000,
                'max_price': 20000,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        self.assertEqual(data['count'], 0)

    def test_multiple_categories_union(self):
        """
        Test Case 6: Multiple Category Selection
        Multiple categories should use OR logic (union).
        """
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': ['Electronics', 'Home'],
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        # All products must be from one of the selected categories
        for product in data['products']:
            self.assertIn(product['category'], ['Electronics', 'Home'])
        
        # Count should be sum of both categories
        electronics_count = len([p for p in PRODUCTS if p['category'] == 'Electronics'])
        home_count = len([p for p in PRODUCTS if p['category'] == 'Home'])
        expected_count = electronics_count + home_count
        self.assertEqual(data['count'], expected_count)

    def test_data_type_normalization(self):
        """
        Test Case 7: Input Validation and Type Normalization
        Backend must handle various input formats gracefully.
        """
        # Test string numbers
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': [],
                'min_price': "50",  # String instead of number
                'max_price': "150",
                'min_rating': "4.0",
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Should parse strings to numbers correctly
        for product in data['products']:
            self.assertGreaterEqual(product['price'], 50)
            self.assertLessEqual(product['price'], 150)
        
        # Test single category as string (not array)
        response = self.client.post(
            '/api/products',
            data=json.dumps({
                'categories': 'Electronics',  # String instead of array
                'min_price': None,
                'max_price': None,
                'min_rating': None,
                'sort_by': 'featured'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        # Should handle single string as single-item array
        for product in data['products']:
            self.assertEqual(product['category'], 'Electronics')


def run_tests():
    """Run all tests with detailed output."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestProductFilterIntegration)
    
    # Run with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "="*70)
    print("INTEGRATION TEST SUMMARY")
    print("="*70)
    print(f"Tests Run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print("="*70)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
