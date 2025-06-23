import React, { useState, useEffect } from 'react';
import { auctionAPI } from '../api/auction';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const data = await auctionAPI.getAllMyBids();
        setBids(data);
      } catch (err) {
        console.error('Error fetching bids:', err);
        setError(err.message || 'Failed to load bids');
        toast.error(err.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
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

  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't placed any bids yet</p>
        <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
          Browse products
        </Link>
      </div>
    );
  }

  // Group bids by product and find the highest bid for each product
  const highestBidIdsByProduct = {};
  bids.forEach((bid) => {
    const productId = bid.product_id?._id || bid.product_id;
    if (!highestBidIdsByProduct[productId] || bid.bid_amount > highestBidIdsByProduct[productId].amount) {
      highestBidIdsByProduct[productId] = { id: bid._id, amount: bid.bid_amount };
    }
  });

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">My Bids</h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {bids.map((bid) => {
          const productId = bid.product_id?._id || bid.product_id;
          const isProductSold = bid.product_id?.sold;
          const isHighest = highestBidIdsByProduct[productId]?.id === bid._id;

          let statusText = '';
          let statusClass = '';

          if (isProductSold && isHighest) {
            statusText = 'Bid Accepted';
            statusClass = 'bg-blue-100 text-blue-800';
          } else if (isHighest) {
            statusText = 'Current Highest';
            statusClass = 'bg-green-100 text-green-800';
          } else {
            statusText = 'Outbid';
            statusClass = 'bg-gray-100 text-gray-800';
          }

          return (
            <li key={bid._id || bid.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${productId}`} className="block hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          bid.product_id &&
                          bid.product_id.images &&
                          bid.product_id.images.length > 0 &&
                          bid.product_id.images[0].image
                            ? bid.product_id.images[0].image
                            : "https://via.placeholder.com/100x100?text=No+Image"
                        }
                        alt={bid.product_id?.title || "Product"}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {bid.product_id?.title || "Product"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Your bid: Rs. {bid.bid_amount != null ? Number(bid.bid_amount).toLocaleString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Starting price: Rs. {bid.product_id?.starting_price != null ? Number(bid.product_id.starting_price).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                  >
                    {statusText}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MyBids; 