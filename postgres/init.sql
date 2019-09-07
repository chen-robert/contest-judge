CREATE DATABASE contest;

\connect contest 

CREATE TABLE users(id SERIAL PRIMARY KEY, username TEXT not null, email TEXT not null, password TEXT not null, division TEXT not null);
CREATE TABLE solves(user_id INTEGER not null, problem TEXT not null, status TEXT not null, time BIGINT not null);
INSERT INTO users(username, email, password, division) VALUES('admin', '', '$2y$12$Y4NqIDHjqbkpc8ZoCzAKUukwK0vFWilDToV0bAnLwOcQ6ZKfDh56W', 'advanced');
