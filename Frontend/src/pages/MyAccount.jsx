import React from 'react';
import MyBids from '../components/MyBids';
import MyListings from '../components/MyListings';
import { authAPI } from '../api/auth';
import { Navigate } from 'react-router-dom';

const MyAccount = () => {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Account</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="text-sm font-medium text-gray-900">
                  {authAPI.getCurrentUser()?.username}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {authAPI.getCurrentUser()?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Activity</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Bids</h3>
              <MyBids />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Listings</h3>
              <MyListings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount; 