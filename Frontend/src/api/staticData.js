// Static data for the entire application
export const staticData = {
  // Products data
  products: [
    {
      id: 1,
      name: "Vintage Camera",
      description: "Classic film camera from the 1980s, perfect condition",
      starting_price: 150.00,
      current_price: 180.00,
      end_time: "2024-12-31T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
      seller: {
        id: 1,
        username: "camera_collector",
        rating: 4.8
      },
      category: "Electronics",
      condition: "Used - Like New",
      bids_count: 3,
      is_listed: true
    },
    {
      id: 2,
      name: "Antique Watch",
      description: "Swiss-made mechanical watch from 1965",
      starting_price: 500.00,
      current_price: 650.00,
      end_time: "2024-12-30T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      seller: {
        id: 2,
        username: "watch_expert",
        rating: 4.9
      },
      category: "Jewelry",
      condition: "Used - Excellent",
      bids_count: 5,
      is_listed: true
    },
    {
      id: 3,
      name: "Gaming Console",
      description: "Latest gaming console with 2 controllers",
      starting_price: 400.00,
      current_price: 450.00,
      end_time: "2024-12-29T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1486401899868-0e435ed85128",
      seller: {
        id: 3,
        username: "gaming_enthusiast",
        rating: 4.7
      },
      category: "Electronics",
      condition: "New",
      bids_count: 2,
      is_listed: true
    },
    {
      id: 4,
      name: "Designer Handbag",
      description: "Authentic designer handbag, limited edition",
      starting_price: 800.00,
      current_price: 950.00,
      end_time: "2024-12-28T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      seller: {
        id: 4,
        username: "fashion_collector",
        rating: 4.9
      },
      category: "Fashion",
      condition: "New with Tags",
      bids_count: 4,
      is_listed: true
    },
    {
      id: 5,
      name: "Vintage Guitar",
      description: "1960s electric guitar, excellent condition",
      starting_price: 1200.00,
      current_price: 1500.00,
      end_time: "2024-12-27T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1",
      seller: {
        id: 5,
        username: "music_collector",
        rating: 4.8
      },
      category: "Musical Instruments",
      condition: "Used - Excellent",
      bids_count: 6,
      is_listed: true
    }
  ],

  // Bids data
  bids: [
    {
      id: 1,
      product_id: 1,
      bidder: {
        id: 6,
        username: "bidder1",
        rating: 4.5
      },
      amount: 180.00,
      created_at: "2024-03-15T10:30:00Z",
      status: "active"
    },
    {
      id: 2,
      product_id: 1,
      bidder: {
        id: 7,
        username: "bidder2",
        rating: 4.7
      },
      amount: 170.00,
      created_at: "2024-03-15T09:15:00Z",
      status: "outbid"
    },
    {
      id: 3,
      product_id: 2,
      bidder: {
        id: 8,
        username: "bidder3",
        rating: 4.8
      },
      amount: 650.00,
      created_at: "2024-03-15T11:45:00Z",
      status: "active"
    },
    {
      id: 4,
      product_id: 3,
      bidder: {
        id: 9,
        username: "bidder4",
        rating: 4.6
      },
      amount: 450.00,
      created_at: "2024-03-15T12:20:00Z",
      status: "active"
    },
    {
      id: 5,
      product_id: 4,
      bidder: {
        id: 10,
        username: "bidder5",
        rating: 4.9
      },
      amount: 950.00,
      created_at: "2024-03-15T13:10:00Z",
      status: "active"
    }
  ],

  // User's bids
  userBids: [
    {
      id: 6,
      product_id: 1,
      amount: 175.00,
      created_at: "2024-03-15T08:45:00Z",
      status: "outbid",
      product: {
        id: 1,
        name: "Vintage Camera",
        image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
        current_price: 180.00
      }
    },
    {
      id: 7,
      product_id: 3,
      amount: 425.00,
      created_at: "2024-03-15T10:20:00Z",
      status: "outbid",
      product: {
        id: 3,
        name: "Gaming Console",
        image_url: "https://images.unsplash.com/photo-1486401899868-0e435ed85128",
        current_price: 450.00
      }
    }
  ],

  // User's listings
  userListings: [
    {
      id: 2,
      name: "Antique Watch",
      description: "Swiss-made mechanical watch from 1965",
      starting_price: 500.00,
      current_price: 650.00,
      end_time: "2024-12-30T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d",
      category: "Jewelry",
      condition: "Used - Excellent",
      bids_count: 5,
      is_listed: true
    },
    {
      id: 4,
      name: "Designer Handbag",
      description: "Authentic designer handbag, limited edition",
      starting_price: 800.00,
      current_price: 950.00,
      end_time: "2024-12-28T23:59:59Z",
      image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
      category: "Fashion",
      condition: "New with Tags",
      bids_count: 4,
      is_listed: true
    }
  ],

  // Categories
  categories: [
    "Electronics",
    "Jewelry",
    "Fashion",
    "Musical Instruments",
    "Art",
    "Collectibles",
    "Sports",
    "Books"
  ],

  // Conditions
  conditions: [
    "New",
    "New with Tags",
    "Used - Like New",
    "Used - Excellent",
    "Used - Good",
    "Used - Fair"
  ]
}; 