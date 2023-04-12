DROP TABLE IF EXISTS order_product;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS delivery_job;
DROP TABLE IF EXISTS product_review;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS platform_review;
DROP TABLE IF EXISTS platform;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS delivery_status;
DROP TYPE IF EXISTS platform_status;
DROP TYPE IF EXISTS user_types;


CREATE TYPE user_types AS ENUM(
    'ADMIN',
    'PROVIDER',
    'CONSUMER',
    'DELIVERY'
);

CREATE TYPE platform_status AS ENUM(
    'LIST_ITEMS',
    'DELIVERY',
    'PAYMENT_GATEWAY',
    'DOWNTIME'
);

CREATE TYPE delivery_status AS ENUM(
    'ACTIVE',
    'INACTIVE',
    'WORKING'
);

CREATE TYPE order_status AS ENUM(
    'PLACED',
    'CONFIRMED',
    'PICKUP',
    'SHIPPED',
    'DELIVERED',
    'TAKE',
    'RETURNED',
    'RECEIVED',
    'CANCELLED'
);

CREATE TYPE payment_status AS ENUM(
    'PAYMENT_INIT',
    'PAYMENT_PROCESSING',
    'PAYMENT_CONFIRMED',
    'REFUND_PROCESSING',
    'REFUND_CONFIRMED'
);

CREATE TYPE payment_method AS ENUM(
    'CASH_ON_DELIVERY',
    'ONLINE_TRANSACTION'
);

CREATE TABLE users (
    user_id SERIAL NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    password character varying NOT NULL,
    user_address jsonb NOT NULL DEFAULT '{}',
    user_type user_types NOT NULL DEFAULT 'CONSUMER',
    PRIMARY KEY (user_id),
    UNIQUE (username)
);

CREATE TABLE platform (
    platform_id SERIAL NOT NULL,
    name character varying NOT NULL,
    image character varying NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    user_id int,
    categories jsonb NOT NULL DEFAULT '[]',
    platform_status platform_status NOT NULL DEFAULT 'DOWNTIME',
    platform_address jsonb NOT NULL DEFAULT '{}',
    PRIMARY KEY (platform_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (name)
);

CREATE TABLE platform_review (
    platform_review_id SERIAL NOT NULL,
    comment text NOT NULL DEFAULT '',
    rating integer NOT NULL DEFAULT '0',
    user_id integer,
    platform_id integer,
    PRIMARY KEY (platform_review_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platform(platform_id) ON DELETE CASCADE
);

CREATE TABLE product (
    product_id SERIAL NOT NULL,
    name character varying NOT NULL,
    image character varying NOT NULL DEFAULT '',
    brand character varying NOT NULL,
    category character varying NOT NULL,
    description text NOT NULL DEFAULT '',
    price numeric(10, 2) NOT NULL DEFAULT '0',
    stock_count integer NOT NULL DEFAULT '0',
    platform_id integer,
    PRIMARY KEY (product_id),
    FOREIGN KEY (platform_id) REFERENCES platform(platform_id) ON DELETE CASCADE,
    UNIQUE (name, brand, category, platform_id)
);

CREATE TABLE product_review (
    product_review_id SERIAL NOT NULL,
    comment text NOT NULL DEFAULT '',
    rating integer NOT NULL DEFAULT '0',
    user_id integer,
    product_id integer,
    PRIMARY KEY (product_review_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);

CREATE TABLE delivery_job (
    delivery_job_id SERIAL NOT NULL,
    salary numeric(10, 2) NOT NULL DEFAULT '0',
    delivery_status delivery_status NOT NULL DEFAULT 'INACTIVE',
    user_id integer,
    platform_id integer,
    PRIMARY KEY (delivery_job_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platform(platform_id) ON DELETE CASCADE,
    UNIQUE (user_id, platform_id)
);

CREATE TABLE orders (
    order_id SERIAL NOT NULL,
    shipping_address jsonb NOT NULL DEFAULT '{}',
    tax_price numeric(10, 2) NOT NULL DEFAULT '0',
    shipping_price numeric(10, 2) NOT NULL DEFAULT '0',
    order_price numeric(10, 2) NOT NULL DEFAULT '0',
    total_price numeric(10, 2) NOT NULL DEFAULT '0',
    order_status order_status NOT NULL DEFAULT 'PLACED',
    payment_status payment_status NOT NULL DEFAULT 'PAYMENT_INIT',
    payment_method payment_method NOT NULL DEFAULT 'CASH_ON_DELIVERY',
    user_id integer,
    platform_id integer,
    delivery_job_id integer,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platform(platform_id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_job_id) REFERENCES delivery_job(delivery_job_id) ON DELETE SET NULL
);

CREATE TABLE order_product (
    order_product_id SERIAL NOT NULL,
    quantity integer NOT NULL DEFAULT '1',
    order_id integer,
    product_id integer,
    PRIMARY KEY (order_product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE SET NULL,
    UNIQUE (order_id, product_id)
);
