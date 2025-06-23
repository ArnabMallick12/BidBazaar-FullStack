import React from 'react';

const BidHistory = ({ bids }) => {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bids placed yet</p>
      </div>
    );
  }

  const highestBidId = bids.length > 0
    ? bids.reduce((max, bid) => bid.bid_amount > max.amount ? { id: bid._id, amount: bid.bid_amount } : max, { id: null, amount: -Infinity }).id
    : null;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <ul className="divide-y divide-gray-200">
        {bids.map((bid) => (
          <li key={bid._id || bid.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-600">
                    Rs. {bid.bid_amount != null ? Number(bid.bid_amount).toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bid.bid_time ? new Date(bid.bid_time).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">
                    Bid by {bid.user_id?.username || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bid._id === highestBidId
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {bid._id === highestBidId ? 'Current Highest' : 'Outbid'}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BidHistory; 