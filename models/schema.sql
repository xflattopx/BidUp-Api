CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'customer' or 'driver'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE, -- Foreign key referencing the users table
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE, -- Foreign key referencing the users table
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE delivery_requests (
  id SERIAL PRIMARY KEY,
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  preferred_delivery_time TIMESTAMPTZ NOT NULL,
  price_offer NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending',
  user_id INT, -- Updated foreign key referencing the users table via customers
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  driver_id INT, -- Foreign key referencing the drivers table
  delivery_request_id INT, -- Foreign key referencing the delivery_requests table
  bid_price NUMERIC NOT NULL,
  bid_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver FOREIGN KEY (driver_id) REFERENCES drivers(user_id)
,
  CONSTRAINT fk_delivery_request FOREIGN KEY (delivery_request_id) REFERENCES delivery_requests(id) -- Updated foreign key
);

CREATE TABLE winning_bids (
  delivery_request_id INT PRIMARY KEY,
  bid_id INT, -- Foreign key referencing the bids table
  FOREIGN KEY (bid_id) REFERENCES bids(id),
  FOREIGN KEY (delivery_request_id) REFERENCES delivery_requests(id) -- Updated foreign key
);

-- Add bid_end_time column to track bid expiration time
ALTER TABLE delivery_requests
ADD COLUMN bid_end_time TIMESTAMPTZ;

-- Add status column to track bid status (e.g., 'Pending', 'Sold')
ALTER TABLE bids
ADD COLUMN status VARCHAR(50) DEFAULT 'Pending';
