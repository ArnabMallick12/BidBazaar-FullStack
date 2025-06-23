import React, { useState, useEffect } from 'react';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

function getProductStatus(product) {
  const now = new Date();
  if (product.sold) return "Sold";
  if (now < new Date(product.start_date)) return "Upcoming";
  if (now > new Date(product.end_date)) return "Expired";
  if (now >= new Date(product.start_date) && now <= new Date(product.end_date)) return "Active";
  return "Unknown";
}

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getMyListings();
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load listings');
        toast.error(err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't listed any products yet</p>
        <Link to="/sell" className="text-blue-600 hover:underline mt-2 inline-block">
          List a product
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">My Listings</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {listings.map((listing) => (
          <li key={listing.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Link to={`/product/${listing.id || listing._id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img
                      src={listing.images[0]?.image || "https://via.placeholder.com/100x100?text=No+Image"}
                      alt={listing.name}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {listing.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Starting price: Rs. {listing.starting_price}
                      </p>
                      <p className="text-sm text-gray-500">
                        Current price: Rs. {listing.highest_bid_id?.bid_amount || listing.starting_price}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getProductStatus(listing) === "Active"
                      ? "bg-green-100 text-green-800"
                      : getProductStatus(listing) === "Upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : getProductStatus(listing) === "Sold"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getProductStatus(listing)}
                  
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  {listing.bids_count != null ? listing.bids_count : '0'} bids
                </p>
                <p className="text-xs text-gray-500">
                  Ends: {
                    listing.end_date && !isNaN(new Date(listing.end_date))
                      ? new Date(listing.end_date).toLocaleString()
                      : (listing.end_time && !isNaN(new Date(listing.end_time))
                        ? new Date(listing.end_time).toLocaleString()
                        : 'N/A')
                  }
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyListings; 